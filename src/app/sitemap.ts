import type { MetadataRoute } from "next";
import { LANGUAGES } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  const pages = ["", "/features", "/languages", "/about", "/privacy"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const langs = LANGUAGES.map((l) => ({ url: `${base}/languages/${l.code}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...pages, ...langs];
}
