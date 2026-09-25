/**
 * Convierte un plan de sesión (bloques + minutos) en pasos concretos:
 * tarjetas de presentación, consejos de gramática y ejercicios.
 * Puro y determinista (semilla) → testeable y reproducible.
 */
import { cognateInfo, type CognateInfo } from "./cognates";
import type { GrammarConcept, LanguageCode, VocabItem } from "../content/types";
import {
  buildGrammarExercise,
  buildMatchExercise,
  buildVocabExercise,
  pickVocabExerciseType,
  translationOf,
  type Catalog,
  type Exercise,
  type ExerciseStyle,
} from "./exercises";
import { CEFR_CENTER, itemTheta } from "./levels";
import { exercisesForBlock, type BlockKind, type SessionPlan } from "./planner";
import { hashString, mulberry32, shuffle } from "./random";

export interface KnowledgeLite {
  itemId: string;
  itemType: "vocab" | "grammar";
  reps: number;
  stability: number;
  status: "learning" | "known" | "difficult" | "saved";
  dueAt: Date;
}

export interface WordCard {
  id: string;
  lemma: string;
  reading?: string;
  ipa?: string;
  /** Pronunciación grabada (Wikimedia Commons), si existe. */
  audioUrl?: string;
  pos: string;
  translation: string[];
  example?: { text: string; translation?: string; reading?: string };
  usageNote?: string;
  /** Cognado («se parece al español») o falso amigo. */
  friend?: CognateInfo | null;
}

export interface GrammarTip {
  id: string;
  title: string;
  summary: string;
  example?: string;
  mistake?: { wrong: string; right: string; why: string };
}

export type SessionStep =
  | { kind: "intro"; block: BlockKind; word: WordCard }
  | { kind: "tip"; block: BlockKind; grammar: GrammarTip }
  | { kind: "exercise"; block: BlockKind; exercise: Exercise }
  | { kind: "tutor"; block: BlockKind; minutes: number };

export interface BuildInput {
  plan: SessionPlan;
  language: LanguageCode;
  native: LanguageCode;
  catalog: Catalog;
  grammar: GrammarConcept[];
  knowledge: KnowledgeLite[];
  /** Ítems vencidos ya ordenados por urgencia (de la BD). */
  due: KnowledgeLite[];
  vocabTheta: number;
  grammarTheta: number;
  interests: string[];
  seed: number;
  /** Preferencias del cuestionario de perfil (opcional). */
  style?: ExerciseStyle;
}

export function wordCard(v: VocabItem, native: LanguageCode): WordCard {
  const ex = v.examples[0];
  return {
    id: v.id,
    lemma: v.lemma,
    reading: v.reading,
    ipa: v.ipa,
    audioUrl: v.audioUrl,
    pos: v.pos,
    translation: translationOf(v, native),
    example: ex ? { text: ex.text, translation: ex.translation?.[native], reading: ex.reading } : undefined,
    usageNote: v.usageNote,
    friend: cognateInfo(v.lemma, v.language, translationOf(v, native), native),
  };
}

/** Selección de vocabulario nuevo: i+1 (algo por encima del nivel), intereses y guardadas primero. */
export function selectNewWords(
  vocab: VocabItem[],
  knowledge: Map<string, KnowledgeLite>,
  vocabTheta: number,
  interests: string[],
  count: number,
  rand: () => number,
): VocabItem[] {
  const target = vocabTheta + 0.4;
  const interestSet = new Set(interests);
  const scored = vocab
    .filter((v) => {
      const k = knowledge.get(v.id);
      return !k || (k.reps === 0 && k.status !== "known");
    })
    .map((v) => {
      const k = knowledge.get(v.id);
      const topicMatch = v.topics.some((t) => interestSet.has(t)) ? 1 : 0;
      const tooHard = itemTheta(v) - target > 1.2 ? 2 : 0;
      const score =
        Math.abs(itemTheta(v) - target) -
        0.9 * topicMatch -
        (k?.status === "saved" ? 1.5 : 0) +
        0.12 * v.frequencyBand +
        tooHard +
        rand() * 0.3; // pequeña variación para no repetir siempre el mismo orden
      return { v, score };
    })
    .sort((a, b) => a.score - b.score);
  return scored.slice(0, count).map((s) => s.v);
}

/** Concepto de gramática a practicar: el objetivo, o el más útil no dominado de tu nivel. */
export function selectGrammar(
  grammar: GrammarConcept[],
  knowledge: Map<string, KnowledgeLite>,
  grammarTheta: number,
  target?: string,
): GrammarConcept | null {
  if (target) {
    const g = grammar.find((c) => c.id === target);
    if (g) return g;
  }
  const candidates = grammar
    .filter((c) => CEFR_CENTER[c.cefr] <= grammarTheta + 1.2)
    .map((c) => {
      const k = knowledge.get(c.id);
      const strength = k ? Math.min(1, Math.log(1 + k.stability) / Math.log(31)) : 0;
      return { c, score: strength * 3 + Math.abs(CEFR_CENTER[c.cefr] - grammarTheta) * 0.5 };
    })
    .sort((a, b) => a.score - b.score);
  return candidates[0]?.c ?? grammar[0] ?? null;
}

export function buildSessionSteps(input: BuildInput): SessionStep[] {
  const rand = mulberry32(input.seed);
  const kmap = new Map(input.knowledge.map((k) => [k.itemId, k]));
  const vocab = input.catalog.vocab(input.language);
  const steps: SessionStep[] = [];
  const usedKeys = new Set<string>();
  const push = (block: BlockKind, ex: Exercise | null) => {
    if (!ex || usedKeys.has(ex.key)) return false;
    usedKeys.add(ex.key);
    steps.push({ kind: "exercise", block, exercise: ex });
    return true;
  };
  let newWords: VocabItem[] = [];

  for (const block of input.plan.blocks) {
    const n = exercisesForBlock(block);
    switch (block.kind) {
      case "review": {
        const items = input.due.slice(0, n);
        const reviewedVocab: VocabItem[] = [];
        for (const k of items) {
          if (k.itemType === "grammar") {
            const g = input.catalog.grammarById(k.itemId);
            if (g) push("review", buildGrammarExercise(g, k.reps % g.exercises.length));
            continue;
          }
          const v = input.catalog.vocabById(k.itemId);
          if (!v) continue;
          reviewedVocab.push(v);
          const type = pickVocabExerciseType(k.reps, rand, true, input.style, Boolean(v.conjugation));
          const ok = push("review", buildVocabExercise(type, v, input.catalog, input.native, input.seed));
          if (!ok) push("review", buildVocabExercise("meaning_mc", v, input.catalog, input.native));
        }
        break;
      }
      case "new_words": {
        const count = Math.max(1, Math.ceil(n / 2));
        newWords = selectNewWords(vocab, kmap, input.vocabTheta, input.interests, count, rand);
        for (const v of newWords) steps.push({ kind: "intro", block: "new_words", word: wordCard(v, input.native) });
        for (const v of shuffle(newWords, rand)) push("new_words", buildVocabExercise("meaning_mc", v, input.catalog, input.native));
        if (newWords.length >= 3) push("new_words", buildMatchExercise(newWords, input.native, input.seed));
        else for (const v of newWords) push("new_words", buildVocabExercise("reverse_mc", v, input.catalog, input.native));
        break;
      }
      case "grammar": {
        const g = selectGrammar(input.grammar, kmap, input.grammarTheta, block.target);
        if (!g) break;
        const k = kmap.get(g.id);
        const mistake = g.commonMistakes[0];
        steps.push({
          kind: "tip",
          block: "grammar",
          grammar: {
            id: g.id,
            title: g.title,
            summary: g.summary,
            example: g.examples[0]?.text,
            mistake: mistake ? { wrong: mistake.wrong, right: mistake.right, why: mistake.why } : undefined,
          },
        });
        const start = (k?.reps ?? 0) % g.exercises.length;
        const count = Math.min(n, g.exercises.length);
        for (let i = 0; i < count; i++) push("grammar", buildGrammarExercise(g, (start + i) % g.exercises.length));
        // Conjugación de verbos que ya conoces (si el idioma tiene tablas).
        const verbs = shuffle(
          vocab.filter((v) => v.conjugation && (kmap.get(v.id)?.reps ?? 0) > 0),
          rand,
        ).slice(0, block.minutes >= 4 ? 2 : 1);
        for (const v of verbs) push("grammar", buildVocabExercise("conjugate", v, input.catalog, input.native, input.seed));
        break;
      }
      case "listening": {
        const seen = vocab.filter((v) => (kmap.get(v.id)?.reps ?? 0) > 0);
        const pool = seen.length >= n ? seen : [...seen, ...newWords, ...vocab.filter((v) => itemTheta(v) <= input.vocabTheta + 0.5)];
        let added = 0;
        for (const v of shuffle(pool, rand)) {
          if (added >= n) break;
          if (push("listening", buildVocabExercise("dictation", v, input.catalog, input.native, input.seed))) added++;
        }
        break;
      }
      case "tutor":
        steps.push({ kind: "tutor", block: "tutor", minutes: block.minutes });
        break;
    }
  }
  return steps;
}

export function sessionSeed(userLanguageId: string, day: string, salt = ""): number {
  return hashString(`${userLanguageId}|${day}|${salt}`);
}
