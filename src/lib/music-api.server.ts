// Server-side only music API functions
import { MusicData, FetchedMusicData } from "./music-api";
import { fetchAlbumArtFromItunes } from "./itunes-album-art";

/**
 * Fetch album art from iTunes Search API (server-side only)
 */
export async function fetchAlbumArtServer(
    artist: string,
    title: string,
    type: "single" | "album",
    albumName?: string
): Promise<string | null> {
    try {
        const imageUrl = await fetchAlbumArtFromItunes(
            artist,
            title,
            type,
            albumName
        );

        if (!imageUrl) {
            console.warn(`No album art found for: ${artist} - ${title}`);
            return null;
        }

        const timeout = process.env.NODE_ENV === "production" ? 5000 : 2000;
        try {
            const imageResponse = await fetch(imageUrl, {
                method: "HEAD",
                signal: AbortSignal.timeout(timeout),
            });
            if (!imageResponse.ok) {
                return null;
            }
        } catch {
            return null;
        }

        return imageUrl;
    } catch (error) {
        console.error("Error fetching album art from iTunes:", error);
        return null;
    }
}

/**
 * Fetch album art for multiple tracks (server-side only)
 */
export async function fetchMultipleAlbumArtsServer(
    tracks: MusicData[]
): Promise<FetchedMusicData[]> {
    const isProduction =
        import.meta.env.PROD ||
        process.env.NODE_ENV === "production" ||
        process.env.VERCEL_ENV === "production";
    
    const results = await Promise.all(
        tracks.map(async (track) => {
            if (track.image) {
                return track as FetchedMusicData;
            }

            const image = await fetchAlbumArtServer(track.author, track.title, track.type, track.album);
            
            if (isProduction && !image) {
                return null;
            }

            const fallbackImage = image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
            return {
                ...track,
                image: fallbackImage,
            } as FetchedMusicData;
        })
    );

    return results.filter((track): track is FetchedMusicData => track !== null);
}
