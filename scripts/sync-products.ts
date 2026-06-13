/**
 * Prebuild script to sync products with Printify.
 * Only syncs products stuck in "Publishing..." state (is_locked=true).
 * Writes src/lib/supply-products.json so pages load from cache instead of the API.
 *
 * Run manually: bun run scripts/sync-products.ts
 * Runs automatically before build via the "prebuild" script in package.json
 */

import fs from "node:fs";
import path from "node:path";
import {
  syncPublishedProducts,
  getShops,
  getAllProducts,
  getEnabledVariants,
  getPublishedProducts,
} from "../src/lib/printify";

const SUPPLY_PRODUCTS_PATH = path.join(
  process.cwd(),
  "src/lib/supply-products.json"
);

function writeSupplyProductsCache(products: Awaited<ReturnType<typeof getPublishedProducts>>) {
  const payload = {
    syncedAt: new Date().toISOString(),
    products,
  };
  fs.writeFileSync(SUPPLY_PRODUCTS_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\n📦 Wrote ${products.length} product(s) to src/lib/supply-products.json\n`);
}

async function main() {
  if (!process.env.PRINTIFY_SHOP_ID || !process.env.PRINTIFY_API_TOKEN) {
    return console.log("PRINTIFY_SHOP_ID or PRINTIFY_API_TOKEN is not set, skipping sync products");
  }

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

  try {
    const products = await getPublishedProducts();
    writeSupplyProductsCache(products);
  } catch (error) {
    console.error("\n❌ Failed to write supply products cache:", error);
    process.exit(1);
  }
}

main();
