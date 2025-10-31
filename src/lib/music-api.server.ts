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
    const results = await Promise.all(
        tracks.map(async (track) => {
            if (track.image) {
                return track as FetchedMusicData;
            }

            const image = await fetchAlbumArtServer(track.author, track.title, track.type, track.album);
            return {
                ...track,
                image: image || "/placeholder-album.png",
            } as FetchedMusicData;
        })
    );

    return results;
}

