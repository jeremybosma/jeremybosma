import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ui/client-layout";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://jeremybosma.nl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jeremy Bosma",
    template: "%s | Jeremy Bosma",
  },
  description:
    "A software engineer with eye for design and micro-interactions creating digital experiences.",
  keywords: [
    "Jeremy Bosma",
    "software engineer",
    "design",
    "frontend",
    "digital experiences",
    "portfolio",
  ],
  authors: [{ name: "Jeremy Bosma" }],
  creator: "Jeremy Bosma",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Jeremy Bosma",
    title: "Jeremy Bosma",
    description:
      "A software engineer with eye for design and micro-interactions creating digital experiences.",
    images: [
      {
        url: "/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Jeremy Bosma",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jeremy Bosma",
    description:
      "A software engineer with eye for design and micro-interactions creating digital experiences.",
    images: ["/ogimage.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#fffff9" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased isolate`}
      >
        <ClientLayout>
          {children}
          <Analytics />
        </ClientLayout>
      </body>
    </html>
  );
}
