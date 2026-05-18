import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./empty-module.js" },
      encoding: { browser: "./empty-module.js" },
    },
  },
};

export default nextConfig;
