import type { IncomingMessage } from "node:http";

type ApiHandler = (
  req: IncomingMessage,
  requestUrl: URL
) => Promise<Response>;

const routes: Record<string, ApiHandler> = {
  "/api/music/album-art": async (_req, requestUrl) => {
    const { handleAlbumArt } = await import("./handlers/album-art");
    return handleAlbumArt(requestUrl);
  },
  "/api/music/add": async (req) => {
    const { handleAddMusic } = await import("./handlers/add-music");
    return handleAddMusic(req);
  },
  "/api/music/streaming-url": async (_req, requestUrl) => {
    const { handleStreamingUrl } = await import("./handlers/streaming-url");
    return handleStreamingUrl(requestUrl);
  },
  "/api/music/playlist-order": async () => {
    const { handlePlaylistOrder } = await import("./handlers/playlist-order");
    return handlePlaylistOrder();
  },
  "/api/supply/purchase": async (req) => {
    const { handleSupplyPurchase } = await import("./handlers/supply-purchase");
    return handleSupplyPurchase(req);
  },
  "/api/supply/checkout-complete": async (_req, requestUrl) => {
    const { handleSupplyCheckoutComplete } = await import(
      "./handlers/supply-checkout-complete"
    );
    return handleSupplyCheckoutComplete(requestUrl);
  },
  "/api/supply/polar-webhook": async (req) => {
    const { handleSupplyPolarWebhook } = await import(
      "./handlers/supply-polar-webhook"
    );
    return handleSupplyPolarWebhook(req);
  },
};

export async function handleApiRequest(
  req: IncomingMessage,
  res: {
    statusCode: number;
    setHeader: (name: string, value: string) => void;
    end: (body?: string) => void;
  },
  next: (error?: unknown) => void
) {
  const url = req.url?.split("?")[0] ?? "";
  if (!url.startsWith("/api/")) {
    next();
    return;
  }

  const handler = routes[url];
  if (!handler) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "API route not found" }));
    return;
  }

  try {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    const response = await handler(req, requestUrl);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.end(await response.text());
  } catch (error) {
    next(error);
  }
}
