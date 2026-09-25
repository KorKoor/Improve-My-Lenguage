/**
 * Análisis de textos escritos sin IA (siempre disponible, coste cero):
 * ortografía por proximidad al vocabulario, acentos, mayúsculas, repeticiones,
 * variedad léxica, longitud de frases y nivel estimado del vocabulario.
 * Pura y determinista para poder testearla.
 */
import type { CefrLevel, LanguageCode, VocabItem } from "../content/types";
import { itemTheta, thetaToCefr } from "../engine/levels";
import { normalizeKey, type LookupIndex } from "../reading/text";

export type IssueKind = "spelling" | "accent" | "capital" | "repeat";

export interface WritingIssue {
  start: number;
  end: number;
  kind: IssueKind;
  message: string;
  suggestion?: string;
}

export interface WritingAnalysis {
  words: number;
  sentences: number;
  avgSentenceLength: number;
  /** Palabras distintas / palabras (0–1). */
  variety: number;
  levelCounts: Partial<Record<CefrLevel, number>>;
  level: CefrLevel;
  theta: number;
  issues: WritingIssue[];
  /** 0–100: precisión formal aproximada (penaliza errores detectados). */
  score: number;
}

const strip = (s: string) => s.normalize("NFD").replace(/\p{Mn}/gu, "").normalize("NFC");

/** Distancia de edición con transposiciones (OSA), con corte temprano. */
function editDistanceAtMost(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      let d = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, prev2[j - 2]! + 1);
      cur[j] = d;
      best = Math.min(best, d);
    }
    if (best > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length]!;
}

export interface SpellIndex {
  byBucket: Map<string, string[]>;
  byStripped: Map<string, string>;
}

/** Índice para sugerencias: formas agrupadas por primera letra + longitud, y sin acentos. */
export function buildSpellIndex(idx: LookupIndex): SpellIndex {
  const byBucket = new Map<string, string[]>();
  const byStripped = new Map<string, string>();
  for (const k of idx.keys()) {
    const key = `${k[0]}|${k.length}`;
    const list = byBucket.get(key) ?? [];
    list.push(k);
    byBucket.set(key, list);
    const s = strip(k);
    if (s !== k && !byStripped.has(s)) byStripped.set(s, k);
  }
  return { byBucket, byStripped };
}

function suggest(word: string, spell: SpellIndex): string | undefined {
  const max = word.length >= 7 ? 2 : 1;
  let best: string | undefined;
  let bestD = max + 1;
  for (let len = word.length - max; len <= word.length + max; len++) {
    for (const cand of spell.byBucket.get(`${word[0]}|${len}`) ?? []) {
      const d = editDistanceAtMost(word, cand, max);
      if (d < bestD) {
        bestD = d;
        best = cand;
        if (d === 1) return best;
      }
    }
  }
  return best;
}

const LATIN_OR_CYRILLIC = /^[\p{Script=Latin}\p{Script=Cyrillic}]/u;
const WORD = /[\p{L}\p{M}][\p{L}\p{M}'’\-]*/gu;

export function analyzeWriting(opts: {
  language: LanguageCode;
  text: string;
  idx: LookupIndex;
  spell: SpellIndex;
  vocabById: (id: string) => VocabItem | undefined;
  spaceSeparated: boolean;
}): WritingAnalysis {
  const { language, text, idx, spell } = opts;
  const issues: WritingIssue[] = [];
  const thetas: number[] = [];
  const levelCounts: Partial<Record<CefrLevel, number>> = {};
  const uses = new Map<string, { count: number; first: number; len: number; item: VocabItem }>();
  let words = 0;

  if (opts.spaceSeparated) {
    for (const m of text.matchAll(WORD)) {
      const w = m[0];
      const start = m.index!;
      words++;
      const key = normalizeKey(language, w);
      const v = idx.get(key);
      const prevText = text.slice(0, start).trimEnd();
      const sentenceStart = prevText === "" || /[.!?]$/.test(prevText);
      const lemmaKey = v ? normalizeKey(language, v.lemma) : "";
      if (v && key !== lemmaKey && strip(key) === strip(lemmaKey)) {
        // Forma sin (o con otro) acento que el corpus conoce, pero la correcta es el lema: «apres» → «après».
        issues.push({ start, end: start + w.length, kind: "accent", message: "Revisa los acentos.", suggestion: v.lemma });
      }
      if (v) {
        thetas.push(itemTheta(v));
        levelCounts[v.cefr] = (levelCounts[v.cefr] ?? 0) + 1;
        const u = uses.get(v.id);
        uses.set(v.id, { count: (u?.count ?? 0) + 1, first: u?.first ?? start, len: u?.len ?? w.length, item: v });
        // Alemán: los sustantivos van con mayúscula.
        if (language === "de" && v.pos === "noun" && v.lemma[0] === v.lemma[0]!.toUpperCase() && w[0] === w[0]!.toLowerCase()) {
          issues.push({ start, end: start + w.length, kind: "capital", message: "En alemán los sustantivos se escriben con mayúscula.", suggestion: w[0]!.toUpperCase() + w.slice(1) });
        }
      } else if (w.length >= 3 && !(w[0] === w[0]!.toUpperCase() && w[0] !== w[0]!.toLowerCase() && !sentenceStart)) {
        // No está en el vocabulario (y no parece un nombre propio): ¿acento o errata?
        const accent = spell.byStripped.get(strip(key));
        if (accent && accent !== key) {
          issues.push({ start, end: start + w.length, kind: "accent", message: "Revisa los acentos.", suggestion: accent });
        } else if (strip(key) !== key && idx.has(strip(key))) {
          issues.push({ start, end: start + w.length, kind: "accent", message: "Esta palabra no lleva acento.", suggestion: strip(key) });
        } else {
          const s = suggest(key, spell);
          if (s) issues.push({ start, end: start + w.length, kind: "spelling", message: "¿Quisiste decir…?", suggestion: s });
        }
      }
      // Mayúscula al empezar una frase.
      if (sentenceStart && LATIN_OR_CYRILLIC.test(w) && w[0] === w[0]!.toLowerCase() && w[0] !== w[0]!.toUpperCase()) {
        issues.push({ start, end: start + w.length, kind: "capital", message: "Las frases empiezan con mayúscula.", suggestion: w[0]!.toUpperCase() + w.slice(1) });
      }
      // Inglés: «I» siempre en mayúscula.
      if (language === "en" && w === "i") {
        issues.push({ start, end: start + 1, kind: "capital", message: "«I» (yo) siempre va en mayúscula.", suggestion: "I" });
      }
    }
  } else {
    // Japonés/chino: contamos caracteres como medida de longitud.
    for (const ch of text) if (/\p{L}/u.test(ch)) words++;
  }

  // Repeticiones de palabras de contenido (no las gramaticales frecuentes).
  for (const [, u] of uses) {
    if (u.count >= 3 && (u.item.rank ?? 0) > 150 && ["noun", "verb", "adjective", "adverb"].includes(u.item.pos)) {
      issues.push({ start: u.first, end: u.first + u.len, kind: "repeat", message: `Usas «${u.item.lemma}» ${u.count} veces: prueba con un sinónimo o un pronombre.` });
    }
  }

  const sentences = Math.max(1, text.split(/[.!?。！？]+/u).filter((s) => s.trim().length > 1).length);
  const distinct = uses.size;
  const variety = uses.size ? distinct / Math.max(1, thetas.length) : 0;
  const sorted = [...thetas].sort((a, b) => a - b);
  const theta = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.85))]! + Math.min(0.6, Math.max(-0.4, (words / sentences - 10) * 0.05)) : -2.5;
  const penalty = issues.reduce((p, i) => p + (i.kind === "spelling" ? 8 : i.kind === "accent" ? 4 : i.kind === "capital" ? 3 : 2), 0);
  const score = Math.max(0, Math.round(100 - (penalty * 100) / Math.max(40, words * 2)));
  issues.sort((a, b) => a.start - b.start);
  return {
    words,
    sentences,
    avgSentenceLength: Math.round((words / sentences) * 10) / 10,
    variety: Math.round(variety * 100) / 100,
    levelCounts,
    level: thetaToCefr(theta),
    theta,
    issues,
    score,
  };
}
