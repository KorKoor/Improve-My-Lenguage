/**
 * Fase 0 («aprender a leer y a sonar»): tipos del contenido.
 *
 * Cada idioma aporta sus reglas de lectura y ortografía (una por pantalla,
 * con ejemplos que suenan y un mini ejercicio) y, si usa letras latinas, los
 * grupos de letras y combinaciones que suenan distinto al español. Las letras
 * de las escrituras no latinas viven en `../alphabets.ts` (no se duplican).
 */
import type { LetterGroup } from "../alphabets";

export interface RuleExample {
  /** Texto en el idioma (puede llevar el acento marcado: вода́). */
  w: string;
  /** Cómo se lee, en letras latinas. */
  r?: string;
  /** Qué significa. */
  es?: string;
  /** Qué leer en voz alta si no es `w` (sin marcas de acento, etc.). */
  say?: string;
}

export interface RuleCheck {
  /** Pregunta en español. */
  q: string;
  /** Texto en el idioma que acompaña a la pregunta (se oye al tocarlo). */
  show?: string;
  options: string[];
  answer: string;
  /** Idioma de las opciones: español/transcripción o el idioma que aprendes. */
  lang: "es" | "target";
  /** Explicación tras responder. */
  why?: string;
}

export interface ReadingRule {
  id: string;
  title: string;
  /** Una a tres frases cortas, sin tecnicismos. */
  explain: string;
  examples: RuleExample[];
  check: RuleCheck;
}

export interface PhaseZeroContent {
  /** Letras y combinaciones nuevas (sólo idiomas con letras latinas). */
  letters?: LetterGroup[];
  rules: ReadingRule[];
}
