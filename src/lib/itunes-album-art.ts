import { fetchAlbumArtFromAppleMusic } from "./apple-music-art";
import {
  albumMatches,
  artistMatches,
  primaryArtist,
  titleMatches,
} from "./music-art-match";

function upscaleArtwork(url: string): string {
  return url.replace(/\/\d+x\d+bb\.jpg$/, "/600x600bb.jpg");
}

type ItunesResult = {
  wrapperType?: string;
  artistName?: string;
  trackName?: string;
  collectionName?: string;
  artworkUrl100?: string;
};

const ITUNES_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
};

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchItunesJson(url: string, retries = 4): Promise<ItunesResult[]> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const response = await fetch(url, { headers: ITUNES_HEADERS });

    if (response.status === 403 || response.status === 429) {
      await sleep(750 * (attempt + 1));
      continue;
    }

    if (!response.ok) return [];

    const data = (await response.json()) as { results?: ItunesResult[] };
    return Array.isArray(data.results) ? data.results : [];
  }

  return [];
}

async function searchItunes(
  term: string,
  entity: "album" | "song" | "musicArtist",
  limit = 25,
  country = "NL"
): Promise<ItunesResult[]> {
  const params = new URLSearchParams({
    term,
    entity,
    limit: String(limit),
    country,
  });

  return fetchItunesJson(`https://itunes.apple.com/search?${params}`);
}

async function lookupItunes(
  id: number,
  entity: "song" | "album",
  limit = 200,
  country = "NL"
): Promise<ItunesResult[]> {
  const params = new URLSearchParams({
    id: String(id),
    entity,
    limit: String(limit),
    country,
  });

  return fetchItunesJson(`https://itunes.apple.com/lookup?${params}`);
}

function pickArtwork(match: ItunesResult | undefined): string | null {
  if (!match?.artworkUrl100) return null;
  return upscaleArtwork(match.artworkUrl100);
}

function findAlbumMatch(
  results: ItunesResult[],
  artist: string,
  album: string
): ItunesResult | undefined {
  return results.find(
    (result) =>
      artistMatches(result.artistName ?? "", artist) &&
      albumMatches(result.collectionName ?? "", album)
  );
}

function findTrackMatch(
  results: ItunesResult[],
  artist: string,
  track: string
): ItunesResult | undefined {
  return results.find(
    (result) =>
      artistMatches(result.artistName ?? "", artist) &&
      titleMatches(result.trackName ?? "", track)
  );
}

async function findArtistId(artist: string): Promise<number | null> {
  const results = await searchItunes(artist, "musicArtist", 10);
  const match = results.find((result) =>
    artistMatches(result.artistName ?? "", artist)
  );

  return (match as { artistId?: number } | undefined)?.artistId ?? null;
}

async function fetchFromArtistCatalog(
  artist: string,
  title: string,
  type: "single" | "album",
  album?: string
): Promise<string | null> {
  const mainArtist = primaryArtist(artist);
  const artistId = await findArtistId(mainArtist);
  if (!artistId) return null;

  const songs = await lookupItunes(artistId, "song");
  const trackMatch = findTrackMatch(songs, mainArtist, title);
  const trackArt = pickArtwork(trackMatch);
  if (trackArt) return trackArt;

  if (type === "single" && album) {
    const albumMatch = songs.find(
      (result) =>
        result.wrapperType === "track" &&
        artistMatches(result.artistName ?? "", mainArtist) &&
        titleMatches(result.trackName ?? "", title) &&
        albumMatches(result.collectionName ?? "", album)
    );
    const albumTrackArt = pickArtwork(albumMatch);
    if (albumTrackArt) return albumTrackArt;
  }

  const albums = await lookupItunes(artistId, "album");
  const albumName = type === "album" ? title : album;
  if (albumName) {
    const albumMatch = findAlbumMatch(albums, mainArtist, albumName);
    const albumArt = pickArtwork(albumMatch);
    if (albumArt) return albumArt;
  }

  if (type === "single") {
    const singleRelease = albums.find(
      (result) =>
        result.wrapperType === "collection" &&
        artistMatches(result.artistName ?? "", mainArtist) &&
        albumMatches(result.collectionName ?? "", title)
    );
    const singleArt = pickArtwork(singleRelease);
    if (singleArt) return singleArt;
  }

  return null;
}

async function fetchAlbumArtFromItunesSearch(
  artist: string,
  title: string,
  type: "single" | "album",
  album?: string
): Promise<string | null> {
  const mainArtist = primaryArtist(artist);

  if (type === "single" && album) {
    const albumResults = await searchItunes(`${mainArtist} ${album}`, "album");
    const albumMatch = findAlbumMatch(albumResults, mainArtist, album);
    const albumArt = pickArtwork(albumMatch);
    if (albumArt) return albumArt;

    const songResults = await searchItunes(`${mainArtist} ${title}`, "song");
    const trackMatch = findTrackMatch(songResults, mainArtist, title);
    const trackArt = pickArtwork(trackMatch);
    if (trackArt) return trackArt;
  }

  if (type === "album") {
    const albumResults = await searchItunes(`${mainArtist} ${title}`, "album");
    const albumMatch = findAlbumMatch(albumResults, mainArtist, title);
    const albumArt = pickArtwork(albumMatch);
    if (albumArt) return albumArt;
  } else {
    const songResults = await searchItunes(`${mainArtist} ${title}`, "song");
    const trackMatch = findTrackMatch(songResults, mainArtist, title);
    const trackArt = pickArtwork(trackMatch);
    if (trackArt) return trackArt;
  }

  return fetchFromArtistCatalog(mainArtist, title, type, album);
}

export async function fetchAlbumArtFromItunes(
  artist: string,
  title: string,
  type: "single" | "album",
  album?: string
): Promise<string | null> {
  try {
    const appleMusicArt = await fetchAlbumArtFromAppleMusic(
      artist,
      title,
      type,
      album
    );
    if (appleMusicArt) return appleMusicArt;

    return await fetchAlbumArtFromItunesSearch(artist, title, type, album);
  } catch (error) {
    console.error("Error fetching album art:", error);

    try {
      return await fetchAlbumArtFromItunesSearch(artist, title, type, album);
    } catch {
      return null;
    }
  }
}
