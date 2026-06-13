import type { PrintifyShippingCosts } from "@/lib/printify";

export function getShippingCostForMethod(
  costs: PrintifyShippingCosts,
  method: number
): number | null {
  if (method === 1) return costs.standard ?? null;
  if (method === 2) return costs.priority ?? costs.express ?? null;
  if (method === 4) return costs.economy ?? null;
  return costs.standard ?? null;
}
