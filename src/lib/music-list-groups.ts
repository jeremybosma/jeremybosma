import type { FetchedMusicData } from "@/lib/music-api";

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

export function getAlbumName(track: FetchedMusicData): string | null {
  if (track.type === "album") return track.title;
  return track.album ?? null;
}

function albumGroupKey(track: FetchedMusicData): string | null {
  const albumName = getAlbumName(track);
  if (!albumName) return null;
  return `${track.author}\0${albumName}`;
}

export function buildMusicListItems(music: FetchedMusicData[]): MusicListItem[] {
  const groups = new Map<string, FetchedMusicData[]>();

  for (const track of music) {
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

  for (const track of music) {
    const key = albumGroupKey(track);
    const groupTracks = key ? groups.get(key) : undefined;

    if (key && groupTracks && groupTracks.length > 1) {
      if (emittedGroups.has(key)) continue;

      emittedGroups.add(key);
      const albumName = getAlbumName(track)!;
      const cover =
        groupTracks.find((entry) => entry.type === "album")?.image ??
        groupTracks[0]?.image ??
        track.image;

      items.push({
        kind: "album-group",
        key,
        album: albumName,
        author: track.author,
        tracks: groupTracks,
        image: cover,
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
