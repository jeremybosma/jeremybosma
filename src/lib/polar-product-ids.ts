const ENV_PREFIX = "POLAR_PRODUCT_";

let cachedMap: Record<string, string> | null = null;

function loadPolarProductIds(): Record<string, string> {
  if (cachedMap) return cachedMap;

  const map: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(ENV_PREFIX)) continue;

    const printifyId = key.slice(ENV_PREFIX.length);
    if (printifyId && value?.trim()) {
      map[printifyId] = value.trim();
    }
  }

  cachedMap = map;
  return map;
}

export function getPolarProductId(printifyProductId: string): string {
  const polarProductId = loadPolarProductIds()[printifyProductId];
  if (!polarProductId) {
    throw new Error(
      `No Polar product configured for Printify product ${printifyProductId}. Set POLAR_PRODUCT_${printifyProductId}.`
    );
  }

  return polarProductId;
}

export function isPolarConfiguredForProduct(printifyProductId: string): boolean {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN &&
      loadPolarProductIds()[printifyProductId]
  );
}

export function isPolarProductCatalogConfigured(): boolean {
  return Object.keys(loadPolarProductIds()).length > 0;
}
