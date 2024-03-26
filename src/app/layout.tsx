import type { Metadata } from "next";
import { meta } from '../../next-seo.config';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://jeremybosma.nl') || new URL('http://localhost:3000'),
  title: meta.title,
  description: meta.description,
  openGraph: {
    ...meta.og,
    images: [meta.og.image],
    siteName: meta.og.siteName,
  },
  twitter: {
    images: [{
      url: meta.twitter.image,
      width: meta.twitter.imageWidth,
      height: meta.twitter.imageHeight,
    }],
    ...meta.twitter,
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
