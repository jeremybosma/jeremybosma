export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\(deluxe.*?\)/gi, "")
    .replace(/\s*\(explicit.*?\)/gi, "")
    .replace(/\s*\(expanded.*?\)/gi, "")
    .replace(/\s*\(remastered.*?\)/gi, "")
    .replace(/\s*\(.*?version.*?\)/gi, "")
    .replace(/\s*\{feat\.[^}]*\}/gi, "")
    .replace(/\s*\[.*?\]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripFeaturedArtistsFromTitle(value: string): string {
  return value
    .replace(/\s*\(feat\.[^)]*\)/gi, "")
    .replace(/\s*\(featuring[^)]*\)/gi, "")
    .replace(/\s*\(ft\.[^)]*\)/gi, "")
    .replace(/\s*\(with[^)]*\)/gi, "")
    .replace(/\s*\{feat\.[^}]*\}/gi, "")
    .trim();
}

export function normalizeTrackTitle(value: string): string {
  return normalizeText(stripFeaturedArtistsFromTitle(value))
    .replace(/\s*-\s*single$/i, "")
    .replace(/\s*\(remix\)/gi, "")
    .trim();
}

export function normalizeArtist(value: string): string {
  return normalizeText(value)
    .replace(/\s*feat\.?\s*/gi, "")
    .replace(/\s*ft\.?\s*/gi, "")
    .replace(/\s*&\s*/g, " ")
    .trim();
}

export function primaryArtist(value: string): string {
  return value.split(/[,&]/)[0]?.trim() ?? value.trim();
}

export function artistMatches(resultArtist: string, searchArtist: string): boolean {
  const result = normalizeArtist(resultArtist);
  const search = normalizeArtist(searchArtist);

  if (result === search) return true;

  const resultParts = result.split(/[,&]/).map((part) => part.trim()).filter(Boolean);
  const searchParts = search.split(/[,&]/).map((part) => part.trim()).filter(Boolean);

  if (
    resultParts.some((resultPart) =>
      searchParts.some(
        (searchPart) =>
          resultPart === searchPart ||
          resultPart.includes(searchPart) ||
          searchPart.includes(resultPart)
      )
    )
  ) {
    return true;
  }

  const compactResult = result.replace(/[^a-z0-9]/g, "");
  const compactSearch = search.replace(/[^a-z0-9]/g, "");
  if (compactResult === compactSearch) return true;

  const minLength = Math.min(result.length, search.length);
  if (minLength > 2 && (result.startsWith(search) || search.startsWith(result))) {
    return true;
  }

  return false;
}

export function titleMatches(resultTitle: string, searchTitle: string): boolean {
  const result = normalizeTrackTitle(resultTitle);
  const search = normalizeTrackTitle(searchTitle);

  if (result === search) return true;

  if (result.includes(search) || search.includes(result)) {
    const ratio =
      Math.min(result.length, search.length) /
      Math.max(result.length, search.length);
    return ratio > 0.55;
  }

  return false;
}

export function albumMatches(resultAlbum: string, searchAlbum: string): boolean {
  const result = normalizeTrackTitle(resultAlbum);
  const search = normalizeTrackTitle(searchAlbum);

  if (result === search) return true;

  if (result.includes(search) || search.includes(result)) {
    const ratio =
      Math.min(result.length, search.length) /
      Math.max(result.length, search.length);
    return ratio > 0.7;
  }

  return false;
}
