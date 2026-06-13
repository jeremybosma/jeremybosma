import {
  FAVORITE_SONGS_PLAYLIST,
  type AppleMusicPlaylistTrack,
} from "./apple-music-playlist-constants";
import { getAppleMusicToken } from "./apple-music-api";

export { FAVORITE_SONGS_PLAYLIST };
export type { AppleMusicPlaylistTrack };

const APPLE_MUSIC_HEADERS = {
  Accept: "*/*",
  Origin: "https://music.apple.com",
  Referer: "https://music.apple.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
};

type CachedPlaylist = {
  tracks: AppleMusicPlaylistTrack[];
  fetchedAt: number;
};

const PLAYLIST_TTL_MS = 0;
let cachedPlaylist: CachedPlaylist | null = null;

function toPlaylistTrack(attributes: {
  name?: string;
  artistName?: string;
  albumName?: string;
}): AppleMusicPlaylistTrack | null {
  if (!attributes.name || !attributes.artistName) {
    return null;
  }

  return {
    title: attributes.name,
    author: attributes.artistName,
    album: attributes.albumName,
  };
}

export async function fetchFavoriteSongsPlaylist(): Promise<
  AppleMusicPlaylistTrack[]
> {
  const now = Date.now();

  if (
    cachedPlaylist &&
    PLAYLIST_TTL_MS > 0 &&
    now - cachedPlaylist.fetchedAt < PLAYLIST_TTL_MS
  ) {
    return cachedPlaylist.tracks;
  }

  const token = await getAppleMusicToken();
  const tracks: AppleMusicPlaylistTrack[] = [];

  let nextUrl: string | null =
    `https://amp-api.music.apple.com/v1/catalog/${FAVORITE_SONGS_PLAYLIST.country}/playlists/${FAVORITE_SONGS_PLAYLIST.id}/tracks?limit=100`;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        ...APPLE_MUSIC_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Apple Music playlist failed (${response.status})`);
    }

    const payload = (await response.json()) as {
      data?: Array<{ attributes?: Record<string, string> }>;
      next?: string;
    };

    for (const item of payload.data ?? []) {
      const track = toPlaylistTrack(item.attributes ?? {});
      if (track) {
        tracks.push(track);
      }
    }

    nextUrl = payload.next
      ? `https://amp-api.music.apple.com${payload.next}`
      : null;
  }

  cachedPlaylist = { tracks, fetchedAt: now };
  return tracks;
}
