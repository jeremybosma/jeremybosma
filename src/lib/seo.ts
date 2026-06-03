import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export function pageUrl(pathname: string) {
  if (pathname === "/") return SITE_URL;
  return `${SITE_URL}${pathname}`;
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: SITE_URL,
    email: "prive@jeremybosma.nl",
    jobTitle: "Software Engineer & Designer",
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      "https://github.com/jeremybosma",
      "https://x.com/jeremybosma_",
      "https://instagram.com/jeremybosma_",
      "https://linkedin.com/in/jeremybosma",
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    author: {
      "@type": "Person",
      name: SITE_NAME,
    },
  };
}

export function profilePageJsonLd(pathname: string, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: title,
    url: pageUrl(pathname),
    description,
    mainEntity: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
