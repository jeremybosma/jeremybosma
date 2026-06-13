function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s*\(deluxe.*?\)/gi, "")
    .replace(/\s*\(explicit.*?\)/gi, "")
    .replace(/\s*\(expanded.*?\)/gi, "")
    .replace(/\s*\(remastered.*?\)/gi, "")
    .replace(/\s*\(.*?version.*?\)/gi, "")
    .replace(/\s*\[.*?\]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTrackTitle(value: string): string {
  return normalizeText(value)
    .replace(/\s*-\s*single$/i, "")
    .replace(/\s*\(feat\.[^)]*\)/gi, "")
    .replace(/\s*\(ft\.[^)]*\)/gi, "")
    .replace(/\s*\(with[^)]*\)/gi, "")
    .trim();
}

function normalizeArtist(value: string): string {
  return normalizeText(value)
    .replace(/\s*feat\.?\s*/gi, "")
    .replace(/\s*ft\.?\s*/gi, "")
    .replace(/\s*&\s*/g, "")
    .trim();
}

function artistMatches(resultArtist: string, searchArtist: string): boolean {
  const result = normalizeArtist(resultArtist);
  const search = normalizeArtist(searchArtist);

  if (result === search) return true;

  const mainResult = result.split(/,|feat|ft/)[0].trim();
  const mainSearch = search.split(/,|feat|ft/)[0].trim();
  if (mainResult === mainSearch) return true;

  const compactResult = result.replace(/[^a-z0-9]/g, "");
  const compactSearch = search.replace(/[^a-z0-9]/g, "");
  if (compactResult === compactSearch) return true;

  const minLength = Math.min(result.length, search.length);
  if (minLength > 2 && (result.startsWith(search) || search.startsWith(result))) {
    return true;
  }

  return false;
}

function titleMatches(resultTitle: string, searchTitle: string): boolean {
  const result = normalizeTrackTitle(resultTitle);
  const search = normalizeTrackTitle(searchTitle);

  if (result === search) return true;

  if (search.length <= 10) {
    if (result === search) return true;
    if (result.startsWith(search) || search.startsWith(result)) return true;
  }

  if (result.includes(search) || search.includes(result)) {
    const ratio =
      Math.min(result.length, search.length) /
      Math.max(result.length, search.length);
    return ratio > 0.55;
  }

  return false;
}

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

async function searchItunes(
  term: string,
  entity: "album" | "song" | "musicArtist",
  limit = 25
): Promise<ItunesResult[]> {
  const params = new URLSearchParams({
    term,
    entity,
    limit: String(limit),
  });

  const response = await fetch(`https://itunes.apple.com/search?${params}`);
  if (!response.ok) return [];

  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}

async function lookupItunes(
  id: number,
  entity: "song" | "album",
  limit = 200
): Promise<ItunesResult[]> {
  const params = new URLSearchParams({
    id: String(id),
    entity,
    limit: String(limit),
  });

  const response = await fetch(`https://itunes.apple.com/lookup?${params}`);
  if (!response.ok) return [];

  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
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
      titleMatches(result.collectionName ?? "", album)
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
  const artistId = await findArtistId(artist);
  if (!artistId) return null;

  const songs = await lookupItunes(artistId, "song");
  const trackMatch = findTrackMatch(songs, artist, title);
  const trackArt = pickArtwork(trackMatch);
  if (trackArt) return trackArt;

  if (type === "single" && album) {
    const albumMatch = songs.find(
      (result) =>
        result.wrapperType === "track" &&
        artistMatches(result.artistName ?? "", artist) &&
        titleMatches(result.trackName ?? "", title) &&
        titleMatches(result.collectionName ?? "", album)
    );
    const albumTrackArt = pickArtwork(albumMatch);
    if (albumTrackArt) return albumTrackArt;
  }

  const albums = await lookupItunes(artistId, "album");
  const albumName = type === "album" ? title : album;
  if (albumName) {
    const albumMatch = findAlbumMatch(albums, artist, albumName);
    const albumArt = pickArtwork(albumMatch);
    if (albumArt) return albumArt;
  }

  if (type === "single") {
    const singleRelease = albums.find(
      (result) =>
        result.wrapperType === "collection" &&
        artistMatches(result.artistName ?? "", artist) &&
        titleMatches(result.collectionName ?? "", title)
    );
    const singleArt = pickArtwork(singleRelease);
    if (singleArt) return singleArt;
  }

  return null;
}

export async function fetchAlbumArtFromItunes(
  artist: string,
  title: string,
  type: "single" | "album",
  album?: string
): Promise<string | null> {
  try {
    if (type === "single" && album) {
      const albumResults = await searchItunes(`${artist} ${album}`, "album");
      const albumMatch = findAlbumMatch(albumResults, artist, album);
      const albumArt = pickArtwork(albumMatch);
      if (albumArt) return albumArt;

      const songResults = await searchItunes(`${artist} ${album}`, "song");
      const collectionMatch = findAlbumMatch(songResults, artist, album);
      const collectionArt = pickArtwork(collectionMatch);
      if (collectionArt) return collectionArt;

      const trackResults = await searchItunes(`${artist} ${title}`, "song");
      const trackMatch = findTrackMatch(trackResults, artist, title);
      const trackArt = pickArtwork(trackMatch);
      if (trackArt) return trackArt;
    }

    if (type === "album") {
      const albumResults = await searchItunes(`${artist} ${title}`, "album");
      const albumMatch = findAlbumMatch(albumResults, artist, title);
      const albumArt = pickArtwork(albumMatch);
      if (albumArt) return albumArt;

      const songResults = await searchItunes(`${artist} ${title}`, "song");
      const collectionMatch = findAlbumMatch(songResults, artist, title);
      const collectionArt = pickArtwork(collectionMatch);
      if (collectionArt) return collectionArt;
    } else {
      const songResults = await searchItunes(`${artist} ${title}`, "song");
      const trackMatch = findTrackMatch(songResults, artist, title);
      const trackArt = pickArtwork(trackMatch);
      if (trackArt) return trackArt;
    }

    return fetchFromArtistCatalog(artist, title, type, album);
  } catch (error) {
    console.error("Error fetching album art from iTunes:", error);
    return null;
  }
}
