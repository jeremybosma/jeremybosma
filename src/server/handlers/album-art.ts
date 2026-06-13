import { fetchAlbumArtFromItunes } from "../../lib/itunes-album-art";

export async function handleAlbumArt(url: URL): Promise<Response> {
  const searchParams = url.searchParams;
  const artist = searchParams.get("artist");
  const title = searchParams.get("title");
  const type = searchParams.get("type") as "single" | "album" | null;
  const album = searchParams.get("album");

  if (!artist || !title || !type) {
    return Response.json(
      { error: "Missing required parameters: artist, title, type" },
      { status: 400 }
    );
  }

  try {
    const imageUrl = await fetchAlbumArtFromItunes(
      artist,
      title,
      type,
      album ?? undefined
    );

    if (!imageUrl) {
      return Response.json({ imageUrl: null });
    }

    return Response.json({ imageUrl });
  } catch (error) {
    console.error("Error fetching album art:", error);
    return Response.json(
      { error: "Internal server error", imageUrl: null },
      { status: 500 }
    );
  }
}
