import type { IncomingMessage } from "node:http";

type ApiHandler = (
  req: IncomingMessage,
  url: URL
) => Promise<Response> | Response;

type LoadModule = (id: string) => Promise<Record<string, unknown>>;

async function loadHandler<T>(
  loadModule: LoadModule,
  moduleId: string,
  exportName: string
): Promise<T> {
  const mod = await loadModule(moduleId);
  const handler = mod[exportName];
  if (typeof handler !== "function") {
    throw new Error(`API handler "${exportName}" is missing in ${moduleId}`);
  }
  return handler as T;
}

export async function handleApiRequest(
  req: IncomingMessage,
  url: URL,
  loadModule: LoadModule
): Promise<Response | null> {
  const pathname = url.pathname;

  if (pathname === "/api/music/album-art") {
    if (req.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    const handleAlbumArt = await loadHandler<
      (requestUrl: URL) => Promise<Response>
    >(loadModule, "/src/server/handlers/album-art.ts", "handleAlbumArt");
    return handleAlbumArt(url);
  }

  if (pathname === "/api/music/add") {
    const handleAddMusic = await loadHandler<
      (request: IncomingMessage) => Promise<Response>
    >(loadModule, "/src/server/handlers/add-music.ts", "handleAddMusic");
    return handleAddMusic(req);
  }

  if (pathname === "/api/music/streaming-url") {
    if (req.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    const handleStreamingUrl = await loadHandler<
      (requestUrl: URL) => Promise<Response>
    >(loadModule, "/src/server/handlers/streaming-url.ts", "handleStreamingUrl");
    return handleStreamingUrl(url);
  }

  if (pathname === "/api/music/playlist-order") {
    if (req.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    const handlePlaylistOrder = await loadHandler<
      () => Promise<Response>
    >(loadModule, "/src/server/handlers/playlist-order.ts", "handlePlaylistOrder");
    return handlePlaylistOrder();
  }

  if (pathname === "/api/supply/purchase") {
    const handleSupplyPurchase = await loadHandler<
      (request: IncomingMessage) => Promise<Response>
    >(loadModule, "/src/server/handlers/supply-purchase.ts", "handleSupplyPurchase");
    return handleSupplyPurchase(req);
  }

  if (pathname === "/api/supply/checkout-complete") {
    if (req.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    const handleSupplyCheckoutComplete = await loadHandler<
      (requestUrl: URL) => Promise<Response>
    >(
      loadModule,
      "/src/server/handlers/supply-checkout-complete.ts",
      "handleSupplyCheckoutComplete"
    );
    return handleSupplyCheckoutComplete(url);
  }

  if (pathname === "/api/supply/polar-webhook") {
    const handleSupplyPolarWebhook = await loadHandler<
      (request: IncomingMessage) => Promise<Response>
    >(
      loadModule,
      "/src/server/handlers/supply-polar-webhook.ts",
      "handleSupplyPolarWebhook"
    );
    return handleSupplyPolarWebhook(req);
  }

  return null;
}
