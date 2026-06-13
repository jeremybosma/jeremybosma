import type { IncomingMessage } from "node:http";
import { fulfillSupplyCheckoutSession } from "../../lib/supply-polar";

export async function handleSupplyCheckoutComplete(
  requestUrl: URL
): Promise<Response> {
  const checkoutId =
    requestUrl.searchParams.get("checkout_id")?.trim() ??
    requestUrl.searchParams.get("session_id")?.trim();

  if (!checkoutId) {
    return Response.json(
      { error: "checkout_id is required" },
      { status: 400 }
    );
  }

  try {
    const result = await fulfillSupplyCheckoutSession(checkoutId);
    return Response.json({
      orderId: result.orderId,
      alreadyFulfilled: result.alreadyFulfilled,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to complete checkout";
    return Response.json({ error: message }, { status: 400 });
  }
}
