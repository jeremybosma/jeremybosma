import type { FetchedMusicData } from "@/lib/music-api";
import { musicData } from "@/lib/music-data";
import musicCoversData from "./music-covers.json";

export type MusicCoversData = {
  syncedAt: string | null;
  tracks: FetchedMusicData[];
};

const data = musicCoversData as MusicCoversData;

const PLACEHOLDER_IMAGE = "/music/covers/placeholder.svg";

export function getCachedMusic(): FetchedMusicData[] {
  if (data.tracks.length > 0) {
    return data.tracks;
  }

  // Dev fallback before first sync — no Last.fm round-trips on every reload.
  return musicData.map((track) => ({
    ...track,
    image: track.image ?? PLACEHOLDER_IMAGE,
  }));
}

export function getMusicCoversSyncedAt(): string | null {
  return data.syncedAt;
}
