import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lastfm.freetls.fastly.net", // Last.fm CDN
      },
      {
        protocol: "https",
        hostname: "lastfm-img2.akamaized.net", // Last.fm CDN alternate
      },
      {
        protocol: "https",
        hostname: "images-api.printify.com", // Printify CDN
      },
    ],
  },
};

export default nextConfig;
