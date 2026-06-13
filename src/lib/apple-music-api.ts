export const APPLE_MUSIC_STOREFRONT = "nl";

const TOKEN_TTL_MS = 45 * 60 * 1000;

const APPLE_MUSIC_HEADERS = {
  Accept: "*/*",
  Origin: "https://music.apple.com",
  Referer: "https://music.apple.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
};

type CachedToken = {
  value: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

async function scrapeAppleMusicToken(): Promise<string> {
  const browseResponse = await fetch(
    `https://music.apple.com/${APPLE_MUSIC_STOREFRONT}/browse`,
    { headers: APPLE_MUSIC_HEADERS }
  );

  if (!browseResponse.ok) {
    throw new Error(`Apple Music browse failed (${browseResponse.status})`);
  }

  const html = await browseResponse.text();
  const scriptPath = html.match(/src="(\/assets\/index~[^"]+\.js)"/)?.[1];

  if (!scriptPath) {
    throw new Error("Could not find Apple Music bootstrap script");
  }

  const scriptResponse = await fetch(`https://music.apple.com${scriptPath}`, {
    headers: APPLE_MUSIC_HEADERS,
  });

  if (!scriptResponse.ok) {
    throw new Error(`Apple Music script failed (${scriptResponse.status})`);
  }

  const script = await scriptResponse.text();
  const token = script.match(
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/
  )?.[0];

  if (!token) {
    throw new Error("Could not scrape Apple Music API token");
  }

  return token;
}

export async function getAppleMusicToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const value = await scrapeAppleMusicToken();
  cachedToken = { value, expiresAt: now + TOKEN_TTL_MS };
  return value;
}

export function formatAppleMusicArtworkUrl(
  template: string,
  size = 600
): string {
  return template.replace("{w}", String(size)).replace("{h}", String(size));
}

export type AppleMusicArtworkAttributes = {
  name?: string;
  artistName?: string;
  artwork?: { url?: string };
};

type AppleMusicSearchBucket = {
  data?: Array<{ attributes?: AppleMusicArtworkAttributes }>;
};

export async function searchAppleMusic(
  term: string,
  types: "songs" | "albums" | "songs,albums",
  limit = 10
): Promise<{
  songs: AppleMusicArtworkAttributes[];
  albums: AppleMusicArtworkAttributes[];
}> {
  const token = await getAppleMusicToken();
  const params = new URLSearchParams({
    term,
    types,
    limit: String(limit),
  });

  const response = await fetch(
    `https://amp-api.music.apple.com/v1/catalog/${APPLE_MUSIC_STOREFRONT}/search?${params}`,
    {
      headers: {
        ...APPLE_MUSIC_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    cachedToken = null;
    return searchAppleMusic(term, types, limit);
  }

  if (!response.ok) {
    throw new Error(`Apple Music search failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    results?: {
      songs?: AppleMusicSearchBucket;
      albums?: AppleMusicSearchBucket;
    };
  };

  return {
    songs: (payload.results?.songs?.data ?? []).map(
      (item) => item.attributes ?? {}
    ),
    albums: (payload.results?.albums?.data ?? []).map(
      (item) => item.attributes ?? {}
    ),
  };
}

export function pickAppleMusicArtwork(
  attributes: AppleMusicArtworkAttributes | undefined
): string | null {
  const template = attributes?.artwork?.url;
  if (!template) return null;
  return formatAppleMusicArtworkUrl(template);
}
