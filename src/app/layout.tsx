import type { Metadata } from "next";
import { meta } from '../../next-seo.config';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://jeremybosma.nl' || 'http://localhost:3000'),
  title: meta.title,
  description: meta.description,
  themeColor: meta.og.embedColor,
  openGraph: {
    locale: meta.og.locale,
    type: 'website',
    title: meta.og.title,
    description: meta.og.description,
    images: meta.og.image,
    url: meta.url,
    siteName: meta.og.siteName,
  },
  twitter: {
    card: 'summary_large_image',
    images: [{
      url: meta.twitter.image,
      width: meta.twitter.imageWidth,
      height: meta.twitter.imageHeight,
    }],
    site: meta.twitter.domain,
    title: meta.twitter.title,
    description: meta.twitter.description,
  },
  icons: [
    { rel: "icon", url: meta.icons },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
