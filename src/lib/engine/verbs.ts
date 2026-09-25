/**
 * Entrenador de conjugación: elige qué conjugar y corrige, sin IA.
 * Puro y determinista (semilla) → testeable.
 */
import { pronouns, TENSE_DIFFICULTY } from "../content/conjugation";
import type { LanguageCode, TenseKey, VocabItem } from "../content/types";
import { itemTheta } from "./levels";
import { shuffle } from "./random";

export interface VerbDrillItem {
  key: string;
  verbId: string;
  lemma: string;
  tense: TenseKey;
  person: number;
  difficulty: number;
}

/** Personas que tienen forma en esa fila (el imperativo no tiene «yo»). */
function personsFor(row: (string | null)[]): number[] {
  return row.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
}

export function buildVerbDrill(opts: {
  verbs: VocabItem[];
  tenses: TenseKey[];
  count: number;
  rand: () => number;
}): VerbDrillItem[] {
  const pool: VerbDrillItem[] = [];
  for (const v of opts.verbs) {
    for (const tense of opts.tenses) {
      const row = v.conjugation?.[tense];
      if (!row) continue;
      for (const person of personsFor(row)) {
        pool.push({ key: `conj|${v.id}|${tense}|${person}`, verbId: v.id, lemma: v.lemma, tense, person, difficulty: itemTheta(v) + TENSE_DIFFICULTY[tense] });
      }
    }
  }
  // Variedad: como mucho 3 preguntas del mismo verbo y 2 de la misma fila.
  const out: VerbDrillItem[] = [];
  const perVerb = new Map<string, number>();
  const perRow = new Map<string, number>();
  const maxPerVerb = opts.verbs.length === 1 ? opts.count : 3;
  for (const item of shuffle(pool, opts.rand)) {
    if (out.length >= opts.count) break;
    const rowKey = `${item.verbId}|${item.tense}`;
    if ((perVerb.get(item.verbId) ?? 0) >= maxPerVerb || (perRow.get(rowKey) ?? 0) >= (opts.verbs.length === 1 ? 6 : 2)) continue;
    perVerb.set(item.verbId, (perVerb.get(item.verbId) ?? 0) + 1);
    perRow.set(rowKey, (perRow.get(rowKey) ?? 0) + 1);
    out.push(item);
  }
  return out.sort((a, b) => a.difficulty - b.difficulty);
}

const strip = (s: string) => s.normalize("NFD").replace(/\p{Mn}/gu, "").normalize("NFC");

function normalize(s: string): string {
  return s.toLowerCase().replace(/[’`]/g, "'").replace(/[.!?¡¿,;:]/g, "").replace(/\s+/g, " ").trim();
}

export interface ConjugationGrade {
  correct: boolean;
  /** Correcto salvo acentos o mayúsculas. */
  nearMiss: boolean;
  expected: string;
}

/**
 * Compara la respuesta con la forma esperada. Acepta que escribas el pronombre
 * («nous avons», «j'ai») y tolera los acentos como «casi».
 */
export function gradeConjugation(language: LanguageCode, expected: string, person: number, answer: string): ConjugationGrade {
  const exp = normalize(expected);
  let ans = normalize(answer);
  for (const p of pronouns(language)[person]!.split("/")) {
    const pn = normalize(p);
    if (ans.startsWith(`${pn} `)) ans = ans.slice(pn.length + 1);
  }
  if (language === "fr" && ans.startsWith("j'")) ans = ans.slice(2);
  if (ans === exp) return { correct: true, nearMiss: false, expected };
  // En árabe las vocales cortas (harakat) no se escriben normalmente: no cuentan como error.
  if (strip(ans) === strip(exp)) return { correct: true, nearMiss: language !== "ar", expected };
  return { correct: false, nearMiss: false, expected };
}
