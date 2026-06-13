import type { PrintifyShippingAddress } from "@/lib/printify";

const STORAGE_KEY = "supply-checkout";

export type StoredSupplyCheckout = {
  address: PrintifyShippingAddress;
  shippingMethod: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadStoredSupplyCheckout(): StoredSupplyCheckout | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredSupplyCheckout>;
    if (!parsed || typeof parsed !== "object" || !parsed.address) {
      return null;
    }

    return {
      address: parsed.address,
      shippingMethod:
        typeof parsed.shippingMethod === "number" ? parsed.shippingMethod : 1,
    };
  } catch {
    return null;
  }
}

export function saveStoredSupplyCheckout(data: StoredSupplyCheckout) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota or privacy mode errors.
  }
}
