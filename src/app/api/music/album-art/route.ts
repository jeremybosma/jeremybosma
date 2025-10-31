import { NextRequest, NextResponse } from "next/server";

// Server-side only - API key is not exposed to client
const LASTFM_API_KEY = process.env.LASTFM_API_KEY || "43693f63a309e7a0326e2d97a8e8dc6c";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const artist = searchParams.get("artist");
    const title = searchParams.get("title");
    const type = searchParams.get("type") as "single" | "album" | null;
    const album = searchParams.get("album"); // Optional album name for singles

    if (!artist || !title || !type) {
        return NextResponse.json(
            { error: "Missing required parameters: artist, title, type" },
            { status: 400 }
        );
    }

    try {
        let imageUrl: string | null = null;

        // If single with album specified, use album art
        if (type === "single" && album) {
            const params = new URLSearchParams({
                method: "album.getinfo",
                api_key: LASTFM_API_KEY,
                artist: artist,
                album: album,
                format: "json",
                autocorrect: "1",
            });

            const response = await fetch(
                `https://ws.audioscrobbler.com/2.0/?${params}`,
                {
                    next: { revalidate: 86400 },
                }
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
            // Default behavior
            const method = type === "album" ? "album.getinfo" : "track.getinfo";
            const params = new URLSearchParams({
                method,
                api_key: LASTFM_API_KEY,
                artist: artist,
                [type === "album" ? "album" : "track"]: title,
                format: "json",
                autocorrect: "1",
            });

            const response = await fetch(
                `https://ws.audioscrobbler.com/2.0/?${params}`,
                {
                    next: { revalidate: 86400 },
                }
            );

            if (!response.ok) {
                console.error("Last.fm API error:", response.status);
                return NextResponse.json(
                    { error: "Last.fm API error", imageUrl: null },
                    { status: response.status }
                );
            }

            const data = await response.json();

            if (data.error) {
                console.error(`Last.fm API error: ${data.message}`);
                return NextResponse.json({ error: data.message, imageUrl: null }, { status: 400 });
            }

            if (type === "album") {
                // For albums, images are directly in album.image
                const images = data.album?.image;
                if (images && images.length > 0) {
                    const largestImage = images[images.length - 1];
                    imageUrl = largestImage["#text"];
                }
            } else {
                // For singles/tracks, images are in track.album.image
                const images = data.track?.album?.image;
                if (images && images.length > 0) {
                    const largestImage = images[images.length - 1];
                    imageUrl = largestImage["#text"];
                }
            }
        }

        // Check if it's a placeholder image or empty
        if (!imageUrl || imageUrl.includes("2a96cbd8b46e442fc41c2b86b821562f") || imageUrl === "") {
            return NextResponse.json({ imageUrl: null }, { status: 200 });
        }

        return NextResponse.json({ imageUrl }, { status: 200 });
    } catch (error) {
        console.error("Error fetching album art:", error);
        return NextResponse.json(
            { error: "Internal server error", imageUrl: null },
            { status: 500 }
        );
    }
}

