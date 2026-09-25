import "server-only";
import type { LanguageCode } from "../content/types";

/**
 * Textos reales de proyectos Wikimedia (Wikipedia, Wikinews, Wikivoyage),
 * con licencia CC BY-SA. Buenas prácticas de su API:
 *  • User-Agent descriptivo con contacto.
 *  • Pocas peticiones: una consulta devuelve hasta 20 artículos con extracto.
 *  • Caché de 24 h (fetch de Next) y tiempo de espera corto.
 * Seguridad: sólo se consultan estos hosts, construidos a partir del código de
 * idioma (nunca una URL del usuario) y el contenido se trata como texto plano.
 */
export type WikiSource = "wikipedia" | "wikinews" | "wikivoyage" | "simplewiki";

export const SOURCE_LABEL: Record<WikiSource, string> = {
  wikipedia: "Wikipedia",
  wikinews: "Wikinoticias",
  wikivoyage: "Wikiviajes",
  simplewiki: "Simple English Wikipedia",
};

const AVAILABLE: Record<WikiSource, LanguageCode[]> = {
  wikipedia: ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"],
  simplewiki: ["en"],
  wikinews: ["en", "fr", "de", "it", "pt", "sv", "ru", "ar", "ja", "zh"],
  wikivoyage: ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ja", "zh"],
};

export function sourcesFor(language: LanguageCode): WikiSource[] {
  return (Object.keys(AVAILABLE) as WikiSource[]).filter((s) => AVAILABLE[s].includes(language));
}

export function isWikiSource(s: string): s is WikiSource {
  return s in AVAILABLE;
}

function host(source: WikiSource, language: LanguageCode): string {
  if (source === "simplewiki") return "simple.wikipedia.org";
  return `${language}.${source}.org`;
}

const UA = "ImproveMyLanguages/1.0 (https://github.com/KorKoor/Improve-My-Lenguage; aprendizaje de idiomas, uso educativo)";

export interface WikiSummary {
  source: WikiSource;
  title: string;
  extract: string;
  url: string;
}

export interface WikiArticle extends WikiSummary {
  paragraphs: string[];
  retrievedAt: string;
  license: string;
  licenseUrl: string;
}

async function api(source: WikiSource, language: LanguageCode, params: Record<string, string>): Promise<unknown> {
  if (!sourcesFor(language).includes(source)) return null;
  const qs = new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params });
  try {
    const res = await fetch(`https://${host(source, language)}/w/api.php?${qs}`, {
      headers: { "User-Agent": UA, "Api-User-Agent": UA },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`[wiki] ${source}/${language} no respondió`, (err as Error).message);
    return null;
  }
}

interface ApiPage {
  title: string;
  extract?: string;
  fullurl?: string;
  missing?: boolean;
  ns?: number;
}

function pagesOf(data: unknown): ApiPage[] {
  const pages = (data as { query?: { pages?: ApiPage[] } } | null)?.query?.pages ?? [];
  return pages.filter((p) => !p.missing && (p.ns ?? 0) === 0 && p.extract);
}

function toSummary(source: WikiSource, p: ApiPage): WikiSummary {
  return { source, title: p.title, extract: p.extract!.trim(), url: p.fullurl ?? "" };
}

const SUMMARY_PARAMS = { prop: "extracts|info", inprop: "url", exintro: "1", explaintext: "1", exlimit: "20", exsectionformat: "plain" };

/** Hasta 20 artículos al azar con su introducción (una sola petición). */
export async function randomArticles(source: WikiSource, language: LanguageCode, n = 12): Promise<WikiSummary[]> {
  const data = await api(source, language, { action: "query", generator: "random", grnnamespace: "0", grnlimit: String(Math.min(20, n)), ...SUMMARY_PARAMS });
  return pagesOf(data).map((p) => toSummary(source, p));
}

/** Búsqueda por tema (una petición). */
export async function searchArticles(source: WikiSource, language: LanguageCode, query: string, n = 10): Promise<WikiSummary[]> {
  const q = query.trim().slice(0, 80);
  if (!q) return [];
  const data = await api(source, language, { action: "query", generator: "search", gsrsearch: q, gsrnamespace: "0", gsrlimit: String(Math.min(20, n)), ...SUMMARY_PARAMS });
  return pagesOf(data).map((p) => toSummary(source, p));
}

/** Texto del artículo (primeras secciones, texto plano, sin tablas ni referencias). */
export async function fetchArticle(source: WikiSource, language: LanguageCode, title: string): Promise<WikiArticle | null> {
  const t = title.slice(0, 300);
  const data = await api(source, language, { action: "query", titles: t, prop: "extracts|info", inprop: "url", explaintext: "1", exsectionformat: "plain", exchars: "6000", redirects: "1" });
  const page = pagesOf(data)[0];
  if (!page) return null;
  const paragraphs = page.extract!
    .split(/\n+/)
    .map((p) => p.trim())
    // Fuera títulos de sección sueltos y líneas muy cortas (listas, fórmulas).
    .filter((p) => p.length >= 40 && !/^(Véase también|See also|Referencias|References|Enlaces externos)$/i.test(p))
    .slice(0, 30);
  if (paragraphs.length === 0) return null;
  return {
    ...toSummary(source, page),
    paragraphs,
    retrievedAt: new Date().toISOString(),
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.es",
  };
}
