import type { FetchedMusicData, MusicData } from "@/lib/music-api";
import { musicData } from "@/lib/music-data";
import { getTrackKey } from "@/lib/music-cover-sync";
import {
  normalizeTitleForMatch,
  playlistTrackMatchesEntry,
} from "@/lib/music-playlist-order";
import musicCoversData from "./music-covers.json";

export type MusicCoversData = {
  syncedAt: string | null;
  tracks: FetchedMusicData[];
};

const data = musicCoversData as MusicCoversData;

const PLACEHOLDER_IMAGE = "/music/covers/placeholder.svg";

function findCoverImage(
  track: MusicData,
  covers: FetchedMusicData[]
): string | undefined {
  const exact = covers.find((cover) => getTrackKey(cover) === getTrackKey(track));
  if (exact?.image) return exact.image;

  const matched = covers.find(
    (cover) =>
      cover.type === track.type &&
      normalizeTitleForMatch(cover.title) ===
        normalizeTitleForMatch(track.title) &&
      playlistTrackMatchesEntry(
        { title: cover.title, author: cover.author, album: cover.album },
        track
      )
  );

  return matched?.image;
}

export function getCachedMusic(): FetchedMusicData[] {
  if (data.tracks.length === 0) {
    return musicData.map((track) => ({
      ...track,
      image: track.image ?? PLACEHOLDER_IMAGE,
    }));
  }

  return musicData.map((track) => ({
    ...track,
    image:
      findCoverImage(track, data.tracks) ??
      track.image ??
      PLACEHOLDER_IMAGE,
  }));
}

export function getMusicCoversSyncedAt(): string | null {
  return data.syncedAt;
}
