import type { ReactNode } from "react";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { pageUrl, personJsonLd, webSiteJsonLd } from "@/lib/seo";

type BaseLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  pathname?: string;
  icon?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
};

export default function BaseLayout({
  children,
  title,
  description = DEFAULT_DESCRIPTION,
  pathname = "/",
  icon,
  jsonLd,
  noIndex = false,
}: BaseLayoutProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = pageUrl(pathname);
  const structuredData =
    jsonLd ??
    (pathname === "/"
      ? [personJsonLd(), webSiteJsonLd()]
      : undefined);

  return (
    <html lang="en" data-pathname={pathname}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fffff9" />
        <meta name="view-transition" content="same-origin" />
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="author" content={SITE_NAME} />
        <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${SITE_URL}/ogimage.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={SITE_NAME} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${SITE_URL}/ogimage.png`} />
        <link rel="icon" href={icon ?? "/favicon.ico"} sizes="any" />
        {structuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                Array.isArray(structuredData)
                  ? { "@context": "https://schema.org", "@graph": structuredData }
                  : structuredData
              ),
            }}
          />
        ) : null}
      </head>
      <body className="font-sans antialiased isolate">
        {children}
      </body>
    </html>
  );
}
