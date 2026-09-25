import "server-only";
import type { LanguageCode } from "../content/types";
import { lemmaIfOnlyForms, parseDefinitions, type DictionaryEntry, type RestDefinition } from "./dictionary-parse";

export type { DictionaryEntry } from "./dictionary-parse";

/**
 * Diccionario en vivo para palabras que no están en nuestro vocabulario
 * (nombres técnicos, palabras raras de un artículo C1…). Usa la API REST
 * pública del Wiktionary inglés, que agrupa las definiciones por idioma.
 *
 * Seguridad y cortesía: host fijo (sin URLs del usuario), la palabra va
 * codificada, User-Agent descriptivo, caché de 7 días y límite por usuario
 * en la acción que la llama.
 */
const UA = "ImproveMyLanguages/1.0 (https://github.com/KorKoor/Improve-My-Lenguage; aprendizaje de idiomas, uso educativo)";

async function fetchEntry(language: LanguageCode, w: string): Promise<DictionaryEntry | null> {
  const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(w)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Api-User-Agent": UA, accept: "application/json" },
      next: { revalidate: 7 * 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const senses = parseDefinitions((await res.json()) as Record<string, RestDefinition[]>, language);
    return senses.length ? { word: w, senses, url: `https://en.wiktionary.org/wiki/${encodeURIComponent(w)}` } : null;
  } catch {
    return null; // red o formato inesperado → «sin resultados»
  }
}

export async function lookupWord(language: LanguageCode, word: string): Promise<DictionaryEntry | null> {
  const clean = word.trim().slice(0, 60);
  if (!clean) return null;
  for (const w of [...new Set([clean, clean.toLowerCase()])]) {
    const entry = await fetchEntry(language, w);
    if (!entry) continue;
    // Forma flexionada («octopuses», «ging»): mostramos el significado del lema.
    const lemma = lemmaIfOnlyForms(entry.senses);
    if (lemma && lemma !== w) {
      const base = await fetchEntry(language, lemma);
      if (base) return { ...base, formOf: w };
    }
    return entry;
  }
  return null;
}
