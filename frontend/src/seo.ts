import { useEffect } from "react";

// Indexing is off by default (demo). Production build: VITE_INDEXABLE=true and VITE_SITE_URL=https://...
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/+$/, "");
export const INDEXABLE = import.meta.env.VITE_INDEXABLE === "true" && SITE_URL !== "";
export const SITE_NAME = "Kənd Təsərrüfatı İnvestisiya Portalı";

interface PageMeta {
  title: string;
  description?: string;
  path?: string; // canonical path; omit for pages that must not be indexed
  noindex?: boolean;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function usePageMeta({ title, description, path, noindex }: PageMeta) {
  useEffect(() => {
    const full = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    document.title = full;
    setMeta("property", "og:title", full);
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
    const index = INDEXABLE && !noindex && path !== undefined;
    setMeta("name", "robots", index ? "index, follow" : "noindex, nofollow, noarchive");
    const url = index ? `${SITE_URL}${path}` : null;
    setCanonical(url);
    if (url) setMeta("property", "og:url", url);
  }, [title, description, path, noindex]);
}
