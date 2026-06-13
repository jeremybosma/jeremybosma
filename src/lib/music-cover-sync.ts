import fs from "node:fs";
import path from "node:path";
import type { FetchedMusicData, MusicData } from "./music-api";
import { fetchAlbumArtFromItunes } from "./itunes-album-art";
import type { MusicCoversData } from "./music-covers";

export const MUSIC_COVERS_DIR = path.join(process.cwd(), "public/music/covers");
export const MUSIC_COVERS_JSON_PATH = path.join(
  process.cwd(),
  "src/lib/music-covers.json"
);
export const PLACEHOLDER_COVER = "/music/covers/placeholder.svg";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect fill="#ddd" width="300" height="300"/>
  <text fill="#999" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">No Image</text>
</svg>`;

export type SyncTrackStatus = "cached" | "downloaded" | "missing" | "kept";

export type SyncTrackResult = FetchedMusicData & {
  status: SyncTrackStatus;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getTrackKey(track: MusicData): string {
  return `${track.author}\0${track.title}\0${track.type}`;
}

export function getCoverSlug(track: MusicData): string {
  const parts = [track.author, track.title];
  if (track.album) parts.push(track.album);
  return slugify(parts.join("-"));
}

/** Shared key for album-type entries and singles on the same album. */
export function getAlbumKey(track: MusicData): string | null {
  if (track.type === "album") {
    return `${track.author}\0${track.title}`;
  }

  if (track.album?.trim()) {
    return `${track.author}\0${track.album.trim()}`;
  }

  return null;
}

export function getAlbumCoverSlug(author: string, albumName: string): string {
  return slugify(`${author}-${albumName}`);
}

/** Cover filename — one file per album when the track belongs to one. */
export function getStorageSlug(track: MusicData): string {
  const albumKey = getAlbumKey(track);
  if (albumKey) {
    const [author, albumName] = albumKey.split("\0");
    return getAlbumCoverSlug(author, albumName);
  }

  return getCoverSlug(track);
}

function sortTracksForSync(tracks: MusicData[]): MusicData[] {
  const priority = (track: MusicData) => {
    if (track.type === "album") return 0;
    if (track.album?.trim()) return 1;
    return 2;
  };

  return [...tracks].sort((a, b) => priority(a) - priority(b));
}

export function buildAlbumCoverMap(
  tracks: Iterable<FetchedMusicData>
): Map<string, string> {
  const map = new Map<string, string>();

  for (const track of tracks) {
    const albumKey = getAlbumKey(track);
    if (
      !albumKey ||
      isPlaceholderCover(track.image) ||
      !localCoverExists(track.image) ||
      map.has(albumKey)
    ) {
      continue;
    }

    map.set(albumKey, track.image);
  }

  return map;
}

function getExtension(contentType: string | null, remoteUrl: string): "jpg" | "png" {
  if (contentType?.includes("png")) return "png";
  if (remoteUrl.includes(".png")) return "png";
  return "jpg";
}

function getLocalCoverPath(slug: string, ext: "jpg" | "png"): string {
  return path.join(MUSIC_COVERS_DIR, `${slug}.${ext}`);
}

function getPublicCoverPath(slug: string, ext: "jpg" | "png"): string {
  return `/music/covers/${slug}.${ext}`;
}

function isPlaceholderCover(image: string): boolean {
  return image === PLACEHOLDER_COVER || image.endsWith("/placeholder.svg");
}

function publicPathToDiskPath(publicPath: string): string | null {
  if (!publicPath.startsWith("/music/covers/")) return null;
  return path.join(process.cwd(), "public", publicPath.slice(1));
}

function localCoverExists(publicPath: string): boolean {
  const diskPath = publicPathToDiskPath(publicPath);
  return diskPath ? fs.existsSync(diskPath) : false;
}

function findExistingLocalCover(slug: string): string | null {
  for (const ext of ["jpg", "png"] as const) {
    const filePath = getLocalCoverPath(slug, ext);
    if (fs.existsSync(filePath)) {
      return getPublicCoverPath(slug, ext);
    }
  }
  return null;
}

async function downloadCoverImage(
  remoteUrl: string,
  destPath: string
): Promise<"jpg" | "png"> {
  const response = await fetch(remoteUrl);
  if (!response.ok) {
    throw new Error(`Failed to download cover (${response.status})`);
  }

  const ext = getExtension(response.headers.get("content-type"), remoteUrl);
  const finalPath =
    ext === "png" && destPath.endsWith(".jpg")
      ? destPath.replace(/\.jpg$/, ".png")
      : destPath;

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(finalPath, buffer);
  return ext;
}

function ensurePlaceholder(): void {
  fs.mkdirSync(MUSIC_COVERS_DIR, { recursive: true });
  const placeholderPath = path.join(MUSIC_COVERS_DIR, "placeholder.svg");
  if (!fs.existsSync(placeholderPath)) {
    fs.writeFileSync(placeholderPath, PLACEHOLDER_SVG);
  }
}

export function loadExistingMusicCovers(): Map<string, FetchedMusicData> {
  if (!fs.existsSync(MUSIC_COVERS_JSON_PATH)) {
    return new Map();
  }

  const data = JSON.parse(
    fs.readFileSync(MUSIC_COVERS_JSON_PATH, "utf8")
  ) as MusicCoversData;

  return new Map(data.tracks.map((track) => [getTrackKey(track), track]));
}

function resolveCachedCover(
  track: MusicData,
  options: {
    existing?: FetchedMusicData;
    albumCovers?: Map<string, string>;
  } = {}
): string | null {
  const albumKey = getAlbumKey(track);

  if (albumKey && options.albumCovers?.has(albumKey)) {
    const albumCover = options.albumCovers.get(albumKey)!;
    if (localCoverExists(albumCover)) {
      return albumCover;
    }
  }

  const storageSlugCover = findExistingLocalCover(getStorageSlug(track));
  if (storageSlugCover) return storageSlugCover;

  const legacySlugCover = findExistingLocalCover(getCoverSlug(track));
  if (legacySlugCover) return legacySlugCover;

  if (
    options.existing?.image &&
    !isPlaceholderCover(options.existing.image) &&
    localCoverExists(options.existing.image)
  ) {
    return options.existing.image;
  }

  return null;
}

export async function syncTrackCover(
  track: MusicData,
  options: {
    force?: boolean;
    missingOnly?: boolean;
    existing?: FetchedMusicData;
    albumCovers?: Map<string, string>;
  } = {}
): Promise<SyncTrackResult> {
  ensurePlaceholder();
  const albumKey = getAlbumKey(track);

  if (!options.force) {
    const cached = resolveCachedCover(track, {
      existing: options.existing,
      albumCovers: options.albumCovers,
    });
    if (cached) {
      if (albumKey) {
        options.albumCovers?.set(albumKey, cached);
      }

      if (
        !options.missingOnly ||
        !isPlaceholderCover(cached)
      ) {
        return { ...track, image: cached, status: "cached" };
      }
    }
  }

  const remoteUrl = await fetchAlbumArtFromItunes(
    track.author,
    track.title,
    track.type,
    track.album
  );

  if (!remoteUrl) {
    const fallback =
      options.existing?.image &&
      !isPlaceholderCover(options.existing.image) &&
      localCoverExists(options.existing.image)
        ? options.existing.image
        : PLACEHOLDER_COVER;

    if (albumKey && fallback !== PLACEHOLDER_COVER) {
      options.albumCovers?.set(albumKey, fallback);
    }

    return {
      ...track,
      image: fallback,
      status: fallback === PLACEHOLDER_COVER ? "missing" : "kept",
    };
  }

  const slug = getStorageSlug(track);
  const destPath = getLocalCoverPath(slug, "jpg");
  const ext = await downloadCoverImage(remoteUrl, destPath);
  const image = getPublicCoverPath(slug, ext);

  if (albumKey) {
    options.albumCovers?.set(albumKey, image);
  }

  return {
    ...track,
    image,
    status: "downloaded",
  };
}

export async function syncAllMusicCovers(
  tracks: MusicData[],
  options: { force?: boolean; missingOnly?: boolean } = {}
): Promise<MusicCoversData & { stats: Record<SyncTrackStatus, number> }> {
  ensurePlaceholder();

  const existingByKey = loadExistingMusicCovers();
  const albumCovers = buildAlbumCoverMap(existingByKey.values());
  const orderedTracks = sortTracksForSync(tracks);
  const results: SyncTrackResult[] = [];
  const stats: Record<SyncTrackStatus, number> = {
    cached: 0,
    downloaded: 0,
    missing: 0,
    kept: 0,
  };

  for (const [index, track] of orderedTracks.entries()) {
    const existing = existingByKey.get(getTrackKey(track));
    const synced = await syncTrackCover(track, {
      force: options.force,
      missingOnly: options.missingOnly,
      existing,
      albumCovers,
    });

    results.push(synced);
    stats[synced.status] += 1;

    const statusLabel =
      synced.status === "cached"
        ? "cached"
        : synced.status === "downloaded"
          ? getAlbumKey(track)
            ? "downloaded (album)"
            : "downloaded"
          : synced.status === "kept"
            ? "kept existing"
            : "not found";

    console.log(
      `  [${index + 1}/${orderedTracks.length}] ${track.author} — ${track.title} (${statusLabel})`
    );

    if (synced.status === "downloaded" || synced.status === "missing") {
      await new Promise((resolve) => setTimeout(resolve, 275));
    }
  }

  const tracksByKey = new Map(
    results.map((track) => [getTrackKey(track), track])
  );

  return {
    syncedAt: new Date().toISOString(),
    tracks: tracks.map((track) => {
      const synced = tracksByKey.get(getTrackKey(track));
      if (!synced) {
        throw new Error(`Missing sync result for ${track.author} — ${track.title}`);
      }
      const { status: _status, ...entry } = synced;
      return entry;
    }),
    stats,
  };
}

export function writeMusicCoversJson(data: MusicCoversData): void {
  fs.writeFileSync(MUSIC_COVERS_JSON_PATH, `${JSON.stringify(data, null, 2)}\n`);
}
