// Utility functions for fetching music metadata

export interface MusicData {
    title: string;
    author: string;
    type: "single" | "album";
    unreleased?: boolean;
    image?: string; // Optional - will be fetched if not provided
    album?: string; // Optional - for singles, specify the album to get its cover art
}

export interface FetchedMusicData extends MusicData {
    image: string;
}

/**
 * Fetch album art via API route (server-side)
 * @param artist - Artist name
 * @param title - Song or album title
 * @param type - Type of music (single or album)
 * @param album - Optional album name for singles
 * @returns URL to album art (high quality)
 */
export async function fetchAlbumArt(
    artist: string,
    title: string,
    type: "single" | "album",
    album?: string
): Promise<string | null> {
    try {
        const params = new URLSearchParams({
            artist,
            title,
            type,
        });

        if (album) {
            params.append("album", album);
        }

        const response = await fetch(`/api/music/album-art?${params}`);

        if (!response.ok) {
            console.error("API error:", response.status);
            return null;
        }

        const data = await response.json();

        if (data.imageUrl) {
            return data.imageUrl;
        }

        console.warn(`No album art found for: ${artist} - ${title}`);
        return null;
    } catch (error) {
        console.error("Error fetching album art:", error);
        return null;
    }
}

/**
 * Fetch album art for multiple tracks
 */
export async function fetchMultipleAlbumArts(
    tracks: MusicData[]
): Promise<FetchedMusicData[]> {
    const results = await Promise.all(
        tracks.map(async (track) => {
            if (track.image) {
                // If image is already provided, use it
                return track as FetchedMusicData;
            }

            const image = await fetchAlbumArt(track.author, track.title, track.type, track.album);
            return {
                ...track,
                image: image || "/placeholder-album.png", // Fallback placeholder
            } as FetchedMusicData;
        })
    );

    return results;
}

