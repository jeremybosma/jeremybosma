// Server-side only music API functions
import { MusicData, FetchedMusicData } from "./music-api";

const LASTFM_API_KEY = process.env.LASTFM_API_KEY || "43693f63a309e7a0326e2d97a8e8dc6c";

/**
 * Fetch album art from Last.fm API (server-side only)
 * @param artist - Artist name
 * @param title - Song or album title
 * @param type - Type of music (single or album)
 * @param albumName - Optional album name for singles
 * @returns URL to album art (high quality)
 */
export async function fetchAlbumArtServer(
    artist: string,
    title: string,
    type: "single" | "album",
    albumName?: string
): Promise<string | null> {
    try {
        let imageUrl: string | null = null;

        // If single with album specified, use album art
        if (type === "single" && albumName) {
            const params = new URLSearchParams({
                method: "album.getinfo",
                api_key: LASTFM_API_KEY,
                artist: artist,
                album: albumName,
                format: "json",
                autocorrect: "1",
            });

            const response = await fetch(
                `https://ws.audioscrobbler.com/2.0/?${params}`,
                {
                    next: { revalidate: 86400 },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (!data.error && data.album?.image) {
                    const images = data.album.image;
                    const largestImage = images[images.length - 1];
                    imageUrl = largestImage["#text"];
                }
            }
        } else {
            // Default behavior
            const method = type === "album" ? "album.getinfo" : "track.getinfo";
            const params = new URLSearchParams({
                method,
                api_key: LASTFM_API_KEY,
                artist: artist,
                [type === "album" ? "album" : "track"]: title,
                format: "json",
                autocorrect: "1",
            });

            const response = await fetch(
                `https://ws.audioscrobbler.com/2.0/?${params}`,
                {
                    next: { revalidate: 86400 },
                }
            );

            if (!response.ok) {
                console.error("Last.fm API error:", response.status);
                return null;
            }

            const data = await response.json();

            if (data.error) {
                console.error(`Last.fm API error: ${data.message}`);
                return null;
            }

            if (type === "album") {
                // For albums, images are directly in album.image
                const images = data.album?.image;
                if (images && images.length > 0) {
                    const largestImage = images[images.length - 1];
                    imageUrl = largestImage["#text"];
                }
            } else {
                // For singles/tracks, images are in track.album.image
                const images = data.track?.album?.image;
                if (images && images.length > 0) {
                    const largestImage = images[images.length - 1];
                    imageUrl = largestImage["#text"];
                }
            }
        }

        // Check if it's a placeholder image or empty
        if (!imageUrl || imageUrl.includes("2a96cbd8b46e442fc41c2b86b821562f") || imageUrl === "") {
            console.warn(`No album art found for: ${artist} - ${title}`);
            return null;
        }

        // Verify image URL is accessible to prevent 404 errors during Next.js image optimization
        // Use shorter timeout in dev, longer in production
        const timeout = process.env.NODE_ENV === "production" ? 5000 : 2000;
        try {
            const imageResponse = await fetch(imageUrl, {
                method: "HEAD",
                signal: AbortSignal.timeout(timeout),
            });
            if (!imageResponse.ok) {
                // Silently return null - broken URLs will use fallback placeholder
                return null;
            }
        } catch (error) {
            // Network errors or timeouts - silently return null
            return null;
        }

        return imageUrl;
    } catch (error) {
        console.error("Error fetching album art from Last.fm:", error);
        return null;
    }
}

/**
 * Fetch album art for multiple tracks (server-side only)
 */
export async function fetchMultipleAlbumArtsServer(
    tracks: MusicData[]
): Promise<FetchedMusicData[]> {
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
    
    const results = await Promise.all(
        tracks.map(async (track) => {
            // If track already has an image, use it
            if (track.image) {
                return track as FetchedMusicData;
            }

            // Fetch album art
            const image = await fetchAlbumArtServer(track.author, track.title, track.type, track.album);
            
            // In production: exclude tracks without images
            if (isProduction && !image) {
                return null;
            }

            // In dev: use placeholder if no image found
            const fallbackImage = image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
            return {
                ...track,
                image: fallbackImage,
            } as FetchedMusicData;
        })
    );

    // Filter out null values (tracks without images in production)
    return results.filter((track): track is FetchedMusicData => track !== null);
}

