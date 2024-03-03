let metaTitle = "Jeremy Bosma";
let metaDescription = "16 jarige in software, ontwerp en startups. Ik maak websites, software en ontwerp interfaces. Leer meer over mij op deze website.";
let faviconPath = "/images/pfp.jpg";
let ogImagePath = "https://jeremybosma.nl/ogimage.png";
let domainName = "https://jeremybosma.nl";

export const meta = {
  title: metaTitle,
  description: metaDescription,
  icons: faviconPath,
  image: ogImagePath,
  url: domainName,
  og: {
    locale: "nl_NL",
    type: "website",
    title: metaTitle,
    description: metaDescription,
    image: ogImagePath,
    embedColor: "#FFFFF9",
    imageWidth: 1200,
    imageHeight: 630,
    siteName: metaTitle,
  },
  twitter: {
    card: "summary_large_image",
    domain: domainName,
    url: domainName,
    title: metaTitle,
    description: metaDescription,
    image: ogImagePath,
    imageWidth: 1200,
    imageHeight: 630,
  },
};