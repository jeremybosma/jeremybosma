import type { IncomingMessage } from "node:http";
import { isPolarConfiguredForProduct } from "../../lib/polar-product-ids";
import { createSupplyCheckoutSession } from "../../lib/supply-polar";
import {
  parseSupplyPurchaseRequest,
  validateSupplyPurchase,
} from "../../lib/supply-purchase";
import { getCachedProduct } from "../../lib/supply-products";
import {
  calculateOrderShipping,
} from "../../lib/printify";

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

export async function handleSupplyPurchase(
  req: IncomingMessage
): Promise<Response> {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!process.env.PRINTIFY_API_TOKEN || !process.env.PRINTIFY_SHOP_ID) {
    return Response.json(
      { error: "Printify is not configured on this server" },
      { status: 503 }
    );
  }

  try {
    const body = JSON.parse(await readBody(req)) as unknown;
    const request = parseSupplyPurchaseRequest(body);
    const validated = validateSupplyPurchase(request);

    if (request.action === "shipping") {
      const shipping = await calculateOrderShipping(
        validated.lineItems,
        validated.address
      );

      return Response.json({
        shipping,
        subtotal: validated.variant.price * validated.quantity,
      });
    }

    if (!process.env.POLAR_ACCESS_TOKEN) {
      return Response.json(
        { error: "Payments are not configured on this server" },
        { status: 503 }
      );
    }

    if (!isPolarConfiguredForProduct(validated.productId)) {
      return Response.json(
        {
          error: `Payments are not configured for this product. Set POLAR_PRODUCT_${validated.productId}.`,
        },
        { status: 503 }
      );
    }

    const product = getCachedProduct(validated.productId);
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const variant = product.variants.find(
      (item) => item.id === validated.variant.id
    );

    const { checkoutUrl } = await createSupplyCheckoutSession(
      validated,
      product.title,
      variant?.title ?? "Selected variant",
      validated.address.country
    );

    return Response.json({ checkoutUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process purchase";
    const status = message.includes("not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
