import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { LANGUAGES } from "@/lib/content";
import { GUIDES } from "@/lib/content/guides";

/** Sólo páginas públicas e indexables (la aplicación está tras el inicio de sesión). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  const pages: [string, number][] = [["", 1], ["/features", 0.8], ["/languages", 0.8], ["/guias", 0.8], ["/afi", 0.6], ["/about", 0.7], ["/privacy", 0.3], ["/creditos", 0.4]];
  return [
    ...pages.map(([p, priority]) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const, priority })),
    ...LANGUAGES.map((l) => ({ url: `${base}/languages/${l.code}`, changeFrequency: "monthly" as const, priority: l.status === "planned" ? 0.3 : 0.7 })),
    ...GUIDES.map((g) => ({ url: `${base}/guias/${g.slug}`, lastModified: new Date(g.updated), changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
