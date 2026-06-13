import type { MusicData } from "./music-api";
import { primaryArtist } from "./music-art-match";
import {
  getAlbumName,
  normalizeMusicText,
  normalizeTitleForMatch,
} from "./music-playlist-order";

export function getTrackIdentityKey(track: MusicData): string {
  const albumName = getAlbumName(track) ?? "";

  return [
    normalizeMusicText(primaryArtist(track.author)),
    normalizeTitleForMatch(track.title),
    normalizeMusicText(albumName),
  ].join("\0");
}

function pickPreferredDuplicate(left: MusicData, right: MusicData): MusicData {
  const preferRight =
    right.title.length > left.title.length ||
    (right.title.length === left.title.length &&
      (right.album?.length ?? 0) > (left.album?.length ?? 0));

  const preferred = preferRight ? right : left;
  const other = preferRight ? left : right;

  return {
    ...preferred,
    ...(other.unreleased ? { unreleased: true } : {}),
  };
}

export function dedupeMusicTracks<T extends MusicData>(tracks: T[]): T[] {
  const result: T[] = [];
  const indexByKey = new Map<string, number>();

  for (const track of tracks) {
    const key = getTrackIdentityKey(track);
    const existingIndex = indexByKey.get(key);

    if (existingIndex === undefined) {
      indexByKey.set(key, result.length);
      result.push(track);
      continue;
    }

    result[existingIndex] = pickPreferredDuplicate(
      result[existingIndex],
      track
    ) as T;
  }

  return result;
}
