import {
  FAVORITE_SONGS_PLAYLIST,
  fetchFavoriteSongsPlaylist,
} from "../../lib/apple-music-playlist";

export async function handlePlaylistOrder(): Promise<Response> {
  try {
    const tracks = await fetchFavoriteSongsPlaylist();

    return Response.json(
      {
        playlist: FAVORITE_SONGS_PLAYLIST,
        tracks,
        syncedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch Apple Music playlist";

    return Response.json({ error: message }, { status: 502 });
  }
}
