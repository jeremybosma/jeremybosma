let metaTitle = "Jeremy Bosma";
let metaDescription = "16 jarige in software, ontwerp en startups. Ik maak websites en software voor meerdere platformen en ik ben een zelf geleerde designer. Ik gebruik daarvoor tools als Figma, Github en Visual Studio code.";
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
    embedColor: "#eeeeee",
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