import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig, loadEnv, Plugin } from "vite";

// Indexable public pages. Results, confirmation and 404 pages are noindex.
const SITEMAP_PATHS = ["/", "/muraciet"];

// public/robots.txt closes the demo to crawlers. With VITE_INDEXABLE=true and VITE_SITE_URL set,
// the build replaces it with an open robots.txt and writes sitemap.xml.
function seoFiles(env: Record<string, string>): Plugin {
  let outDir = "dist";
  return {
    name: "seo-files",
    apply: "build",
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
    },
    closeBundle() {
      const site = (env.VITE_SITE_URL ?? "").replace(/\/+$/, "");
      if (env.VITE_INDEXABLE !== "true" || !site) return;
      const today = new Date().toISOString().slice(0, 10);
      fs.writeFileSync(
        path.join(outDir, "robots.txt"),
        `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /neticeler\nDisallow: /tesdiq\n\nSitemap: ${site}/sitemap.xml\n`
      );
      const urls = SITEMAP_PATHS.map((p) => `  <url><loc>${site}${p}</loc><lastmod>${today}</lastmod></url>`);
      fs.writeFileSync(
        path.join(outDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
      );
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), seoFiles(loadEnv(mode, process.cwd()))],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:4000",
    },
  },
}));
