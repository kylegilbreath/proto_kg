import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack resolves modules from this project,
  // not a parent dir. Multiple lockfiles (~/yarn.lock, package-lock.json)
  // otherwise cause it to misdetect the root and fail to resolve tailwindcss.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
