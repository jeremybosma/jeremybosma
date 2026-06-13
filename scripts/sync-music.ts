/**
 * Downloads album art from iTunes into public/music/covers/
 * and writes src/lib/music-covers.json with local image paths.
 *
 * Run manually: bun run sync:music
 * Runs automatically before build via the "prebuild" script in package.json
 */

import { musicData } from "../src/lib/music-data";
import {
  syncAllMusicCovers,
  writeMusicCoversJson,
} from "../src/lib/music-cover-sync";

async function main() {
  const force = process.argv.includes("--force");

  console.log("\n🎵 Syncing music covers to public/music/covers/...\n");
  if (force) {
    console.log("  (forcing re-download of all covers)\n");
  }

  const payload = await syncAllMusicCovers(musicData, { force });

  const { stats, ...covers } = payload;
  writeMusicCoversJson(covers);

  console.log(
    `\n✅ Wrote ${covers.tracks.length} track(s) to src/lib/music-covers.json`
  );
  console.log(
    `   ${stats.cached} cached, ${stats.downloaded} downloaded, ${stats.missing} missing, ${stats.kept} kept existing`
  );
  console.log(`   Covers in public/music/covers/\n`);
}

main().catch((error) => {
  console.error("\n❌ Music sync failed:", error);
  process.exit(1);
});
