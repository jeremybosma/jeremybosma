import supplyData from "./supply-products.json";
import { getEnabledVariants, type PrintifyProduct } from "./printify";

export type SupplyProductsData = {
  syncedAt: string | null;
  products: PrintifyProduct[];
};

const data = supplyData as SupplyProductsData;

export function getCachedPublishedProducts(): PrintifyProduct[] {
  return data.products.filter(
    (p) => p.visible && getEnabledVariants(p).length > 0
  );
}

export function getCachedProduct(id: string): PrintifyProduct | undefined {
  return data.products.find((p) => p.id === id);
}
