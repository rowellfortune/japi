import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export -> out/. Every page is a Client Component talking to the API over
  // NEXT_PUBLIC_API_URL, so nothing renders server-side. Uploaded to S3 + CloudFront by SST.
  output: "export",

  // Pin the workspace/module-resolution root to this directory. The repo root also has a
  // package-lock.json (for SST), so Next would otherwise infer the monorepo root as the
  // workspace root — under Turbopack that let next/navigation's React resolve to a different
  // module identity than the client components in a subprocess, producing a null useContext
  // during static prerender (only under SST's build, non-deterministically). Both `next build`
  // and SST's build run with the cwd set to this directory, so process.cwd() is the frontend root.
  turbopack: { root: process.cwd() },

  // Image Optimization needs a server. Sources are all local files under public/,
  // so serving them as-is costs nothing.
  images: { unoptimized: true },

  // Emit about/index.html rather than about.html, which CloudFront serves as a directory index.
  trailingSlash: true,
};

export default nextConfig;
