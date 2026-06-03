const LASTFM_API_KEY =
  process.env.LASTFM_API_KEY || "43693f63a309e7a0326e2d97a8e8dc6c";

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
    let imageUrl: string | null = null;

    if (type === "single" && album) {
      const params = new URLSearchParams({
        method: "album.getinfo",
        api_key: LASTFM_API_KEY,
        artist,
        album,
        format: "json",
        autocorrect: "1",
      });

      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        if (!data.error && data.album?.image) {
          const images = data.album.image;
          const largestImage = images[images.length - 1];
          imageUrl = largestImage["#text"];
        }
      }
    } else {
      const method = type === "album" ? "album.getinfo" : "track.getinfo";
      const params = new URLSearchParams({
        method,
        api_key: LASTFM_API_KEY,
        artist,
        [type === "album" ? "album" : "track"]: title,
        format: "json",
        autocorrect: "1",
      });

      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`
      );

      if (!response.ok) {
        console.error("Last.fm API error:", response.status);
        return Response.json(
          { error: "Last.fm API error", imageUrl: null },
          { status: response.status }
        );
      }

      const data = await response.json();

      if (data.error) {
        console.error(`Last.fm API error: ${data.message}`);
        return Response.json(
          { error: data.message, imageUrl: null },
          { status: 400 }
        );
      }

      if (type === "album") {
        const images = data.album?.image;
        if (images && images.length > 0) {
          const largestImage = images[images.length - 1];
          imageUrl = largestImage["#text"];
        }
      } else {
        const images = data.track?.album?.image;
        if (images && images.length > 0) {
          const largestImage = images[images.length - 1];
          imageUrl = largestImage["#text"];
        }
      }
    }

    if (
      !imageUrl ||
      imageUrl.includes("2a96cbd8b46e442fc41c2b86b821562f") ||
      imageUrl === ""
    ) {
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
