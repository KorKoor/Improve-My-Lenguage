/**
 * «Camino guiado» A0 → A1: 30 lecciones fijas por idioma para quien empieza
 * de cero y no quiere decidir nada.
 *
 * Lecciones 1–10: una unidad de «Primeros pasos» (frases de supervivencia) +
 * 5 palabras básicas. Lecciones 11–30: 8 palabras + un tema de gramática A1
 * cada dos lecciones. Cada lección: presentación → práctica de reconocimiento
 * (la escalera de novato) → repaso de la lección anterior → mini reto.
 * Determinista (misma ruta para todos) y puro: se prueba sin base de datos.
 */
import { FIRST_STEPS, unitPhrases } from "../content/first-steps";
import { resolveConcepts } from "../content/core-concepts";
import type { GrammarConcept, LanguageCode, VocabItem } from "../content/types";
import { buildGrammarExercise, buildMatchExercise, buildPhraseExercise, buildVocabExercise, translationOf, type Catalog } from "./exercises";
import { mulberry32, shuffle } from "./random";
import { wordCard, type SessionStep } from "./session-builder";

export const COURSE_LENGTH = 30;
export const PASS_ACCURACY = 0.6;

export interface Lesson {
  n: number;
  title: string;
  goal: string;
  emoji: string;
  /** Unidad de Primeros pasos (lecciones 1–10). */
  unitIdx: number | null;
  wordIds: string[];
  grammarId: string | null;
  /** Historia recomendada al terminar (si hay para el idioma). */
  storyId: string | null;
}

/**
 * Orden «concreto primero»: sustantivos, números y adjetivos antes que
 * adverbios abstractos. Los pronombres y partículas se aprenden dentro de las
 * frases y la gramática, no como palabras sueltas (a un principiante «on» o
 * «dont» aislados no le dicen nada).
 */
const POS_PENALTY: Record<string, number> = { noun: 0, numeral: 0, adjective: 60, verb: 60, interjection: 60, adverb: 250 };

/** Palabras del curso: frecuentes y concretas (sin nombres propios, formas sueltas ni duplicados de significado). */
export function courseWords(vocab: VocabItem[], native: LanguageCode, count: number): VocabItem[] {
  const pool = vocab.slice(0, 1500).flatMap((v, i) => {
    const penalty = POS_PENALTY[v.pos];
    if (penalty === undefined) return [];
    const tr = v.translations[native] ?? v.translations.es;
    if (!tr?.length || /[()]/.test(tr[0]!)) return []; // «su (de él)», «(futuro)»: gramática, no vocabulario
    if (v.language !== "de" && v.lemma[0] !== v.lemma[0]!.toLowerCase()) return []; // nombres propios
    if (v.pos === "verb" && v.conjugation === undefined && v.forms === undefined && i > 50 && !/(r|re|ir|er|en|ть|る|다|ar)$/.test(v.lemma)) return [];
    return [{ v, score: i + penalty }];
  });
  pool.sort((a, b) => a.score - b.score);
  const out: VocabItem[] = [];
  const seen = new Set<string>();
  // Primero el núcleo curado (concreto y útil), luego la frecuencia.
  const core = native === "es" ? resolveConcepts(vocab.slice(0, 6000), native, vocab[0]?.language ?? "") : [];
  for (const v of [...core, ...pool.map((p) => p.v)]) {
    if (out.length >= count) break;
    const key = (v.translations[native] ?? v.translations.es)![0]!.toLowerCase();
    if (seen.has(key)) continue; // dos palabras con la misma traducción confunden al empezar
    seen.add(key);
    out.push(v);
  }
  return out;
}

export function buildCourse(
  lang: LanguageCode,
  vocab: VocabItem[],
  grammar: GrammarConcept[],
  native: LanguageCode,
  storyIds: string[] = [],
): Lesson[] {
  const words = courseWords(vocab, native, 5 * 10 + 8 * 20);
  const a1 = grammar.filter((g) => g.cefr === "A1" && g.exercises.some((e) => e.type === "mc"));
  const units = FIRST_STEPS.filter((u) => unitPhrases(u, lang).length >= 4);
  const lessons: Lesson[] = [];
  let w = 0;
  let g = 0;
  let s = 0;
  for (let n = 1; n <= COURSE_LENGTH; n++) {
    const early = n <= 10 && n - 1 < units.length;
    const take = early ? 5 : 8;
    const ws = words.slice(w, w + take);
    w += take;
    const unitIdx = early ? FIRST_STEPS.indexOf(units[n - 1]!) : null;
    const grammarConcept = !early && n % 2 === 1 && a1.length ? a1[g++ % a1.length]! : null;
    const storyId = n >= 12 && n % 6 === 0 && storyIds.length ? storyIds[s++ % storyIds.length]! : null;
    const unit = unitIdx !== null ? FIRST_STEPS[unitIdx]! : null;
    const tr = (v: VocabItem) => translationOf(v, native)[0]!;
    lessons.push({
      n,
      emoji: unit?.emoji ?? (grammarConcept ? "🧩" : "🌱"),
      title: unit ? unit.title : grammarConcept ? grammarConcept.title : `Palabras: ${ws.slice(0, 3).map(tr).join(", ")}…`,
      goal: unit ? `${unit.goal} Y ${ws.length} palabras nuevas.` : `${ws.length} palabras nuevas${grammarConcept ? " y un poco de gramática" : ""}: ${ws.slice(0, 4).map(tr).join(", ")}…`,
      unitIdx,
      wordIds: ws.map((v) => v.id),
      grammarId: grammarConcept?.id ?? null,
      storyId,
    });
  }
  return lessons;
}

/** Pasos de una lección para el reproductor de sesiones. */
export function lessonSteps(lesson: Lesson, prev: Lesson | null, lang: LanguageCode, native: LanguageCode, catalog: Catalog, grammar: GrammarConcept[], seed: number): SessionStep[] {
  const rand = mulberry32(seed);
  const steps: SessionStep[] = [];
  const keys = new Set<string>();
  const push = (block: "new_words" | "grammar" | "review" | "listening", ex: ReturnType<typeof buildVocabExercise>) => {
    if (!ex || keys.has(ex.key)) return;
    keys.add(ex.key);
    steps.push({ kind: "exercise", block, exercise: ex });
  };
  const words = lesson.wordIds.map((id) => catalog.vocabById(id)).filter((v): v is VocabItem => Boolean(v));

  // 1. Frases de supervivencia (lecciones 1–10): ficha de cada frase y práctica.
  if (lesson.unitIdx !== null) {
    const unit = FIRST_STEPS[lesson.unitIdx]!;
    const phrases = unitPhrases(unit, lang);
    const idxs = [0, 1, 2, 3, 4, 5].filter((i) => i < phrases.length);
    for (const i of idxs) {
      const ph = phrases[i]!;
      steps.push({ kind: "intro", block: "new_words", word: { id: `${lang}:p:${unit.id}:${i}`, lemma: ph.text, reading: ph.roman, pos: "phrase", translation: [ph.es] } });
    }
    for (const i of shuffle(idxs, rand).slice(0, 4)) push("new_words", buildPhraseExercise(lang, lesson.unitIdx, i, i % 2 ? "phrase_listen" : "phrase_pick", seed));
  }

  // 2. Palabras: ficha → significado → emparejar → escuchar.
  for (const v of words) steps.push({ kind: "intro", block: "new_words", word: wordCard(v, native) });
  for (const v of shuffle(words, rand)) push("new_words", buildVocabExercise("meaning_mc", v, catalog, native, seed));
  if (words.length >= 3) push("new_words", buildMatchExercise(words.slice(0, 5), native, seed));
  for (const v of shuffle(words, rand).slice(0, 3)) push("listening", buildVocabExercise("listen_mc", v, catalog, native, seed));

  // 3. Gramática A1 (sólo ejercicios de elegir).
  const g = lesson.grammarId ? grammar.find((x) => x.id === lesson.grammarId) : undefined;
  if (g) {
    const m = g.commonMistakes[0];
    steps.push({ kind: "tip", block: "grammar", grammar: { id: g.id, title: g.title, summary: g.summary, example: g.examples[0]?.text, mistake: m ? { wrong: m.wrong, right: m.right, why: m.why } : undefined } });
    g.exercises.map((e, i) => (e.type === "mc" ? i : -1)).filter((i) => i >= 0).slice(0, 2).forEach((i) => push("grammar", buildGrammarExercise(g, i, seed)));
  }

  // 4. Repaso de la lección anterior (recuperar lo de ayer fija la memoria).
  if (prev) {
    const pw = prev.wordIds.map((id) => catalog.vocabById(id)).filter((v): v is VocabItem => Boolean(v));
    for (const v of shuffle(pw, rand).slice(0, 3)) push("review", buildVocabExercise("reverse_mc", v, catalog, native, seed + 1));
  }

  // 5. Mini reto final: reconocer de oído y por escrito lo de hoy.
  for (const v of shuffle(words, rand).slice(0, 3)) push("review", buildVocabExercise(rand() < 0.5 ? "listen_pick" : "reverse_mc", v, catalog, native, seed + 2));
  if (lesson.unitIdx !== null) push("review", buildPhraseExercise(lang, lesson.unitIdx, Math.floor(rand() * 6), "phrase_listen", seed + 3));
  return steps;
}

/** Siguiente lección recomendada: la primera sin aprobar. */
export function nextLesson(done: Record<number, number>, total = COURSE_LENGTH): number {
  for (let n = 1; n <= total; n++) if (!done[n]) return n;
  return total;
}

export function lessonPassed(correct: number, total: number): boolean {
  return total > 0 && correct / total >= PASS_ACCURACY;
}
