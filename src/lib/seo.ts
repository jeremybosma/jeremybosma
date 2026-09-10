import {
  CONTACT_EMAIL,
  DEFAULT_DESCRIPTION,
  SITE_LOCATION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_URLS,
} from "@/lib/site";

export function pageUrl(pathname: string) {
  if (pathname === "/") return SITE_URL;
  return `${SITE_URL}${pathname}`;
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    alternateName: ["Jeremy Benjamin Bosma", "jeremybosma"],
    url: SITE_URL,
    image: `${SITE_URL}/profile.webp`,
    email: CONTACT_EMAIL,
    jobTitle: "Software Engineer & Designer",
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_LOCATION.locality,
      addressRegion: SITE_LOCATION.region,
      addressCountry: SITE_LOCATION.countryCode,
    },
    sameAs: [
      SOCIAL_URLS.github,
      SOCIAL_URLS.x,
      SOCIAL_URLS.instagram,
      SOCIAL_URLS.linkedin,
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "jeremybosma.nl",
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
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
      image: `${SITE_URL}/profile.webp`,
    },
  };
}
