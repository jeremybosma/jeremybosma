import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: "/images/pfp.jpg",
  title: "Jeremy Bosma",
  description: "16 jarige in software, ontwerp en startups.  ",
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
