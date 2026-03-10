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
  experimental: {
    // Optimize barrel files for better tree-shaking
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "framer-motion",
    ],
  },
};

export default withPWA(nextConfig);
