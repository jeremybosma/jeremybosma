import fs from "node:fs";
import path from "node:path";
import type { MusicData } from "./music-api";
import { syncTrackCover, writeMusicCoversJson, loadExistingMusicCovers, buildAlbumCoverMap } from "./music-cover-sync";

const MUSIC_DATA_PATH = path.join(process.cwd(), "src/lib/music-data.ts");
const MUSIC_COVERS_PATH = path.join(process.cwd(), "src/lib/music-covers.json");

export function formatMusicEntry(entry: MusicData): string {
  const parts = [
    `title: ${JSON.stringify(entry.title)}`,
    `author: ${JSON.stringify(entry.author)}`,
    `type: ${JSON.stringify(entry.type)}`,
  ];

  if (entry.album) {
    parts.push(`album: ${JSON.stringify(entry.album)}`);
  }

  if (entry.unreleased) {
    parts.push("unreleased: true");
  }

  return `  { ${parts.join(", ")} },`;
}

function parseMusicDataFile(fileContent: string): MusicData[] {
  const entries: MusicData[] = [];
  const blockRe = /\{([^{}]+)\}/g;

  for (const blockMatch of fileContent.matchAll(blockRe)) {
    const block = blockMatch[1];
    const title = parseQuotedField(block, "title");
    const author = parseQuotedField(block, "author");
    const type = block.match(/type:\s*"(single|album)"/)?.[1];

    if (!title || !author || (type !== "single" && type !== "album")) {
      continue;
    }

    const album = parseQuotedField(block, "album");
    const unreleased = /unreleased:\s*true/.test(block);

    entries.push({
      title,
      author,
      type,
      ...(album ? { album } : {}),
      ...(unreleased ? { unreleased: true } : {}),
    });
  }

  return entries;
}

function parseQuotedField(block: string, field: string): string | undefined {
  const match = block.match(new RegExp(`${field}:\\s*("(?:[^"\\\\]|\\\\.)*")`));
  return match ? (JSON.parse(match[1]) as string) : undefined;
}

function normalizeEntryKey(entry: MusicData): string {
  return [
    entry.author.trim().toLowerCase(),
    entry.title.trim().toLowerCase(),
    entry.type,
    entry.album?.trim().toLowerCase() ?? "",
  ].join("\0");
}

export function getMusicEntryKey(entry: MusicData): string {
  return normalizeEntryKey(entry);
}

export function isMusicEntryDuplicate(
  entry: MusicData,
  existing: MusicData[]
): boolean {
  const key = getMusicEntryKey(entry);
  return existing.some((track) => getMusicEntryKey(track) === key);
}

export function writeMusicDataFile(entries: MusicData[]): void {
  const lines = entries.map((entry) => formatMusicEntry(entry)).join("\n");
  const content = `import type { MusicData } from "@/lib/music-api";\n\nexport const musicData: MusicData[] = [\n${lines}\n];\n`;

  fs.writeFileSync(MUSIC_DATA_PATH, content);
}

function isDuplicate(entry: MusicData, fileContent: string): boolean {
  return isMusicEntryDuplicate(entry, parseMusicDataFile(fileContent));
}

export async function addMusicEntry(entry: MusicData): Promise<{
  code: string;
  duplicate: boolean;
}> {
  if (!entry.title.trim() || !entry.author.trim()) {
    throw new Error("Title and author are required");
  }

  if (entry.type !== "single" && entry.type !== "album") {
    throw new Error("Type must be single or album");
  }

  const normalized: MusicData = {
    title: entry.title.trim(),
    author: entry.author.trim(),
    type: entry.type,
    ...(entry.type === "single" && entry.album?.trim()
      ? { album: entry.album.trim() }
      : {}),
    ...(entry.unreleased ? { unreleased: true } : {}),
  };

  const code = formatMusicEntry(normalized);

  const file = fs.readFileSync(MUSIC_DATA_PATH, "utf8");

  if (isDuplicate(normalized, file)) {
    return { code, duplicate: true };
  }

  const closingIndex = file.lastIndexOf("];");

  if (closingIndex === -1) {
    throw new Error("Could not find musicData array in music-data.ts");
  }

  const updated =
    file.slice(0, closingIndex) + `${code}\n` + file.slice(closingIndex);

  fs.writeFileSync(MUSIC_DATA_PATH, updated);

  await appendToMusicCovers(normalized);

  return { code, duplicate: false };
}

async function appendToMusicCovers(entry: MusicData): Promise<void> {
  if (!fs.existsSync(MUSIC_COVERS_PATH)) return;

  const covers = JSON.parse(fs.readFileSync(MUSIC_COVERS_PATH, "utf8")) as {
    syncedAt: string | null;
    tracks: Array<MusicData & { image: string }>;
  };

  const albumCovers = buildAlbumCoverMap(covers.tracks);
  const synced = await syncTrackCover(entry, { albumCovers });
  covers.tracks.push(synced);
  covers.syncedAt = new Date().toISOString();

  writeMusicCoversJson(covers);
}
