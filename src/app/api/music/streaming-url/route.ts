import { NextRequest, NextResponse } from "next/server";

const LASTFM_API_KEY = process.env.LASTFM_API_KEY || "43693f63a309e7a0326e2d97a8e8dc6c";

/**
 * Get canonical track info from Last.fm with autocorrect
 * This ensures we're searching for the exact track Last.fm knows about
 */
async function getCanonicalTrackInfo(artist: string, track: string) {
    const params = new URLSearchParams({
        method: "track.getInfo",
        api_key: LASTFM_API_KEY,
        artist: artist,
        track: track,
        format: "json",
        autocorrect: "1",
    });

    const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`,
        { next: { revalidate: 86400 } }
    );

    if (response.ok) {
        const data = await response.json();
        if (data.track && !data.error) {
            return {
                artist: data.track.artist?.name || artist,
                track: data.track.name || track,
                album: data.track.album?.title,
            };
        }
    }

    return { artist, track, album: null };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const artist = searchParams.get("artist");
    const track = searchParams.get("track");
    const type = searchParams.get("type") as "single" | "album" | null;
    const platform = searchParams.get("platform");

    if (!artist || !track || !platform) {
        return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
        );
    }

    try {
        // Get canonical track info from Last.fm first
        const canonicalInfo = await getCanonicalTrackInfo(artist, track);
        let url: string | null = null;

        if (platform === "apple") {
            // Helper function to normalize artist names (used for both albums and tracks)
            const normalizeArtist = (name: string) => {
                return name
                    .toLowerCase()
                    .replace(/\s*feat\.?\s*/gi, '')
                    .replace(/\s*ft\.?\s*/gi, '')
                    .replace(/\s*&\s*/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            };

            // Helper function to check if artist names match (strict matching)
            const artistMatches = (result: any) => {
                const resultArtist = normalizeArtist(result.artistName || "");
                const searchArtist = normalizeArtist(canonicalInfo.artist);

                // Exact match after normalization
                if (resultArtist === searchArtist) return true;

                // Check if search artist is the main artist (before "feat")
                const mainSearchArtist = searchArtist.split(/,|feat|ft/)[0].trim();
                const mainResultArtist = resultArtist.split(/,|feat|ft/)[0].trim();

                // Both main artists should match
                if (mainSearchArtist === mainResultArtist) return true;

                // Check if one is a substring but only if it's a significant portion
                const minLength = Math.min(resultArtist.length, searchArtist.length);
                if (minLength > 5) {
                    if (resultArtist.startsWith(searchArtist) || searchArtist.startsWith(resultArtist)) {
                        return true;
                    }
                }

                return false;
            };

            // Helper function to check if track names match (strict)
            const trackMatches = (result: any) => {
                const resultTrack = (result.trackName || "").toLowerCase().trim();
                const searchTrack = canonicalInfo.track.toLowerCase().trim();

                // Exact match
                if (resultTrack === searchTrack) return true;

                // Remove common suffixes for comparison
                const cleanResult = resultTrack.replace(/\s*\(.*?\)\s*/g, '').trim();
                const cleanSearch = searchTrack.replace(/\s*\(.*?\)\s*/g, '').trim();

                if (cleanResult === cleanSearch) return true;

                // Only allow partial match if one is clearly contained in the other AND they're similar length
                const lengthRatio = Math.min(resultTrack.length, searchTrack.length) / Math.max(resultTrack.length, searchTrack.length);
                if (lengthRatio > 0.7) {
                    if (resultTrack.includes(searchTrack) || searchTrack.includes(resultTrack)) {
                        return true;
                    }
                }

                return false;
            };

            // For albums, search directly for the album with strict matching
            if (type === "album") {
                const searchQuery = encodeURIComponent(`${canonicalInfo.artist} ${canonicalInfo.track}`);
                const response = await fetch(
                    `https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=10`,
                    { next: { revalidate: 86400 } }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        // Find exact album match using STRICT artist matching
                        const albumMatch = data.results.find((result: any) => {
                            // Use the same strict artist matching function
                            if (!artistMatches(result)) return false;

                            // Check album name match (more lenient for albums)
                            const resultAlbum = (result.collectionName || "").toLowerCase().trim();
                            const searchAlbum = canonicalInfo.track.toLowerCase().trim();

                            // Remove common album suffixes and extra info for comparison
                            const cleanResult = resultAlbum
                                .replace(/\s*\(deluxe.*?\)/gi, '')
                                .replace(/\s*\(explicit.*?\)/gi, '')
                                .replace(/\s*\(expanded.*?\)/gi, '')
                                .replace(/\s*\(remastered.*?\)/gi, '')
                                .replace(/\s*\[.*?\]/g, '')
                                .replace(/\s*-\s*ep$/gi, '')
                                .trim();
                            const cleanSearch = searchAlbum
                                .replace(/\s*\(deluxe.*?\)/gi, '')
                                .replace(/\s*\(explicit.*?\)/gi, '')
                                .replace(/\s*\(expanded.*?\)/gi, '')
                                .replace(/\s*\(remastered.*?\)/gi, '')
                                .replace(/\s*\[.*?\]/g, '')
                                .replace(/\s*-\s*ep$/gi, '')
                                .trim();

                            // Exact match after cleaning
                            if (cleanResult === cleanSearch) return true;

                            // Check if album name is contained or contains (for short album names like "2005")
                            if (cleanResult.includes(cleanSearch) || cleanSearch.includes(cleanResult)) {
                                // For short names (like "2005"), be more strict
                                if (cleanSearch.length <= 10) {
                                    // Must be a significant portion of the result
                                    const lengthRatio = cleanSearch.length / cleanResult.length;
                                    if (lengthRatio > 0.5) return true;
                                } else {
                                    // For longer names, allow if 60%+ similar
                                    const lengthRatio = Math.min(cleanResult.length, cleanSearch.length) /
                                        Math.max(cleanResult.length, cleanSearch.length);
                                    if (lengthRatio > 0.6) return true;
                                }
                            }

                            return false;
                        });

                        if (albumMatch) {
                            url = albumMatch.collectionViewUrl;
                        }
                    }
                }

                // If no exact match found, fall back to search
                if (!url) {
                    const fallbackQuery = encodeURIComponent(`${canonicalInfo.artist} ${canonicalInfo.track}`);
                    url = `https://music.apple.com/us/search?term=${fallbackQuery}`;
                }
            } else {
                // For singles/tracks - try multiple search strategies for better matching

                // Strategy 1: Search with artist and track - must match BOTH artist AND track
                let searchQuery = encodeURIComponent(`${canonicalInfo.artist} ${canonicalInfo.track}`);
                let response = await fetch(
                    `https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=10`,
                    { next: { revalidate: 86400 } }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        // ONLY accept if BOTH artist AND track match - no more random picks
                        const exactMatch = data.results.find((result: any) =>
                            artistMatches(result) && trackMatches(result)
                        );

                        if (exactMatch) {
                            url = exactMatch.trackViewUrl;
                        }
                        // Don't accept results that don't match both criteria
                    }
                }

                // Strategy 2: If no results and we have album info, search by album
                if (!url && canonicalInfo.album) {
                    searchQuery = encodeURIComponent(`${canonicalInfo.artist} ${canonicalInfo.album}`);
                    response = await fetch(
                        `https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=20`,
                        { next: { revalidate: 86400 } }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.results && data.results.length > 0) {
                            // MUST match both artist AND track - no random album tracks
                            const trackMatch = data.results.find((result: any) =>
                                artistMatches(result) && trackMatches(result)
                            );

                            if (trackMatch) {
                                url = trackMatch.trackViewUrl;
                            }
                            // Don't accept partial matches anymore
                        }
                    }
                }

                // Strategy 3: If still no match, use Apple Music search URL as fallback
                if (!url) {
                    const fallbackQuery = encodeURIComponent(`${canonicalInfo.artist} ${canonicalInfo.track}`);
                    url = `https://music.apple.com/us/search?term=${fallbackQuery}`;
                }
            } // End of singles/tracks block
        } else if (platform === "youtube") {
            // Use YouTube search with appropriate terms based on type
            if (type === "album") {
                const searchQuery = encodeURIComponent(`${canonicalInfo.artist} ${canonicalInfo.track} full album`);
                url = `https://www.youtube.com/results?search_query=${searchQuery}`;
            } else {
                const searchQuery = encodeURIComponent(`${canonicalInfo.artist} ${canonicalInfo.track} official audio`);
                url = `https://www.youtube.com/results?search_query=${searchQuery}`;
            }
        } else if (platform === "spotify") {
            // Use Spotify's web search with appropriate operators based on type
            if (type === "album") {
                const searchQuery = encodeURIComponent(`album:${canonicalInfo.track} artist:${canonicalInfo.artist}`);
                url = `https://open.spotify.com/search/${searchQuery}`;
            } else {
                const searchQuery = encodeURIComponent(`track:${canonicalInfo.track} artist:${canonicalInfo.artist}`);
                url = `https://open.spotify.com/search/${searchQuery}`;
            }
        }

        // This should never happen now since we have fallbacks, but just in case
        if (!url) {
            console.warn(`No URL found for ${artist} - ${track} on ${platform}`);
            // Return a generic search as last resort
            if (platform === "apple") {
                url = `https://music.apple.com/us/search?term=${encodeURIComponent(`${artist} ${track}`)}`;
            } else if (platform === "youtube") {
                url = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${track}`)}`;
            } else if (platform === "spotify") {
                url = `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${track}`)}`;
            }
        }

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error("Error fetching streaming URL:", error);

        // Even on error, return a search URL
        let fallbackUrl = "";
        if (platform === "apple") {
            fallbackUrl = `https://music.apple.com/us/search?term=${encodeURIComponent(`${artist} ${track}`)}`;
        } else if (platform === "youtube") {
            fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${track}`)}`;
        } else if (platform === "spotify") {
            fallbackUrl = `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${track}`)}`;
        }

        return NextResponse.json({ url: fallbackUrl }, { status: 200 });
    }
}


