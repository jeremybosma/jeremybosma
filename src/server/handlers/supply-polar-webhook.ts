import type { IncomingMessage } from "node:http";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { fulfillSupplyOrderPaid } from "../../lib/supply-polar";

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function headersToRecord(
  headers: IncomingMessage["headers"]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      result[key] = value;
    } else if (Array.isArray(value) && value[0]) {
      result[key] = value[0];
    }
  }
  return result;
}

export async function handleSupplyPolarWebhook(
  req: IncomingMessage
): Promise<Response> {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json(
      { error: "Polar webhooks are not configured" },
      { status: 503 }
    );
  }

  try {
    const payload = await readRawBody(req);
    const event = validateEvent(
      payload,
      headersToRecord(req.headers),
      webhookSecret
    );

    if (event.type === "order.paid") {
      await fulfillSupplyOrderPaid(
        event.data.metadata as Record<string, unknown>,
        event.data.checkoutId
      );
    }

    return new Response("", { status: 202 });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return new Response("", { status: 403 });
    }

    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
