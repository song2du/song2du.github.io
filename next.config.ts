import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only, so the whole site is exported to `out/`.
  output: "export",
  // Emit `/blog/index.html` instead of `/blog.html` so GitHub Pages resolves every route.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
