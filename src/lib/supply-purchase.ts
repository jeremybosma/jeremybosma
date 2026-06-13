import {
  getEnabledVariants,
  type PrintifyOrderLineItem,
  type PrintifyShippingAddress,
  type PrintifyVariant,
} from "@/lib/printify";
import { assertSupplyAddress } from "@/lib/supply-address";
import { getCachedProduct } from "@/lib/supply-products";

export type SupplyPurchaseRequest = {
  action: "shipping" | "checkout";
  productId: string;
  variantId: number;
  quantity?: number;
  shippingMethod?: number;
  address: PrintifyShippingAddress;
};

export type ValidatedSupplyPurchase = {
  productId: string;
  variant: PrintifyVariant;
  quantity: number;
  shippingMethod: number;
  address: PrintifyShippingAddress;
  lineItems: PrintifyOrderLineItem[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseSupplyPurchaseRequest(
  body: unknown
): SupplyPurchaseRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const data = body as Partial<SupplyPurchaseRequest> & {
    address?: Partial<PrintifyShippingAddress>;
  };

  if (data.action !== "shipping" && data.action !== "checkout") {
    throw new Error("Invalid action");
  }

  if (!isNonEmptyString(data.productId)) {
    throw new Error("Product ID is required");
  }

  if (typeof data.variantId !== "number" || !Number.isFinite(data.variantId)) {
    throw new Error("Variant ID is required");
  }

  const address = data.address;
  if (!address) {
    throw new Error("Shipping address is required");
  }

  const normalizedAddress = assertSupplyAddress(address);

  return {
    action: data.action,
    productId: data.productId.trim(),
    variantId: data.variantId,
    quantity:
      typeof data.quantity === "number" && data.quantity > 0
        ? Math.min(Math.floor(data.quantity), 10)
        : 1,
    shippingMethod:
      typeof data.shippingMethod === "number" &&
      data.shippingMethod >= 1 &&
      data.shippingMethod <= 4
        ? data.shippingMethod
        : 1,
    address: normalizedAddress,
  };
}

export function validateSupplyPurchase(
  request: SupplyPurchaseRequest
): ValidatedSupplyPurchase {
  const product = getCachedProduct(request.productId);
  if (!product?.visible) {
    throw new Error("Product not found");
  }

  const enabledVariants = getEnabledVariants(product);
  const variant = enabledVariants.find((item) => item.id === request.variantId);
  if (!variant) {
    throw new Error("Selected variant is unavailable");
  }

  return {
    productId: product.id,
    variant,
    quantity: request.quantity ?? 1,
    shippingMethod: request.shippingMethod ?? 1,
    address: request.address,
    lineItems: [
      {
        product_id: product.id,
        variant_id: variant.id,
        quantity: request.quantity ?? 1,
      },
    ],
  };
}
