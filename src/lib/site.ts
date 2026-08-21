export const SITE_URL = "https://jeremybosma.nl";

export const SITE_NAME = "Jeremy Bosma";

export const CONTACT_EMAIL = "prive@jeremybosma.nl";

export const SITE_LOCATION = {
  locality: "Groningen",
  region: "Groningen",
  country: "Netherlands",
  countryCode: "NL",
} as const;

export const SOCIAL_URLS = {
  github: "https://github.com/jeremybosma",
  x: "https://x.com/jeremybosma_",
  instagram: "https://instagram.com/jeremybosma_",
  linkedin: "https://linkedin.com/in/jeremybosma",
} as const;

export const DEFAULT_DESCRIPTION =
  "A software engineer with eye for design and micro-interactions creating digital experiences.";

export function markdownAlternatePath(pathname: string) {
  if (pathname === "/") return "/index.md";
  return `${pathname.replace(/\/$/, "")}.md`;
}
