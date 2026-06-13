/**
 * Syncs src/lib/music-data.ts with the Apple Music Favorite Songs playlist,
 * then downloads covers (one file per album when tracks share an album).
 *
 * Run manually: bun run sync:music:playlist
 * Options:
 *   --dry-run   Preview changes without writing files
 *   --prune     Remove local tracks that are not in the playlist
 *   --force     Re-download all covers
 *   --data-only Update music-data.ts without re-syncing covers
 */

import { musicData } from "../src/lib/music-data";
import { writeMusicDataFile } from "../src/lib/music-data-write";
import {
  FAVORITE_SONGS_PLAYLIST,
  fetchFavoriteSongsPlaylist,
} from "../src/lib/apple-music-playlist";
import { syncMusicDataWithPlaylist } from "../src/lib/music-playlist-sync";
import {
  syncAllMusicCovers,
  writeMusicCoversJson,
} from "../src/lib/music-cover-sync";
import { writeRefreshedMusicCoversMetadata } from "../src/lib/music-covers-metadata";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const prune = process.argv.includes("--prune");
  const force = process.argv.includes("--force");
  const dataOnly = process.argv.includes("--data-only");

  console.log("\n🎵 Syncing music library with Apple Music playlist...\n");
  console.log(`   ${FAVORITE_SONGS_PLAYLIST.url}`);
  if (dryRun) console.log("   (dry run — no files will be written)\n");
  if (prune) console.log("   (pruning tracks not in playlist)\n");
  if (force) console.log("   (forcing cover re-download)\n");
  if (dataOnly) console.log("   (updating music-data.ts only)\n");

  const playlist = await fetchFavoriteSongsPlaylist();
  console.log(`   Fetched ${playlist.length} playlist track(s)\n`);

  const { tracks, stats } = syncMusicDataWithPlaylist(musicData, playlist, {
    prune,
  });

  console.log("   Library sync:");
  console.log(`   • ${stats.matched} matched existing track(s)`);
  console.log(`   • ${stats.added} new track(s) from playlist`);
  if (stats.keptUnmatched > 0) {
    console.log(`   • ${stats.keptUnmatched} local track(s) kept at end`);
  }
  if (stats.pruned > 0) {
    console.log(`   • ${stats.pruned} local track(s) pruned`);
  }
  console.log(`   • ${tracks.length} total track(s) in music-data.ts\n`);

  if (dryRun) {
    console.log("   First 10 tracks after sync:");
    for (const track of tracks.slice(0, 10)) {
      const album = track.album ? ` [${track.album}]` : "";
      console.log(`   - ${track.author} — ${track.title}${album}`);
    }
    console.log("\n✅ Dry run complete.\n");
    return;
  }

  writeMusicDataFile(tracks);
  console.log("   Wrote src/lib/music-data.ts\n");

  if (dataOnly) {
    writeRefreshedMusicCoversMetadata(tracks);
    console.log("   Refreshed src/lib/music-covers.json metadata\n");
    console.log("✅ Playlist metadata sync complete.\n");
    return;
  }

  console.log("   Syncing covers (album-aware)...\n");

  const payload = await syncAllMusicCovers(tracks, { force });
  const { stats: coverStats, ...covers } = payload;
  writeMusicCoversJson(covers);

  console.log(
    `\n✅ Wrote ${covers.tracks.length} track(s) to src/lib/music-covers.json`
  );
  console.log(
    `   ${coverStats.cached} cached, ${coverStats.downloaded} downloaded, ${coverStats.missing} missing, ${coverStats.kept} kept existing`
  );
  console.log(`   Covers in public/music/covers/\n`);
}

main().catch((error) => {
  console.error("\n❌ Playlist sync failed:", error);
  process.exit(1);
});
