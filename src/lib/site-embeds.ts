export type SiteEmbed = {
  title: string;
  description: string;
  url: string;
  allowEmbed?: boolean;
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
  "hedge-club": {
    title: "Hedge Club",
    description: "An iPhone research desk for prediction markets and paper-trading decisions.",
    url: "https://internet-engineering.com/case-studies/private-paper-trading-research-development",
  },
  forge: {
    title: "Forge",
    description: "The AI-native operating system for software companies.",
    url: "https://forge-ai-dev.vercel.app",
  },
  restyle: {
    title: "Restyle",
    description: "Visual website redesigns with Next.js and Tailwind patches.",
    url: "https://restyle-psi.vercel.app",
  },
  viavia: {
    title: "VIA VIA",
    description: "A referral marketplace for trusted introductions.",
    url: "https://justviavia.com",
  },
  aiassure: {
    title: "aiassure",
    description: "AI-assisted financial due diligence with source-linked analysis and CPA review.",
    url: "https://aiassure.vercel.app",
  },
  sfina: {
    title: "Sfina",
    description: "Vessel operations for crews and fleet operators.",
    url: "https://sfina.vercel.app",
  },
  forma: {
    title: "Forma",
    description: "Floor plans, interior concepts, and digital property listings.",
    url: "https://forma-sigma-three.vercel.app",
  },
  gluiss: {
    title: "Gluiss",
    description: "A composable React interface system with adaptive layouts and motion.",
    url: "https://gluiss.vercel.app",
  },
  revyocollect: {
    title: "Revyo Collect",
    description: "Automated follow-ups and a connected collections workspace.",
    url: "https://revyocollect.com/",
  },
  yieldbuddy: {
    title: "Yieldbuddy",
    description: "A desktop workspace for portfolio planning and investment research.",
    url: "https://yieldbuddy.app/",
  },
  outfitsbio: {
    title: "outfits.bio",
    description: "Share outfits, discover clothing, and shop the looks you love.",
    url: "https://outfitsbio.vercel.app/",
  },
  plantsome: {
    title: "Plantsome",
    description: "An online plant shop with plant discovery, care advice, and delivery.",
    url: "https://www.plantsome.nl/",
    allowEmbed: false,
  },
  "fulldev-ui": {
    title: "Fulldev UI",
    description: "Astro components and blocks for building websites.",
    url: "https://ui.full.dev/",
  },
} as const satisfies Record<string, SiteEmbed>;

export type SiteEmbedSlug = keyof typeof SITE_EMBEDS;

export const SITE_EMBED_SLUGS = Object.keys(SITE_EMBEDS) as SiteEmbedSlug[];

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

export function siteEmbedSlugFromPath(pathname: string): SiteEmbedSlug | null {
  if (pathname === "/agency") return "agency";

  const match = /^\/site\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;

  return getSiteEmbed(match[1]) ? (match[1] as SiteEmbedSlug) : null;
}

export function siteEmbedSlugFromHref(href: string | null | undefined): SiteEmbedSlug | null {
  if (!href || href.startsWith("mailto:") || href.startsWith("http")) return null;

  try {
    const url = new URL(href, "https://jeremybosma.nl");
    return siteEmbedSlugFromPath(url.pathname);
  } catch {
    return null;
  }
}
