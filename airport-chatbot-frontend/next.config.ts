import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger shared hosting serves static files only (LiteSpeed + PHP, no Node
  // runtime), so the app ships as a static bundle in public_html. Safe here because
  // every page is a Client Component talking to the Express API over NEXT_PUBLIC_API_URL.
  output: "export",

  // Image Optimization needs a server. Sources are all local files under public/,
  // so serving them as-is costs nothing.
  images: { unoptimized: true },

  // Emit about/index.html rather than about.html, which LiteSpeed serves as a
  // directory index without any rewrite rules.
  trailingSlash: true,
};

export default nextConfig;
