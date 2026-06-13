import type { IncomingMessage } from "node:http";
import type { MusicData } from "../../lib/music-api";
import { addMusicEntry } from "../../lib/music-data-write";

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

export async function handleAddMusic(req: IncomingMessage): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production" }, { status: 404 });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = JSON.parse(await readBody(req)) as Partial<MusicData>;
    const result = await addMusicEntry({
      title: body.title ?? "",
      author: body.author ?? "",
      type: body.type === "album" ? "album" : "single",
      album: body.album,
      unreleased: body.unreleased,
    });

    if (result.duplicate) {
      return Response.json(
        {
          error: "This track is already in musicData",
          code: result.code,
          duplicate: true,
        },
        { status: 409 }
      );
    }

    return Response.json({
      ok: true,
      code: result.code,
      message: "Added to src/lib/music-data.ts",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add music entry";
    return Response.json({ error: message }, { status: 400 });
  }
}
