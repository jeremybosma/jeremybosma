import type { AppleMusicPlaylistTrack } from "./apple-music-playlist";
import type { MusicData } from "./music-api";
import {
  mergeTrackWithPlaylist,
  playlistTrackMatchesEntry,
  playlistTrackToMusicData,
} from "./music-playlist-order";
import {
  dedupeMusicTracks,
  getTrackIdentityKey,
} from "./music-track-dedup";

export type PlaylistSyncStats = {
  playlistTotal: number;
  matched: number;
  added: number;
  keptUnmatched: number;
  pruned: number;
};

export type PlaylistSyncResult = {
  tracks: MusicData[];
  stats: PlaylistSyncStats;
};

export function syncMusicDataWithPlaylist(
  existing: MusicData[],
  playlist: AppleMusicPlaylistTrack[],
  options: { prune?: boolean } = {}
): PlaylistSyncResult {
  const usedExisting = new Set<MusicData>();
  const result: MusicData[] = [];
  const resultKeys = new Set<string>();
  let matched = 0;
  let added = 0;

  for (const playlistTrack of playlist) {
    const existingMatches = existing.filter(
      (entry) =>
        !usedExisting.has(entry) &&
        playlistTrackMatchesEntry(playlistTrack, entry)
    );

    for (const entry of existingMatches) {
      usedExisting.add(entry);
    }

    if (existingMatches.length > 0) {
      const merged = mergeTrackWithPlaylist(existingMatches[0], playlistTrack);
      const key = getTrackIdentityKey(merged);

      if (!resultKeys.has(key)) {
        resultKeys.add(key);
        result.push(merged);
        matched += 1;
      }

      continue;
    }

    const newEntry = playlistTrackToMusicData(playlistTrack);
    const key = getTrackIdentityKey(newEntry);

    if (resultKeys.has(key)) {
      continue;
    }

    resultKeys.add(key);
    result.push(newEntry);
    added += 1;
  }

  let keptUnmatched = 0;
  let pruned = 0;

  if (options.prune) {
    pruned = existing.filter((entry) => !usedExisting.has(entry)).length;
  } else {
    for (const entry of existing) {
      if (usedExisting.has(entry)) continue;

      const key = getTrackIdentityKey(entry);
      if (resultKeys.has(key)) continue;

      resultKeys.add(key);
      result.push(entry);
      keptUnmatched += 1;
    }
  }

  return {
    tracks: dedupeMusicTracks(result),
    stats: {
      playlistTotal: playlist.length,
      matched,
      added,
      keptUnmatched,
      pruned,
    },
  };
}
