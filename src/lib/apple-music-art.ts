import {
  pickAppleMusicArtwork,
  searchAppleMusic,
  type AppleMusicArtworkAttributes,
} from "./apple-music-api";
import {
  albumMatches,
  artistMatches,
  primaryArtist,
  titleMatches,
} from "./music-art-match";

function pickSongMatch(
  songs: AppleMusicArtworkAttributes[],
  artist: string,
  title: string
): string | null {
  const match = songs.find(
    (song) =>
      artistMatches(song.artistName ?? "", artist) &&
      titleMatches(song.name ?? "", title)
  );

  return pickAppleMusicArtwork(match);
}

function pickAlbumMatch(
  albums: AppleMusicArtworkAttributes[],
  artist: string,
  album: string
): string | null {
  const match = albums.find(
    (entry) =>
      artistMatches(entry.artistName ?? "", artist) &&
      albumMatches(entry.name ?? "", album)
  );

  return pickAppleMusicArtwork(match);
}

function buildSearchTerm(...parts: Array<string | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim())
    .join(" ");
}

export async function fetchAlbumArtFromAppleMusic(
  artist: string,
  title: string,
  type: "single" | "album",
  album?: string
): Promise<string | null> {
  const mainArtist = primaryArtist(artist);

  if (type === "single" && album) {
    const albumSearch = await searchAppleMusic(
      buildSearchTerm(mainArtist, album),
      "albums"
    );
    const albumArt = pickAlbumMatch(albumSearch.albums, mainArtist, album);
    if (albumArt) return albumArt;

    const songSearch = await searchAppleMusic(
      buildSearchTerm(mainArtist, title),
      "songs"
    );
    const trackArt = pickSongMatch(songSearch.songs, mainArtist, title);
    if (trackArt) return trackArt;
  }

  if (type === "album") {
    const albumSearch = await searchAppleMusic(
      buildSearchTerm(mainArtist, title),
      "albums"
    );
    const albumArt = pickAlbumMatch(albumSearch.albums, mainArtist, title);
    if (albumArt) return albumArt;
  }

  const songSearch = await searchAppleMusic(
    buildSearchTerm(mainArtist, title),
    "songs"
  );
  const trackArt = pickSongMatch(songSearch.songs, mainArtist, title);
  if (trackArt) return trackArt;

  if (album) {
    const albumSearch = await searchAppleMusic(
      buildSearchTerm(mainArtist, album),
      "albums"
    );
    return pickAlbumMatch(albumSearch.albums, mainArtist, album);
  }

  return null;
}
