import type { AppleMusicPlaylistTrack } from "./apple-music-playlist";
import type { MusicData } from "./music-api";
import { primaryArtist, stripFeaturedArtistsFromTitle } from "./music-art-match";

export { primaryArtist, stripFeaturedArtistsFromTitle };

export function normalizeMusicText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\(remix\)/gi, "")
    .replace(/\s*-\s*single$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** For matching only — never used when writing titles to music-data.ts */
export function normalizeTitleForMatch(value: string): string {
  return normalizeMusicText(stripFeaturedArtistsFromTitle(value));
}

export function getAlbumName(track: MusicData): string | null {
  if (track.type === "album") return track.title;
  return track.album ?? null;
}

function splitArtists(value: string): string[] {
  return value
    .split(/[,&]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function albumMatchKey(author: string, albumName: string): string {
  return `${normalizeMusicText(author)}\0${normalizeMusicText(albumName)}`;
}

export function cleanAlbumName(albumName: string | undefined): string | undefined {
  if (!albumName) return undefined;
  return albumName.replace(/\s*-\s*single$/i, "").trim();
}

function artistsOverlap(left: string, right: string): boolean {
  const leftArtists = splitArtists(left).map(normalizeMusicText);
  const rightArtists = splitArtists(right).map(normalizeMusicText);

  return leftArtists.some((leftArtist) =>
    rightArtists.some(
      (rightArtist) =>
        leftArtist === rightArtist ||
        rightArtist.includes(leftArtist) ||
        leftArtist.includes(rightArtist)
    )
  );
}

export function playlistTrackMatchesEntry(
  playlistTrack: AppleMusicPlaylistTrack,
  entry: MusicData
): boolean {
  if (!artistsOverlap(playlistTrack.author, entry.author)) {
    return false;
  }

  if (entry.type === "album") {
    const albumName = cleanAlbumName(playlistTrack.album);
    if (!albumName) return false;

    return (
      albumMatchKey(entry.author, entry.title) ===
      albumMatchKey(primaryArtist(playlistTrack.author), albumName)
    );
  }

  return (
    normalizeTitleForMatch(entry.title) ===
    normalizeTitleForMatch(playlistTrack.title)
  );
}

export function playlistTrackToMusicData(
  track: AppleMusicPlaylistTrack
): MusicData {
  const album = cleanAlbumName(track.album);
  const entry: MusicData = {
    title: track.title.trim(),
    author: track.author.trim(),
    type: "single",
  };

  if (
    album &&
    normalizeMusicText(album) !== normalizeMusicText(track.title)
  ) {
    entry.album = album;
  }

  return entry;
}

export function mergeTrackWithPlaylist(
  existing: MusicData,
  playlistTrack: AppleMusicPlaylistTrack
): MusicData {
  if (existing.type === "album") {
    return existing;
  }

  const merged = playlistTrackToMusicData(playlistTrack);

  return {
    ...merged,
    ...(existing.unreleased ? { unreleased: true } : {}),
  };
}

type PlaylistIndex = {
  trackPositions: Map<string, number>;
  albumPositions: Map<string, number>;
};

function buildPlaylistIndex(playlist: AppleMusicPlaylistTrack[]): PlaylistIndex {
  const trackPositions = new Map<string, number>();
  const albumPositions = new Map<string, number>();

  for (const [index, entry] of playlist.entries()) {
    for (const author of splitArtists(entry.author)) {
      const key = `${normalizeMusicText(author)}\0${normalizeTitleForMatch(entry.title)}`;
      if (!trackPositions.has(key)) {
        trackPositions.set(key, index);
      }
    }

    const albumName = cleanAlbumName(entry.album);
    if (!albumName) continue;

    for (const author of splitArtists(entry.author)) {
      const key = albumMatchKey(author, albumName);
      if (!albumPositions.has(key)) {
        albumPositions.set(key, index);
      }
    }
  }

  return { trackPositions, albumPositions };
}

function getTrackPosition(
  track: MusicData,
  index: PlaylistIndex
): number | undefined {
  for (const author of splitArtists(track.author)) {
    const key = `${normalizeMusicText(author)}\0${normalizeTitleForMatch(track.title)}`;
    const position = index.trackPositions.get(key);
    if (position !== undefined) {
      return position;
    }
  }

  if (track.type === "album") {
    const albumKey = albumMatchKey(track.author, track.title);
    const albumPosition = index.albumPositions.get(albumKey);
    if (albumPosition !== undefined) {
      return albumPosition;
    }
  }

  if (track.album) {
    const albumKey = albumMatchKey(track.author, track.album);
    const albumPosition = index.albumPositions.get(albumKey);
    if (albumPosition !== undefined) {
      return albumPosition;
    }
  }

  return undefined;
}

export function orderMusicByPlaylist<T extends MusicData>(
  music: T[],
  playlist: AppleMusicPlaylistTrack[]
): T[] {
  const index = buildPlaylistIndex(playlist);

  return music
    .map((track, originalIndex) => ({
      track,
      originalIndex,
      position: getTrackPosition(track, index) ?? Number.POSITIVE_INFINITY,
    }))
    .sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position;
      }

      return left.originalIndex - right.originalIndex;
    })
    .map(({ track }) => track);
}
