import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from trying to bundle these server-only Node.js packages.
  // They are required at runtime by Node and must not be inlined into the bundle.
  serverExternalPackages: [
    "pdf-parse",
    "@langchain/google-genai",
    "@langchain/core",
  ],
};

export default nextConfig;
