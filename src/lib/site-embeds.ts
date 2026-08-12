export type SiteEmbed = {
  title: string;
  description: string;
  url: string;
};

/** In-app iframe embeds. Agency is also linked from the sidebar; others are homepage-only. */
export const SITE_EMBEDS = {
  agency: {
    title: "Agency",
    description: "Internet Engineering — software agency for founders.",
    url: "https://internet-engineering.com",
  },
  individu: {
    title: "Individu",
    description: "Let AI work in the apps you use everyday.",
    url: "https://individu.ai",
  },
  integrate: {
    title: "Integrate",
    description: "Connect AI agents to services without shipping new backends.",
    url: "https://integrate.dev",
  },
  fulldev: {
    title: "full.dev",
    description: "Web development agency that's also building devtools.",
    url: "https://full.dev",
  },
} as const satisfies Record<string, SiteEmbed>;

export type SiteEmbedSlug = keyof typeof SITE_EMBEDS;

export function getSiteEmbed(slug: string): SiteEmbed | null {
  if (slug in SITE_EMBEDS) {
    return SITE_EMBEDS[slug as SiteEmbedSlug];
  }
  return null;
}

export function siteEmbedPath(slug: SiteEmbedSlug): string {
  return slug === "agency" ? "/agency" : `/site/${slug}`;
}

export function isSiteEmbedPath(pathname: string): boolean {
  return pathname === "/agency" || pathname.startsWith("/site/");
}
