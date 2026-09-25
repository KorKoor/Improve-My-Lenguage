/**
 * Generación y resolución determinista de ejercicios a partir del catálogo.
 *
 * Cada ejercicio tiene una `key` estable ("tipo|itemId|variante"). El cliente
 * recibe el ejercicio SIN la respuesta; el servidor vuelve a resolver la key
 * contra el catálogo para evaluar. Así la evaluación es server-side y no hace
 * falta guardar ejercicios generados en la base de datos.
 */
import { pronouns, tenseLabel, TENSE_ORDER, withPronoun } from "../content/conjugation";
import type { GrammarConcept, LanguageCode, Skill, TenseKey, VocabItem } from "../content/types";
import { CEFR_CENTER, itemTheta } from "./levels";
import { hashString, mulberry32, sample, shuffle } from "./random";

export const EXERCISE_TYPES = [
  "meaning_mc",
  "reverse_mc",
  "recall",
  "cloze",
  "dictation",
  "rearrange",
  "match",
  "grammar",
  "conjugate",
  "speak",
  "listen_mc",
  "listen_pick",
  "dictation_word",
] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export interface Exercise {
  key: string;
  type: ExerciseType;
  language: LanguageCode;
  skill: Skill;
  itemIds: string[];
  grammarId?: string;
  /** Dificultad estimada en la escala θ. */
  difficulty: number;
  instruction: string;
  prompt: string;
  /** Texto secundario (traducción del ejemplo, lectura, pista). */
  context?: string;
  options?: string[];
  tokens?: string[];
  pairs?: { left: string[]; right: string[] };
  /** Texto a leer con síntesis de voz (dictado, pronunciación). */
  audioText?: string;
  /** Pista opcional para respuestas escritas (primera letra y longitud). */
  hint?: string;
  /** Tipo de entrada esperada en la UI. */
  input: "choice" | "text" | "order" | "match" | "speech";
  expectedMs: number;
}

export interface ResolvedAnswer {
  accepted: string[];
  display: string;
  explanation?: string;
  errorCategory: string;
  mode: "text" | "choice" | "match" | "speech";
  /** ¿Se toleran erratas? (no en gramática ni orden de palabras). */
  typos: boolean;
}

export interface Catalog {
  vocab: (language: LanguageCode) => VocabItem[];
  vocabById: (id: string) => VocabItem | undefined;
  grammarById: (id: string) => GrammarConcept | undefined;
  spaceSeparated: (language: LanguageCode) => boolean;
}

const TYPE_OFFSET: Record<ExerciseType, number> = {
  meaning_mc: -0.6,
  reverse_mc: -0.3,
  match: -0.5,
  recall: 0.3,
  cloze: 0.1,
  rearrange: 0.2,
  dictation: 0.5,
  grammar: 0,
  conjugate: 0.4,
  speak: 0.3,
  listen_mc: -0.3,
  listen_pick: -0.2,
  dictation_word: 0.2,
};

const EXPECTED_MS: Record<ExerciseType, number> = {
  meaning_mc: 6000,
  reverse_mc: 7000,
  match: 20000,
  recall: 10000,
  cloze: 12000,
  rearrange: 20000,
  dictation: 25000,
  grammar: 15000,
  conjugate: 12000,
  speak: 20000,
  listen_mc: 9000,
  listen_pick: 9000,
  dictation_word: 14000,
};

/** «m _ _ _ _» : primera letra y huecos (ayuda sin regalar la respuesta). */
export function letterHint(word: string): string {
  const chars = [...word];
  if (chars.length <= 2) return `${chars[0] ?? ""}…`;
  return chars.map((c, i) => (i === 0 || c === " " || c === "'" || c === "-" ? c : "_")).join(" ");
}

export function translationOf(item: VocabItem, native: LanguageCode): string[] {
  return (
    item.translations[native] ??
    item.translations.es ??
    item.translations.en ??
    (item.definition ? [item.definition] : [item.lemma])
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Busca el lema dentro de un ejemplo. Devuelve el texto con hueco o null. */
export function blankOut(text: string, lemma: string, spaceSeparated: boolean): string | null {
  if (!spaceSeparated) {
    return text.includes(lemma) ? text.replace(lemma, "＿＿＿") : null;
  }
  const re = new RegExp(`(^|[^\\p{L}\\p{N}'])(${escapeRegExp(lemma)})(?=$|[^\\p{L}\\p{N}'])`, "iu");
  if (!re.test(text)) return null;
  return text.replace(re, (_m, pre: string) => `${pre}___`);
}

const positions = new WeakMap<VocabItem[], Map<string, number>>();
function positionIn(pool: VocabItem[], id: string): number {
  let m = positions.get(pool);
  if (!m) {
    m = new Map(pool.map((v, i) => [v.id, i]));
    positions.set(pool, m);
  }
  return m.get(id) ?? -1;
}

function distractors(
  item: VocabItem,
  pool: VocabItem[],
  n: number,
  rand: () => number,
  label: (v: VocabItem) => string,
): string[] {
  const own = label(item).toLowerCase();
  // El pool está ordenado por frecuencia: los vecinos tienen un nivel parecido.
  // Mirar sólo ~120 palabras cercanas hace los distractores más plausibles y
  // evita ordenar miles de palabras en cada ejercicio.
  const at = positionIn(pool, item.id);
  const nearby = at < 0 ? pool.slice(0, 240) : pool.slice(Math.max(0, at - 60), at + 61);
  const candidates = nearby.filter(
    (v) => v.id !== item.id && label(v).toLowerCase() !== own,
  );
  // Preferir misma categoría gramatical y nivel cercano: distractores plausibles.
  const scored = shuffle(candidates, rand).sort((a, b) => {
    const sa = (a.pos === item.pos ? 0 : 2) + Math.abs(itemTheta(a) - itemTheta(item));
    const sb = (b.pos === item.pos ? 0 : 2) + Math.abs(itemTheta(b) - itemTheta(item));
    return sa - sb;
  });
  const out: string[] = [];
  for (const v of scored) {
    const l = label(v);
    if (!out.some((o) => o.toLowerCase() === l.toLowerCase())) out.push(l);
    if (out.length >= n) break;
  }
  return out;
}

export function buildVocabExercise(
  type: Exclude<ExerciseType, "grammar" | "match">,
  item: VocabItem,
  catalog: Catalog,
  native: LanguageCode,
  seed = 0,
): Exercise | null {
  const rand = mulberry32(hashString(`${type}|${item.id}|${seed}`));
  const pool = catalog.vocab(item.language);
  const spaced = catalog.spaceSeparated(item.language);
  const base = {
    language: item.language,
    itemIds: [item.id],
    difficulty: itemTheta(item) + TYPE_OFFSET[type],
    expectedMs: EXPECTED_MS[type],
  };
  const tr = (v: VocabItem) => translationOf(v, native)[0]!;

  switch (type) {
    case "meaning_mc": {
      const opts = shuffle([tr(item), ...distractors(item, pool, 3, rand, tr)], rand);
      return {
        ...base,
        key: `meaning_mc|${item.id}`,
        type,
        skill: "vocabulary",
        instruction: "¿Qué significa?",
        prompt: item.lemma,
        context: item.reading,
        options: opts,
        audioText: item.lemma,
        input: "choice",
      };
    }
    case "reverse_mc": {
      const lemma = (v: VocabItem) => v.lemma;
      const opts = shuffle([item.lemma, ...distractors(item, pool, 3, rand, lemma)], rand);
      return {
        ...base,
        key: `reverse_mc|${item.id}`,
        type,
        skill: "vocabulary",
        instruction: "Elige la palabra correcta",
        prompt: translationOf(item, native).join(", "),
        options: opts,
        input: "choice",
      };
    }
    case "recall": {
      return {
        ...base,
        key: `recall|${item.id}`,
        type,
        skill: "vocabulary",
        instruction: "Escribe la palabra",
        prompt: translationOf(item, native).join(", "),
        hint: letterHint(item.lemma),
        context: item.examples[0]
          ? blankOut(item.examples[0].text, item.lemma, spaced) ?? undefined
          : undefined,
        input: "text",
      };
    }
    case "cloze": {
      const idx = item.examples.findIndex((e) => blankOut(e.text, item.lemma, spaced) !== null);
      if (idx < 0) return null;
      const ex = item.examples[idx]!;
      return {
        ...base,
        key: `cloze|${item.id}|${idx}`,
        type,
        skill: "vocabulary",
        instruction: "Completa la frase",
        prompt: blankOut(ex.text, item.lemma, spaced)!,
        context: ex.translation?.[native],
        hint: letterHint(item.lemma),
        input: "text",
      };
    }
    case "speak": {
      // Frase corta del ejemplo: se lee en voz alta y el navegador la transcribe.
      const idx = item.examples.findIndex((e) => {
        const n = spaced ? e.text.split(/\s+/).length : [...e.text].length;
        return spaced ? n >= 3 && n <= 9 : n >= 4 && n <= 16;
      });
      if (idx < 0) return null;
      const ex = item.examples[idx]!;
      return {
        ...base,
        key: `speak|${item.id}|${idx}`,
        type,
        skill: "pronunciation",
        instruction: "Lee la frase en voz alta",
        prompt: ex.text,
        context: ex.translation?.[native],
        audioText: ex.text,
        input: "speech",
      };
    }
    case "conjugate": {
      // Tiempos básicos primero: presente y pasado salen más a menudo.
      const tenses = TENSE_ORDER.filter((t) => item.conjugation?.[t]);
      if (tenses.length === 0) return null;
      const weighted = tenses.flatMap((t) => (t === "ind.pres" ? [t, t, t] : t === "ind.pret" || t === "ind.past" ? [t, t] : [t]));
      const tense = weighted[Math.floor(rand() * weighted.length)]!;
      const row = item.conjugation![tense]!;
      const persons = row.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
      const person = persons[Math.floor(rand() * persons.length)]!;
      return {
        ...base,
        key: `conjugate|${item.id}|${tense}:${person}`,
        type,
        skill: "grammar",
        instruction: `Conjuga · ${tenseLabel(item.language, tense)}`,
        prompt: `${item.lemma} → ${pronouns(item.language)[person]} …`,
        context: translationOf(item, native)[0],
        input: "text",
      };
    }
    case "listen_mc": {
      const opts = shuffle([tr(item), ...distractors(item, pool, 3, rand, tr)], rand);
      return {
        ...base,
        key: `listen_mc|${item.id}`,
        type,
        skill: "listening",
        instruction: "Escucha y elige qué significa",
        prompt: "",
        options: opts,
        audioText: item.lemma,
        input: "choice",
      };
    }
    case "listen_pick": {
      const lemma = (v: VocabItem) => v.lemma;
      const opts = shuffle([item.lemma, ...distractors(item, pool, 3, rand, lemma)], rand);
      return {
        ...base,
        key: `listen_pick|${item.id}`,
        type,
        skill: "listening",
        instruction: "Escucha y elige la palabra que oyes",
        prompt: "",
        options: opts,
        audioText: item.lemma,
        input: "choice",
      };
    }
    case "dictation_word": {
      return {
        ...base,
        key: `dictation_word|${item.id}`,
        type,
        skill: "listening",
        instruction: "Escucha y escribe la palabra",
        prompt: "",
        context: translationOf(item, native)[0],
        audioText: item.lemma,
        hint: letterHint(item.lemma),
        input: "text",
      };
    }
    case "dictation": {
      const idx = item.examples.length > 1 ? Math.floor(rand() * item.examples.length) : 0;
      const ex = item.examples[idx];
      if (!ex) return null;
      return {
        ...base,
        key: `dictation|${item.id}|${idx}`,
        type,
        skill: "listening",
        instruction: "Escucha y escribe lo que oyes",
        prompt: "",
        audioText: ex.text,
        input: "text",
      };
    }
    case "rearrange": {
      if (!spaced) return null;
      const idx = item.examples.findIndex((e) => {
        const n = e.text.split(/\s+/).length;
        return n >= 4 && n <= 12;
      });
      if (idx < 0) return null;
      const ex = item.examples[idx]!;
      const words = ex.text.replace(/[.!?]$/, "").split(/\s+/);
      let tokens = shuffle(words, rand);
      if (tokens.join(" ") === words.join(" ")) tokens = [...tokens].reverse();
      return {
        ...base,
        key: `rearrange|${item.id}|${idx}`,
        type,
        skill: "grammar",
        instruction: "Ordena las palabras",
        prompt: ex.translation?.[native] ?? "",
        tokens,
        input: "order",
      };
    }
  }
}

export function buildMatchExercise(
  items: VocabItem[],
  native: LanguageCode,
  seed = 0,
): Exercise | null {
  if (items.length < 3) return null;
  const chosen = items.slice(0, 5);
  const rand = mulberry32(hashString(`match|${chosen.map((i) => i.id).join(",")}|${seed}`));
  const avg = chosen.reduce((a, i) => a + itemTheta(i), 0) / chosen.length;
  return {
    key: `match|${chosen.map((i) => i.id).join(",")}`,
    type: "match",
    language: chosen[0]!.language,
    skill: "vocabulary",
    itemIds: chosen.map((i) => i.id),
    difficulty: avg + TYPE_OFFSET.match,
    instruction: "Une cada palabra con su significado",
    prompt: "",
    pairs: {
      left: shuffle(chosen.map((i) => i.lemma), rand),
      right: shuffle(chosen.map((i) => translationOf(i, native)[0]!), rand),
    },
    input: "match",
    expectedMs: EXPECTED_MS.match,
  };
}

export function buildGrammarExercise(
  concept: GrammarConcept,
  index: number,
  seed = 0,
): Exercise | null {
  const ex = concept.exercises[index];
  if (!ex) return null;
  const rand = mulberry32(hashString(`grammar|${concept.id}|${index}|${seed}`));
  const instruction =
    ex.type === "mc"
      ? "Elige la opción correcta"
      : ex.type === "fill"
        ? "Completa el hueco"
        : "Corrige la frase";
  return {
    key: `grammar|${concept.id}|${index}`,
    type: "grammar",
    language: concept.language,
    skill: "grammar",
    itemIds: [concept.id],
    grammarId: concept.id,
    difficulty: CEFR_CENTER[concept.cefr] + (ex.type === "correct" ? 0.3 : 0),
    instruction,
    prompt: ex.prompt,
    context: concept.title,
    options: ex.options ? shuffle(ex.options, rand) : undefined,
    input: ex.options ? "choice" : "text",
    expectedMs: EXPECTED_MS.grammar,
  };
}

/** Resuelve una key a sus respuestas aceptadas (sólo en el servidor). */
export function resolveExercise(
  key: string,
  catalog: Catalog,
  native: LanguageCode,
): ResolvedAnswer | null {
  const [type, id, variant] = key.split("|") as [string, string, string | undefined];
  if (!type || !id) return null;

  if (type === "grammar") {
    const concept = catalog.grammarById(id);
    const ex = concept?.exercises[Number(variant)];
    if (!concept || !ex) return null;
    return {
      accepted: ex.answers,
      display: ex.answers[0]!,
      explanation: ex.explanation,
      errorCategory: concept.errorCategory,
      mode: ex.options ? "choice" : "text",
      typos: false,
    };
  }

  if (type === "match") {
    const items = id.split(",").map((i) => catalog.vocabById(i));
    if (items.some((i) => !i)) return null;
    const pairs = (items as VocabItem[]).map((i) => `${i.lemma}=${translationOf(i, native)[0]}`);
    return {
      accepted: [pairs.sort().join("\n")],
      display: pairs.join(" · "),
      errorCategory: "vocabulary",
      mode: "match",
      typos: false,
    };
  }

  const item = catalog.vocabById(id);
  if (!item) return null;
  const tr = translationOf(item, native);
  const usage = item.usageNote;

  switch (type) {
    case "meaning_mc":
      return {
        accepted: [tr[0]!],
        display: tr.join(", "),
        explanation: usage,
        errorCategory: "vocabulary",
        mode: "choice",
        typos: false,
      };
    case "reverse_mc":
      return { accepted: [item.lemma], display: item.lemma, explanation: usage, errorCategory: "vocabulary", mode: "choice", typos: false };
    case "listen_mc":
      return { accepted: [tr[0]!], display: `${item.lemma} = ${tr.join(", ")}`, explanation: usage, errorCategory: "listening", mode: "choice", typos: false };
    case "listen_pick":
      return { accepted: [item.lemma], display: `${item.lemma} = ${tr.join(", ")}`, explanation: usage, errorCategory: "listening", mode: "choice", typos: false };
    case "dictation_word":
      return { accepted: [item.lemma, ...(item.acceptedForms ?? [])], display: `${item.lemma} = ${tr.join(", ")}`, errorCategory: "listening", mode: "text", typos: true };
    case "recall":
    case "cloze":
      return {
        accepted: [item.lemma, ...(item.acceptedForms ?? [])],
        display: item.reading ? `${item.lemma} (${item.reading})` : item.lemma,
        explanation: usage,
        errorCategory: type === "recall" ? "vocabulary" : "vocabulary-in-context",
        mode: "text",
        typos: true,
      };
    case "dictation": {
      const ex = item.examples[Number(variant)];
      if (!ex) return null;
      return { accepted: [ex.text], display: ex.text, errorCategory: "listening", mode: "text", typos: true };
    }
    case "speak": {
      const ex = item.examples[Number(variant)];
      if (!ex) return null;
      return { accepted: [ex.text], display: ex.text, explanation: ex.translation?.[native], errorCategory: "pronunciation", mode: "speech", typos: true };
    }
    case "conjugate": {
      const [tense, personRaw] = (variant ?? "").split(":");
      const person = Number(personRaw);
      const form = item.conjugation?.[tense as TenseKey]?.[person];
      if (!form) return null;
      // Se acepta con o sin pronombre («avons» o «nous avons», «ai» o «j'ai»).
      const full = withPronoun(item.language, person, form);
      const extra = pronouns(item.language)[person]!.split("/").map((p) => `${p} ${form}`);
      return {
        accepted: [form, full, ...extra],
        display: full,
        explanation: `${item.lemma} · ${tenseLabel(item.language, tense as TenseKey)}`,
        errorCategory: "conjugation",
        mode: "text",
        typos: false,
      };
    }
    case "rearrange": {
      const ex = item.examples[Number(variant)];
      if (!ex) return null;
      const target = ex.text.replace(/[.!?]$/, "");
      return {
        accepted: [target],
        display: ex.text,
        explanation: ex.translation?.[native],
        errorCategory: "word-order",
        mode: "text",
        typos: false,
      };
    }
  }
  return null;
}

/** Normaliza la respuesta de un ejercicio de emparejar para compararla. */
export function canonicalMatchResponse(pairs: Record<string, string>): string {
  return Object.entries(pairs)
    .map(([l, r]) => `${l}=${r}`)
    .sort()
    .join("\n");
}

/** Pequeña ayuda para escoger tipo de ejercicio según madurez de la tarjeta. */
/** Preferencias del cuestionario de perfil que sesgan el tipo de ejercicio (−1…1). */
export interface ExerciseStyle {
  /** + prefiere escuchar, − prefiere leer. */
  ear: number;
  /** + le gusta el reto, − prefiere ir seguro. */
  challenge: number;
}

/**
 * Etapa del alumno para elegir ejercicios. Un principiante total no debe
 * escribir de memoria ni hacer dictados de frases: primero reconoce.
 */
export type LearnerStage = "novice" | "beginner" | "intermediate";

export function learnerStage(theta: number): LearnerStage {
  return theta < -2.1 ? "novice" : theta < -1.1 ? "beginner" : "intermediate";
}

type VocabType = Exclude<ExerciseType, "grammar" | "match">;

/**
 * Escalera de ejercicios por palabra: reconocer (leer y oír) → producir con
 * ayuda → producir sin ayuda. Depende de cuántas veces has visto la palabra
 * (`reps`), de tu etapa en vocabulario y, para lo auditivo, en escucha.
 */
export function pickVocabExerciseType(
  reps: number,
  rand: () => number,
  allowAudio: boolean,
  style?: ExerciseStyle,
  canConjugate = false,
  stage: LearnerStage = "intermediate",
  listenStage: LearnerStage = stage,
): VocabType {
  if (reps === 0) return "meaning_mc";
  const pool: VocabType[] = [];
  const add = (t: VocabType, n = 1) => {
    for (let i = 0; i < n; i++) pool.push(t);
  };
  const audio = allowAudio;
  if (reps === 1) {
    add("meaning_mc");
    add("reverse_mc", stage === "novice" ? 1 : 2);
    if (audio) add("listen_mc", listenStage === "intermediate" ? 1 : 2);
  } else if (stage === "novice" || (stage === "beginner" && reps <= 2)) {
    // Sólo reconocimiento (con y sin audio); escribir llega a partir de la 3.ª vez.
    add("reverse_mc", 2);
    add("meaning_mc");
    if (audio) add("listen_pick", 2), add("listen_mc", 2);
    if (stage === "novice" && reps >= 4) add("recall");
  } else if (stage === "beginner") {
    add("reverse_mc");
    add("recall", 2);
    add("cloze");
    add("rearrange");
    if (audio) add("listen_pick"), add("listen_mc"), add("dictation_word", listenStage === "novice" ? 0 : 1);
    if (canConjugate && reps >= 3) add("conjugate");
    if (audio && reps >= 3) add("speak");
  } else {
    add("recall");
    add("cloze", 2);
    add("reverse_mc");
    add("rearrange");
    if (audio) {
      add(listenStage === "intermediate" ? "dictation" : "dictation_word");
      add("listen_pick");
      add("speak");
    }
    if (canConjugate) add("conjugate", 2);
  }
  // La forma de aprender inclina la balanza, sin romper la escalera.
  if (style) {
    if (style.ear > 0.3 && audio) add(pool.includes("dictation") ? "dictation" : "listen_mc");
    if (style.ear < -0.3) add(pool.includes("cloze") ? "cloze" : "reverse_mc");
    if (style.challenge > 0.3 && pool.includes("recall")) add("recall");
    if (style.challenge < -0.3) add("reverse_mc");
  }
  return pool[Math.floor(rand() * pool.length)]!;
}
