import { CheckoutStatus } from "@polar-sh/sdk/models/components/checkoutstatus.js";
import type { AddressInputCountryAlpha2Input } from "@polar-sh/sdk/models/components/addressinput.js";
import type { PresentmentCurrency } from "@polar-sh/sdk/models/components/presentmentcurrency.js";
import {
  calculateOrderShipping,
  createOrder,
  getCurrencyConfig,
  type PrintifyShippingAddress,
} from "@/lib/printify";
import { getPolar, getSiteBaseUrl } from "@/lib/polar";
import { getPolarProductId } from "@/lib/polar-product-ids";
import { getShippingCostForMethod } from "@/lib/supply-shipping";
import type { ValidatedSupplyPurchase } from "@/lib/supply-purchase";
import { getCachedProduct } from "@/lib/supply-products";

type SupplyCheckoutMetadata = {
  product_id?: string;
  variant_id?: string;
  quantity?: string;
  shipping_method?: string;
  printify_order_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  region?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zip?: string;
};

function metadataValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function normalizeMetadata(
  metadata: Record<string, unknown> | undefined
): SupplyCheckoutMetadata {
  if (!metadata) return {};
  return Object.fromEntries(
    Object.entries(metadata)
      .map(([key, value]) => [key, metadataValue(value)])
      .filter((entry): entry is [string, string] => entry[1] != null)
  );
}

function addressToMetadata(address: PrintifyShippingAddress) {
  return {
    first_name: address.first_name,
    last_name: address.last_name,
    email: address.email,
    phone: address.phone,
    country: address.country,
    region: address.region,
    address1: address.address1,
    address2: address.address2 ?? "",
    city: address.city,
    zip: address.zip,
  };
}

function metadataToAddress(metadata: SupplyCheckoutMetadata): PrintifyShippingAddress {
  return {
    first_name: metadata.first_name ?? "",
    last_name: metadata.last_name ?? "",
    email: metadata.email ?? "",
    phone: metadata.phone ?? "",
    country: metadata.country ?? "",
    region: metadata.region ?? "",
    address1: metadata.address1 ?? "",
    address2: metadata.address2 || undefined,
    city: metadata.city ?? "",
    zip: metadata.zip ?? "",
  };
}

function toCountryCode(country: string): AddressInputCountryAlpha2Input {
  return country.trim().toUpperCase() as AddressInputCountryAlpha2Input;
}

function toPresentmentCurrency(currency: string): PresentmentCurrency {
  return currency.trim().toLowerCase() as PresentmentCurrency;
}

export async function createSupplyCheckoutSession(
  validated: ValidatedSupplyPurchase,
  productTitle: string,
  variantTitle: string,
  countryCode?: string | null
): Promise<{ checkoutUrl: string }> {
  const polar = getPolar();
  const supplyProductId = getPolarProductId(validated.productId);

  const shipping = await calculateOrderShipping(
    validated.lineItems,
    validated.address
  );
  const shippingCost = getShippingCostForMethod(
    shipping,
    validated.shippingMethod
  );

  if (shippingCost == null) {
    throw new Error("Selected shipping method is unavailable");
  }

  const currency = getCurrencyConfig(countryCode).currency.toLowerCase();
  const baseUrl = getSiteBaseUrl();
  const subtotal = validated.variant.price * validated.quantity;
  const shippingProductId = process.env.POLAR_SHIPPING_PRODUCT_ID?.trim();

  const products = shippingProductId
    ? [supplyProductId, shippingProductId]
    : [supplyProductId];

  const fixedPrice = (amount: number) => ({
    amountType: "fixed" as const,
    priceAmount: amount,
    priceCurrency: toPresentmentCurrency(currency),
  });

  const prices = shippingProductId
    ? {
        [supplyProductId]: [fixedPrice(subtotal)],
        [shippingProductId]: [fixedPrice(shippingCost)],
      }
    : {
        [supplyProductId]: [fixedPrice(subtotal + shippingCost)],
      };

  const checkout = await polar.checkouts.create({
    products,
    prices,
    customerEmail: validated.address.email,
    customerName: `${validated.address.first_name} ${validated.address.last_name}`.trim(),
    customerBillingAddress: {
      country: toCountryCode(validated.address.country),
      line1: validated.address.address1,
      line2: validated.address.address2,
      city: validated.address.city,
      postalCode: validated.address.zip,
      state: validated.address.region || undefined,
    },
    successUrl: `${baseUrl}/supply/${validated.productId}?checkout=success&checkout_id={CHECKOUT_ID}`,
    returnUrl: `${baseUrl}/supply/${validated.productId}?checkout=cancelled`,
    metadata: {
      product_id: validated.productId,
      variant_id: String(validated.variant.id),
      quantity: String(validated.quantity),
      shipping_method: String(validated.shippingMethod),
      ...addressToMetadata(validated.address),
    },
  });

  if (!checkout.url) {
    throw new Error("Failed to create checkout session");
  }

  return { checkoutUrl: checkout.url };
}

async function fulfillSupplyFromMetadata(
  metadata: SupplyCheckoutMetadata,
  externalId: string
): Promise<{ orderId: string; alreadyFulfilled: boolean }> {
  if (metadata.printify_order_id) {
    return {
      orderId: metadata.printify_order_id,
      alreadyFulfilled: true,
    };
  }

  if (!metadata.product_id || !metadata.variant_id) {
    throw new Error("Checkout is missing order details");
  }

  const productId = metadata.product_id;
  const variantId = Number(metadata.variant_id);
  const quantity = Number(metadata.quantity ?? "1");
  const shippingMethod = Number(metadata.shipping_method ?? "1");
  const address = metadataToAddress(metadata);

  const product = getCachedProduct(productId);
  if (!product?.visible) {
    throw new Error("Product is no longer available");
  }

  const variant = product.variants.find((item) => item.id === variantId);
  if (!variant?.is_enabled || !variant.is_available) {
    throw new Error("Selected variant is no longer available");
  }

  const order = await createOrder({
    external_id: externalId,
    line_items: [
      {
        product_id: productId,
        variant_id: variantId,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      },
    ],
    shipping_method: shippingMethod,
    is_printify_express: shippingMethod === 3,
    is_economy_shipping: shippingMethod === 4,
    send_shipping_notification: true,
    address_to: address,
  });

  return { orderId: order.id, alreadyFulfilled: false };
}

export async function fulfillSupplyCheckoutSession(
  checkoutId: string
): Promise<{ orderId: string; alreadyFulfilled: boolean }> {
  const polar = getPolar();
  const checkout = await polar.checkouts.get({ id: checkoutId });

  if (checkout.status !== CheckoutStatus.Succeeded) {
    throw new Error("Payment has not been completed");
  }

  const metadata = normalizeMetadata(checkout.metadata);
  const result = await fulfillSupplyFromMetadata(metadata, checkout.id);

  if (!result.alreadyFulfilled) {
    await polar.checkouts.update({
      id: checkout.id,
      checkoutUpdate: {
        metadata: {
          ...checkout.metadata,
          printify_order_id: result.orderId,
        },
      },
    });
  }

  return result;
}

export async function fulfillSupplyOrderPaid(
  metadataInput: Record<string, unknown> | undefined,
  checkoutId: string | null
): Promise<{ orderId: string; alreadyFulfilled: boolean } | null> {
  const metadata = normalizeMetadata(metadataInput);
  if (!metadata.product_id) {
    return null;
  }

  const externalId = checkoutId ?? metadata.printify_order_id ?? "";
  if (!externalId) {
    throw new Error("Paid order is missing checkout reference");
  }

  const result = await fulfillSupplyFromMetadata(metadata, externalId);

  if (!result.alreadyFulfilled && checkoutId) {
    const polar = getPolar();
    await polar.checkouts.update({
      id: checkoutId,
      checkoutUpdate: {
        metadata: {
          ...metadataInput,
          printify_order_id: result.orderId,
        },
      },
    });
  }

  return result;
}
