import type { FetchedMusicData, MusicData } from "@/lib/music-api";
import { getAlbumName, normalizeMusicText } from "@/lib/music-playlist-order";
import { dedupeMusicTracks } from "@/lib/music-track-dedup";

const PLACEHOLDER_IMAGE = "/music/covers/placeholder.svg";

function isPlaceholderCover(image: string | undefined): boolean {
  return !image || image === PLACEHOLDER_IMAGE || image.endsWith("/placeholder.svg");
}

function pickGroupCover(tracks: FetchedMusicData[]): string {
  const albumEntry = tracks.find(
    (track) => track.type === "album" && !isPlaceholderCover(track.image)
  );
  if (albumEntry) return albumEntry.image;

  const withCover = tracks.find((track) => !isPlaceholderCover(track.image));
  return withCover?.image ?? tracks[0]?.image ?? PLACEHOLDER_IMAGE;
}

export type MusicAlbumGroup = {
  kind: "album-group";
  key: string;
  album: string;
  author: string;
  tracks: FetchedMusicData[];
  image: string;
};

export type MusicTrackItem = {
  kind: "track";
  key: string;
  track: FetchedMusicData;
};

export type MusicListItem = MusicAlbumGroup | MusicTrackItem;

export { getAlbumName };

function normalizeAlbumName(albumName: string): string {
  return normalizeMusicText(albumName);
}

function albumGroupKey(track: FetchedMusicData): string | null {
  const albumName = getAlbumName(track);
  if (!albumName) return null;
  return normalizeAlbumName(albumName);
}

export function getAlbumDisplayAuthor(tracks: FetchedMusicData[]): string {
  const albumEntry = tracks.find((track) => track.type === "album");
  if (albumEntry) return albumEntry.author;

  const authorCounts = new Map<string, number>();
  for (const track of tracks) {
    authorCounts.set(track.author, (authorCounts.get(track.author) ?? 0) + 1);
  }

  const [author] = [...authorCounts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) return right[1] - left[1];
    return right[0].length - left[0].length;
  })[0];

  return author ?? tracks[0]?.author ?? "";
}

function getAlbumDisplayName(tracks: FetchedMusicData[]): string {
  const albumEntry = tracks.find((track) => track.type === "album");
  if (albumEntry) return albumEntry.title;

  const albumName = getAlbumName(tracks[0]);
  return albumName ?? tracks[0].title;
}

export function buildMusicListItems(music: FetchedMusicData[]): MusicListItem[] {
  const dedupedMusic = dedupeMusicTracks(music);
  const groups = new Map<string, FetchedMusicData[]>();

  for (const track of dedupedMusic) {
    const key = albumGroupKey(track);
    if (!key) continue;

    const existing = groups.get(key);
    if (existing) {
      existing.push(track);
    } else {
      groups.set(key, [track]);
    }
  }

  const emittedGroups = new Set<string>();
  const items: MusicListItem[] = [];

  for (const track of dedupedMusic) {
    const key = albumGroupKey(track);
    const groupTracks = key ? groups.get(key) : undefined;

    if (key && groupTracks && groupTracks.length > 1) {
      if (emittedGroups.has(key)) continue;

      emittedGroups.add(key);

      items.push({
        kind: "album-group",
        key,
        album: getAlbumDisplayName(groupTracks),
        author: getAlbumDisplayAuthor(groupTracks),
        tracks: groupTracks,
        image: pickGroupCover(groupTracks),
      });
      continue;
    }

    items.push({
      kind: "track",
      key: `${track.author}\0${track.title}\0${track.type}`,
      track,
    });
  }

  return items;
}
