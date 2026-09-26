/**
 * «Escritura y ortografía» (A1–A2): unidades cortas que se intercalan con el
 * Camino guiado y se eligen según los errores reales del alumno (tildes que
 * faltan, mayúsculas, letras confundidas…). Puro y determinista.
 */
import { writingFor, writingUnits } from "../content/writing-system";
import type { LanguageCode, VocabItem } from "../content/types";
import { jamoOf } from "../hangul";
import { spellingOf } from "../content/writing-system";
import { courseWords } from "./course";
import type { Catalog, Exercise } from "./exercises";
import { buildAccentExercise, buildLetterNameExercise, buildRuleExercise, buildSpellExercise } from "./letter-exercises";
import { mulberry32, shuffle } from "./random";
import type { SessionStep } from "./session-builder";

export type WritingUnitRef = ReturnType<typeof writingUnits>[number];

/** Categoría de error → tipo de unidad que la trabaja. */
export const CATEGORY_TO_KIND: Record<string, string> = {
  accents: "signs",
  capitalization: "capitals",
  punctuation: "punctuation",
  spelling: "spelling",
  letters: "alphabet",
};

export interface WritingPick {
  unit: WritingUnitRef;
  reason: string;
}

/**
 * Siguiente unidad: la que corresponde al error más repetido (≥ 2 en 4
 * semanas); si no hay, la primera sin hacer (A1 antes que A2).
 */
export function pickWritingUnit(lang: LanguageCode, done: Set<string>, mistakes: Record<string, number>): WritingPick | null {
  const units = writingUnits(lang);
  if (!units.length) return null;
  const weak = Object.entries(mistakes)
    .filter(([c, n]) => CATEGORY_TO_KIND[c] && n >= 2)
    .sort((a, b) => b[1] - a[1]);
  for (const [cat, n] of weak) {
    const unit = units.find((u) => u.kind === CATEGORY_TO_KIND[cat] && (!done.has(u.id) || n >= 3));
    if (unit) return { unit, reason: `Has tenido ${n} errores de ${LABEL[cat] ?? cat} últimamente.` };
  }
  const next = [...units].sort((a, b) => (a.level === b.level ? 0 : a.level === "A1" ? -1 : 1)).find((u) => !done.has(u.id));
  return next ? { unit: next, reason: next.level === "A1" ? "Lo básico para escribir bien." : "Un paso más en ortografía." } : null;
}

const LABEL: Record<string, string> = { accents: "tildes y signos", capitalization: "mayúsculas", punctuation: "puntuación", spelling: "ortografía", letters: "letras" };

/**
 * ¿Toca una unidad de escritura antes de la siguiente lección? Una cada 2–3
 * lecciones del Camino guiado, o antes si hay errores repetidos.
 */
export function writingDue(courseDone: number, writingDone: number, pick: WritingPick | null, mistakes: Record<string, number>): boolean {
  if (!pick) return false;
  const weak = Object.entries(mistakes).some(([c, n]) => CATEGORY_TO_KIND[c] && n >= 3);
  return weak || (courseDone >= 2 && writingDone < Math.floor(courseDone / 2.5) + 1);
}

/** Palabras para deletrear o para elegir su grafía (útiles y cortas). */
function practiceWords(lang: LanguageCode, vocab: VocabItem[], native: LanguageCode): VocabItem[] {
  const seen = new Set<string>();
  return [...courseWords(vocab, native, 200), ...vocab.slice(0, 1500)].filter((v) => !seen.has(v.id) && seen.add(v.id) && !/\s/.test(v.lemma));
}

export function writingSteps(unit: WritingUnitRef, lang: LanguageCode, native: LanguageCode, catalog: Catalog, opts: { seed: number; audioFirst?: boolean }): SessionStep[] {
  const rand = mulberry32(opts.seed);
  const w = writingFor(lang);
  if (!w) return [];
  const steps: SessionStep[] = [];
  const keys = new Set<string>();
  const push = (ex: Exercise | null) => {
    if (!ex || keys.has(ex.key)) return;
    keys.add(ex.key);
    steps.push({ kind: "exercise", block: "writing", exercise: ex });
  };
  const words = practiceWords(lang, catalog.vocab(lang), native);
  const spellable = words.filter((v) => {
    const n = spellingOf(lang, v.lemma, jamoOf)?.length ?? 0;
    return n >= 3 && n <= 6;
  });
  const accented = words.filter((v) => /[^\x00-\x7F]/.test(v.lemma) && /^\p{Script=Latin}+$/u.test(v.lemma));

  if (unit.kind === "alphabet") {
    const alphabet = w.alphabet ?? [];
    steps.push({
      kind: "rule",
      block: "writing",
      rule: {
        id: `${lang}:o:alphabet`,
        title: "El abecedario y cómo deletrear",
        explain: `${w.alphabetNote} Toca cada letra para oír su nombre: es lo que dirás al deletrear tu nombre o un correo.`,
        examples: alphabet.map((a) => ({ w: a.g, r: a.name, say: a.say })),
      },
    });
    for (const a of shuffle(alphabet, rand).slice(0, 6)) push(buildLetterNameExercise(lang, a.g.split(" ")[0]!, opts.seed));
    for (const v of shuffle(spellable, rand).slice(0, 3)) push(buildSpellExercise(v, native));
    return steps;
  }

  for (const r of unit.rules) {
    steps.push({ kind: "rule", block: "writing", rule: { id: `${lang}:o:${r.id}`, title: r.title, explain: r.explain, examples: r.examples } });
    push(buildRuleExercise(lang, r.id, opts.seed, true));
  }
  if (unit.kind === "signs") for (const v of shuffle(accented, rand).slice(0, 3)) push(buildAccentExercise(v, native, opts.seed));
  if (unit.kind === "spelling") {
    if (w.spelling) for (const v of shuffle(spellable, rand).slice(0, 2)) push(buildSpellExercise(v, native));
    for (const v of shuffle(accented, rand).slice(0, 2)) push(buildAccentExercise(v, native, opts.seed));
  }
  return steps;
}
