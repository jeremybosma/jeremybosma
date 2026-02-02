import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    viewTransition: true,
  },
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
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
    // Optimized image sizes for gallery - includes mobile-friendly sizes
    deviceSizes: [420, 640, 768, 1024, 1280, 1536],
    imageSizes: [48, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
