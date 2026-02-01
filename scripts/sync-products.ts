/**
 * Prebuild script to sync products with Printify.
 * Only syncs products stuck in "Publishing..." state (is_locked=true).
 * 
 * Run manually: bun run scripts/sync-products.ts
 * Runs automatically before build via the "prebuild" script in package.json
 */

import { syncPublishedProducts, getShops, getAllProducts, getEnabledVariants } from "../src/lib/printify";

async function main() {
  console.log("\n🔄 Syncing products with Printify...\n");

  // First, show shop info for debugging
  try {
    const shops = await getShops();
    console.log("📍 Connected shops:");
    for (const shop of shops) {
      console.log(`   - ${shop.title} (ID: ${shop.id}, Channel: ${shop.sales_channel})`);
    }
    console.log("");
  } catch (error) {
    console.error("⚠️  Could not fetch shops:", error);
  }

  // Show product states for debugging
  try {
    const allProducts = await getAllProducts();
    const visible = allProducts.filter((p) => p.visible);
    const locked = allProducts.filter((p) => p.is_locked);
    const publishable = allProducts.filter(
      (p) => p.visible && getEnabledVariants(p).length > 0
    );
    const stuckInPublishing = allProducts.filter(
      (p) => p.is_locked && p.visible && getEnabledVariants(p).length > 0
    );

    console.log("📊 Product states:");
    console.log(`   - Total products: ${allProducts.length}`);
    console.log(`   - Visible: ${visible.length}`);
    console.log(`   - Locked (in Publishing...): ${locked.length}`);
    console.log(`   - Ready for storefront: ${publishable.length}`);
    console.log(`   - Stuck in 'Publishing...' (will sync): ${stuckInPublishing.length}`);
    console.log("");
  } catch (error) {
    console.error("⚠️  Could not analyze products:", error);
  }

  // Sync products stuck in "Publishing..." state
  try {
    const syncedIds = await syncPublishedProducts();
    if (syncedIds.length > 0) {
      console.log(`\n✅ Cleared 'Publishing...' state for ${syncedIds.length} products\n`);
    } else {
      console.log("\n✅ No products needed syncing\n");
    }
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
