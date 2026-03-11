import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Optimize barrel files for better tree-shaking
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "framer-motion",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withPWA(nextConfig as any);
