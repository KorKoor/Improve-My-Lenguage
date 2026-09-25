/**
 * Lectura: tokenización multilingüe, análisis de dificultad y preguntas.
 * Todo puro y determinista (sin I/O ni IA): testeable y gratis.
 */
import type { CefrLevel, LanguageCode, VocabItem } from "../content/types";
import { itemTheta, thetaToCefr } from "../engine/levels";
import { hashString, mulberry32, shuffle } from "../engine/random";

export interface Token {
  /** Texto tal cual aparece. */
  t: string;
  /** Id de vocabulario si la palabra está en el catálogo. */
  id?: string;
  /** ¿Es una palabra (y no puntuación/espacio)? */
  w?: boolean;
}

export type LookupIndex = Map<string, VocabItem>;

const MARKS = /\p{Mn}/gu;
/** Normaliza para buscar: minúsculas y, en ruso/árabe, sin acentos de énfasis ni harakat. */
export function normalizeKey(language: LanguageCode, s: string): string {
  const lower = s.normalize("NFC").toLowerCase();
  return language === "ru" || language === "ar" ? lower.normalize("NFD").replace(MARKS, "").normalize("NFC") : lower;
}

/** Índice forma → palabra (lema, formas flexionadas y formas aceptadas). Gana la más frecuente. */
export function buildLookupIndex(language: LanguageCode, vocab: VocabItem[]): LookupIndex {
  const idx: LookupIndex = new Map();
  const add = (form: string | undefined, v: VocabItem) => {
    if (!form) return;
    const k = normalizeKey(language, form);
    if (k && !idx.has(k)) idx.set(k, v);
  };
  // El vocabulario ya viene ordenado por frecuencia: el primero en entrar gana.
  for (const v of vocab) add(v.lemma, v);
  for (const v of vocab) {
    for (const f of v.forms ?? []) add(f, v);
    for (const f of v.acceptedForms ?? []) add(f, v);
  }
  return idx;
}

const KO_PARTICLES = ["에서는", "에게서", "으로는", "이랑", "에서", "에게", "한테", "으로", "까지", "부터", "보다", "처럼", "하고", "은", "는", "이", "가", "을", "를", "에", "의", "도", "로", "와", "과", "만", "랑", "요"];
// Terminaciones verbales frecuentes (de más larga a más corta) → raíz + 다.
const KO_ENDINGS = ["었어요", "았어요", "였어요", "했어요", "습니다", "ㅂ니다", "어요", "아요", "해요", "었다", "았다", "했다", "세요", "고", "는", "은", "을", "면", "서", "지", "게", "기", "요", "어", "아", "다"];

function koVerbCandidates(k: string): string[] {
  const out: string[] = [];
  if (/했(어요|다|어|습니다)?$/.test(k) || /해(요)?$/.test(k)) out.push(k.replace(/(했어요|했습니다|했다|했어|했|해요|해)$/, "") + "하다");
  for (const e of KO_ENDINGS) if (k.endsWith(e) && k.length > e.length) out.push(k.slice(0, -e.length) + "다");
  return out;
}

const AR_CLITICS = ["وال", "بال", "فال", "كال", "لل", "ال", "و", "ف", "ب", "ل", "ك"];

function lookupWord(language: LanguageCode, word: string, idx: LookupIndex): VocabItem | undefined {
  const k = normalizeKey(language, word);
  const direct = idx.get(k);
  if (direct) return direct;
  if (language === "ko") {
    for (const p of KO_PARTICLES) if (k.endsWith(p) && k.length > p.length) {
      const hit = idx.get(k.slice(0, -p.length));
      if (hit) return hit;
    }
    for (const c of koVerbCandidates(k)) {
      const hit = idx.get(c);
      if (hit) return hit;
    }
  }
  if (language === "ar") {
    for (const c of AR_CLITICS) if (k.startsWith(c) && k.length > c.length + 1) {
      const hit = idx.get(k.slice(c.length));
      if (hit) return hit;
    }
  }
  if (language === "fr" || language === "it") {
    // l'eau, dell'acqua, qu'il…
    const m = k.match(/^[a-z]+['’](.+)$/);
    if (m) return idx.get(m[1]!);
  }
  return undefined;
}

const SPACED_WORD = /[\p{L}\p{M}][\p{L}\p{M}'’\-]*/gu;
const CJK = /[぀-ヿ㐀-鿿豈-﫿々]/;

/** Divide un texto en tokens enlazados al vocabulario. */
export function tokenize(language: LanguageCode, text: string, idx: LookupIndex, spaceSeparated: boolean): Token[] {
  const out: Token[] = [];
  if (spaceSeparated) {
    let last = 0;
    for (const m of text.matchAll(SPACED_WORD)) {
      const start = m.index!;
      if (start > last) out.push({ t: text.slice(last, start) });
      const word = m[0];
      const v = lookupWord(language, word, idx);
      out.push({ t: word, w: true, id: v?.id });
      last = start + word.length;
    }
    if (last < text.length) out.push({ t: text.slice(last) });
    return out;
  }
  // Japonés / chino: segmentación voraz por la palabra más larga del diccionario.
  let i = 0;
  let plain = "";
  const flush = () => {
    if (plain) out.push({ t: plain });
    plain = "";
  };
  while (i < text.length) {
    const ch = text[i]!;
    if (!CJK.test(ch)) {
      plain += ch;
      i++;
      continue;
    }
    let hit: { len: number; v: VocabItem } | null = null;
    for (let len = Math.min(8, text.length - i); len >= 1; len--) {
      const v = idx.get(text.slice(i, i + len));
      if (v) {
        hit = { len, v };
        break;
      }
    }
    flush();
    if (hit) {
      out.push({ t: text.slice(i, i + hit.len), w: true, id: hit.v.id });
      i += hit.len;
    } else {
      out.push({ t: ch, w: true });
      i++;
    }
  }
  flush();
  return out;
}

/** Número aproximado de palabras que conoce alguien con este θ de vocabulario (inversa de rankToTheta). */
export function knownRankForTheta(theta: number): number {
  return Math.round(300 * Math.exp((theta + 2.5) / 1.27));
}

export interface TextAnalysis {
  words: number;
  /** Proporción de palabras reconocidas que (probablemente) ya conoces. */
  coverage: number;
  /** Nivel del texto: frecuencia de la palabra en el percentil 95. */
  level: CefrLevel;
  theta: number;
  /** Palabras nuevas más útiles del texto (más frecuentes primero). */
  newWords: string[];
  /** 0–100: cuánto conviene este texto ahora (ideal ≈ 90–98 % de cobertura). */
  suitability: number;
}

export function analyzeTokens(tokens: Token[], vocabById: (id: string) => VocabItem | undefined, knownRank: number, knownIds: Set<string>): TextAnalysis {
  const words = tokens.filter((t) => t.w);
  const thetas: number[] = [];
  let known = 0;
  let counted = 0;
  const fresh = new Map<string, number>();
  for (const t of words) {
    const v = t.id ? vocabById(t.id) : undefined;
    if (!v) continue;
    counted++;
    const th = itemTheta(v);
    thetas.push(th);
    const isKnown = knownIds.has(v.id) || (v.rank ?? 99999) <= knownRank;
    if (isKnown) known++;
    else fresh.set(v.id, v.rank ?? 99999);
  }
  // Las palabras que no están en el catálogo suelen ser nombres propios o muy raras: cuentan como medio desconocidas.
  const unknownExtra = (words.length - counted) * 0.5;
  const coverage = words.length ? known / Math.max(1, counted + unknownExtra) : 0;
  const sorted = [...thetas].sort((a, b) => a - b);
  const theta = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))]! : -2.5;
  const ideal = 0.95;
  const suitability = Math.round(Math.max(0, 100 - Math.abs(coverage - ideal) * (coverage < ideal ? 420 : 250)));
  return {
    words: words.length,
    coverage,
    level: thetaToCefr(theta),
    theta,
    newWords: [...fresh.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id).slice(0, 30),
    suitability,
  };
}

export interface QuizQuestion {
  kind: "meaning" | "cloze";
  prompt: string;
  /** Frase de contexto (cloze) o palabra (meaning). */
  context?: string;
  options: string[];
  answer: string;
  itemId?: string;
}

/**
 * Preguntas deterministas sobre el texto: significado de palabras nuevas del
 * propio texto y huecos en frases del texto (opciones tomadas del mismo texto).
 */
export function buildQuiz(opts: {
  sentences: string[];
  newWordIds: string[];
  vocabById: (id: string) => VocabItem | undefined;
  pool: VocabItem[];
  translate: (v: VocabItem) => string;
  language: LanguageCode;
  spaceSeparated: boolean;
  seed: string;
  size?: number;
}): QuizQuestion[] {
  const rand = mulberry32(hashString(opts.seed));
  const out: QuizQuestion[] = [];
  const size = opts.size ?? 6;
  // 1) Significado de palabras nuevas (hasta la mitad).
  for (const id of opts.newWordIds) {
    if (out.length >= Math.ceil(size / 2)) break;
    const v = opts.vocabById(id);
    if (!v) continue;
    const answer = opts.translate(v);
    const near = opts.pool.filter((o) => o.id !== v.id && Math.abs((o.rank ?? 0) - (v.rank ?? 0)) < 800 && opts.translate(o) !== answer);
    const distractors = shuffle(near, rand).slice(0, 3).map(opts.translate);
    if (distractors.length < 3) continue;
    out.push({ kind: "meaning", prompt: `¿Qué significa «${v.lemma}» en el texto?`, context: v.lemma, options: shuffle([answer, ...distractors], rand), answer, itemId: v.id });
  }
  // 2) Huecos en frases del texto con palabras del catálogo.
  const cands = shuffle(opts.sentences.filter((s) => s.length >= 30 && s.length <= 220), rand);
  const words = new Set<string>();
  for (const s of opts.sentences) for (const m of s.matchAll(SPACED_WORD)) if (m[0].length >= 4) words.add(m[0]);
  const wordList = [...words];
  for (const s of cands) {
    if (out.length >= size || !opts.spaceSeparated) break;
    const ms = [...s.matchAll(SPACED_WORD)].filter((m) => m[0].length >= 5);
    if (ms.length < 3) continue;
    const pick = ms[Math.floor(rand() * ms.length)]!;
    const answer = pick[0];
    const distractors = shuffle(wordList.filter((w) => w.toLowerCase() !== answer.toLowerCase()), rand).slice(0, 3);
    if (distractors.length < 3) continue;
    const blanked = s.slice(0, pick.index) + "_____" + s.slice(pick.index! + answer.length);
    out.push({ kind: "cloze", prompt: "Completa la frase del texto", context: blanked, options: shuffle([answer, ...distractors], rand), answer });
  }
  return out;
}

/** Frases de un texto (aprox., multilingüe). */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。！？])\s*/u)
    .map((s) => s.trim())
    .filter(Boolean);
}
