import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // REQUIRED
  // Lets a release build go to its own folder so a running dev server's .next is left alone.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
