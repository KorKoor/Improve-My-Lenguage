/** Funciones puras del diccionario en vivo (ver dictionary.ts): testeables sin red. */
import type { LanguageCode } from "../content/types";

export interface DictionaryEntry {
  word: string;
  /** Si la palabra tocada es una forma flexionada: la forma original («octopuses»). */
  formOf?: string;
  senses: { pos: string; definitions: string[] }[];
  url: string;
}

const FORM_OF = /\b(plural|singular|participle|past|present|future|indicative|subjunctive|imperative|comparative|superlative|inflection|form|feminine|masculine|genitive|dative|accusative|conjugation)\b.*\bof ([\p{L}\p{M}'’-]+)\s*[.;:]?\s*$/iu;

/** «third-person singular simple present indicative of octopus» → «octopus». */
export function formOfLemma(definition: string): string | null {
  const m = definition.match(FORM_OF);
  return m ? m[2]! : null;
}

/** Si TODAS las acepciones son formas de otra palabra, devuelve ese lema. */
export function lemmaIfOnlyForms(senses: DictionaryEntry["senses"]): string | null {
  const all = senses.flatMap((s) => s.definitions);
  if (all.length === 0) return null;
  const lemmas = all.map(formOfLemma);
  return lemmas.every(Boolean) ? lemmas[0]! : null;
}

const POS_ES: Record<string, string> = {
  Noun: "sustantivo",
  Verb: "verbo",
  Adjective: "adjetivo",
  Adverb: "adverbio",
  Pronoun: "pronombre",
  Preposition: "preposición",
  Conjunction: "conjunción",
  Interjection: "interjección",
  "Proper noun": "nombre propio",
  Particle: "partícula",
  Numeral: "numeral",
  Phrase: "expresión",
};

/** Quita el HTML de las definiciones (enlaces, cursivas) y entidades básicas. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export type RestDefinition = { partOfSpeech?: string; language?: string; definitions?: { definition?: string }[] };

/** Extrae las acepciones del idioma pedido de la respuesta REST de Wiktionary. */
export function parseDefinitions(data: Record<string, RestDefinition[]>, language: LanguageCode): DictionaryEntry["senses"] {
  const groups = data[language] ?? (language === "zh" ? data["cmn"] : undefined) ?? [];
  return groups
    .map((g) => ({
      pos: POS_ES[g.partOfSpeech ?? ""] ?? (g.partOfSpeech ?? "").toLowerCase(),
      definitions: (g.definitions ?? [])
        .map((d) => stripHtml(d.definition ?? ""))
        .filter((d) => d.length > 1)
        .slice(0, 3),
    }))
    .filter((g) => g.definitions.length > 0)
    .slice(0, 3);
}
