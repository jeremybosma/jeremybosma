import type { FetchedMusicData, MusicData } from "./music-api";
import type { MusicCoversData } from "./music-covers";
import {
  getTrackKey,
  loadExistingMusicCovers,
  writeMusicCoversJson,
} from "./music-cover-sync";
import {
  normalizeTitleForMatch,
  playlistTrackMatchesEntry,
} from "./music-playlist-order";

function findExistingCover(
  track: MusicData,
  existingByKey: Map<string, FetchedMusicData>
): string | undefined {
  const exact = existingByKey.get(getTrackKey(track));
  if (exact?.image) return exact.image;

  for (const cover of existingByKey.values()) {
    if (
      cover.type === track.type &&
      normalizeTitleForMatch(cover.title) ===
        normalizeTitleForMatch(track.title) &&
      playlistTrackMatchesEntry(
        { title: cover.title, author: cover.author, album: cover.album },
        track
      )
    ) {
      return cover.image;
    }
  }

  return undefined;
}

export function refreshMusicCoversMetadata(tracks: MusicData[]): MusicCoversData {
  const existingByKey = loadExistingMusicCovers();

  return {
    syncedAt: new Date().toISOString(),
    tracks: tracks.map((track) => ({
      ...track,
      image:
        findExistingCover(track, existingByKey) ??
        "/music/covers/placeholder.svg",
    })),
  };
}

export function writeRefreshedMusicCoversMetadata(tracks: MusicData[]): void {
  writeMusicCoversJson(refreshMusicCoversMetadata(tracks));
}
