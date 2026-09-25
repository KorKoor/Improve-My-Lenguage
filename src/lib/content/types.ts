/**
 * Tipos del catálogo de contenido.
 *
 * El contenido (idiomas, vocabulario, gramática, bancos de diagnóstico) vive en
 * el repositorio como datos tipados. La base de datos sólo guarda el estado del
 * usuario y referencia el contenido por ID estable (p. ej. "en:w:although").
 * Ver docs/ARCHITECTURE.md → "Contenido como código".
 */

export type LanguageCode = string; // ISO 639-1 (en, es, fr, ja, ...)

export const SKILLS = [
  "vocabulary",
  "grammar",
  "reading",
  "listening",
  "writing",
  "speaking",
  "pronunciation",
] as const;
export type Skill = (typeof SKILLS)[number];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export type WritingSystem =
  | "latin"
  | "cyrillic"
  | "arabic"
  | "hangul"
  | "hiragana"
  | "katakana"
  | "kanji"
  | "hanzi"
  | "greek"
  | "devanagari";

export type LanguageStatus = "available" | "beta" | "planned";

export interface Language {
  code: LanguageCode;
  name: string; // nombre en español (idioma de la interfaz)
  englishName: string;
  nativeName: string;
  family: string;
  writingSystems: WritingSystem[];
  /** Dificultad aproximada para hispanohablantes, 1 (fácil) – 5 (muy difícil). */
  difficulty: 1 | 2 | 3 | 4 | 5;
  rtl: boolean;
  /** Locale BCP-47 para síntesis/reconocimiento de voz del navegador. */
  speechLocale: string;
  /** ¿Tenemos inventario de fonemas para feedback de pronunciación? */
  phonemeSupport: boolean;
  /** Rasgos gramaticales relevantes para el motor (género, casos, aspecto...). */
  grammarFeatures: string[];
  /** Si el idioma usa separación por espacios (afecta a tokenización/reordenar). */
  spaceSeparated: boolean;
  status: LanguageStatus;
  flagEmoji: string;
}

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "determiner"
  | "interjection"
  | "phrase"
  | "particle"
  | "numeral";

export type Register = "neutral" | "formal" | "informal" | "technical" | "slang";

export interface ExampleSentence {
  text: string;
  /** Traducciones del ejemplo por idioma nativo del usuario. */
  translation?: Partial<Record<LanguageCode, string>>;
  /** Lectura/transliteración (p. ej. romaji) para sistemas no latinos. */
  reading?: string;
}

/** Tiempos de las tablas de conjugación (ver scripts/content/build_packs.py → CONJ_ROWS). */
export type TenseKey = "ind.pres" | "ind.pret" | "ind.past" | "ind.impf" | "ind.fut" | "cond" | "subj.pres" | "imp";

export interface VocabItem {
  id: string; // "<lang>:w:<slug>"
  language: LanguageCode;
  lemma: string;
  /** Lectura (kana/romaji, pinyin...) cuando la escritura no es latina. */
  reading?: string;
  translations: Partial<Record<LanguageCode, string[]>>;
  definition?: string; // definición en el propio idioma
  pos: PartOfSpeech;
  ipa?: string;
  examples: ExampleSentence[];
  synonyms?: string[];
  antonyms?: string[];
  /** Rango aproximado de frecuencia (1 = más frecuente). Orientativo. */
  frequencyBand: 1 | 2 | 3 | 4 | 5;
  cefr: CefrLevel;
  register: Register;
  topics: string[];
  /** Notas de uso: falsos amigos, traducción literal vs. uso natural, etc. */
  usageNote?: string;
  /** Formas aceptadas además del lema al escribir (kana, romaji, variantes). */
  acceptedForms?: string[];
  /** Formas flexionadas frecuentes ("geht", "ging" → gehen), para el lector. */
  forms?: string[];
  /** Tabla de conjugación (verbos): tiempo → [yo, tú, él/ella, nosotros, vosotros, ellos]. */
  conjugation?: Partial<Record<TenseKey, (string | null)[]>>;
  /** Rango de frecuencia real (1 = la más usada). Define la dificultad fina. */
  rank?: number;
  /** Pronunciación grabada por una persona (Wikimedia Commons), si existe. */
  audioUrl?: string;
  /** Procedencia del contenido (atribución obligatoria de las licencias abiertas). */
  sources?: ContentSourceTag[];
}

/** Origen de un dato generado desde fuentes públicas. */
export type ContentSourceTag = "curated" | "wordfreq" | "wiktionary-es" | "wiktionary-es-translations" | "pivot-en" | "wiktionary-en" | "tatoeba" | "commons";

export interface GrammarMistake {
  wrong: string;
  right: string;
  why: string;
}

export interface GrammarContrast {
  a: string;
  b: string;
  explanation: string;
}

export type GrammarExerciseType = "mc" | "fill" | "correct";

export interface GrammarExercise {
  type: GrammarExerciseType;
  /** Para "fill", usa "___" donde va la respuesta. Para "correct", la frase con error. */
  prompt: string;
  options?: string[];
  answers: string[]; // respuestas aceptadas (la primera es la canónica)
  explanation: string;
}

export interface GrammarConcept {
  id: string; // "<lang>:g:<slug>"
  language: LanguageCode;
  title: string;
  cefr: CefrLevel;
  /** Categoría de error a la que se asocian los fallos de este concepto. */
  errorCategory: string;
  summary: string;
  whenToUse: string[];
  formation: string[];
  commonMistakes: GrammarMistake[];
  examples: ExampleSentence[];
  contrasts: GrammarContrast[];
  exercises: GrammarExercise[];
}

export type AssessmentItemKind = "mc";

export interface AssessmentItem {
  id: string; // "<lang>:a:<n>"
  language: LanguageCode;
  skill: Extract<Skill, "vocabulary" | "grammar" | "reading" | "listening">;
  /** Dificultad en escala logit (modelo de Rasch). ~ -3 (A1) .. +3 (C2). */
  difficulty: number;
  passage?: string;
  /** Texto que se escucha (ítems de comprensión auditiva; no se muestra escrito). */
  audio?: string;
  prompt: string;
  options: string[];
  answer: string;
  /** Concepto gramatical relacionado (para sembrar debilidades). */
  grammarId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Topic {
  id: string;
  label: string;
  emoji: string;
}
