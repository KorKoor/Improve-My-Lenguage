import "server-only";
import { getVocab, vocabFor } from "../content";
import type { VocabItem } from "../content/types";
import * as repo from "../db/repositories";
import { rateLimit } from "../db/limits";
import { updateSkillOnline } from "../engine/levels";
import { localDay } from "../engine/progress";
import { hashString, mulberry32, shuffle } from "../engine/random";
import { gradeDictation, type DiffPart } from "../listening/diff";
import { analyzeTokens, buildLookupIndex, knownRankForTheta, tokenize, type LookupIndex } from "../reading/text";
import { checkAchievements, getSkills, RateLimitedError } from "./learning";
import type { Learner } from "./viewer";

/**
 * Escucha con frases reales (Tatoeba) a tu nivel, pronunciadas con la voz del
 * navegador. Tres tipos: identificar una palabra (A1), entender el significado
 * y dictado. La corrección se hace en el servidor a partir de la clave.
 */
export type ListeningKind = "spot" | "meaning" | "dictation";

export interface ListeningItem {
  key: string;
  kind: ListeningKind;
  /** Texto a pronunciar (la síntesis de voz ocurre en el navegador). */
  text: string;
  options?: string[];
}

interface Candidate {
  coverage: number;
  item: VocabItem;
  exIdx: number;
  text: string;
  es: string;
  theta: number;
  wordIds: string[];
}

const indexes = new Map<string, LookupIndex>();
export function lookup(lang: string): LookupIndex {
  let idx = indexes.get(lang);
  if (!idx) indexes.set(lang, (idx = buildLookupIndex(lang, vocabFor(lang))));
  return idx;
}

async function listeningRank(learner: Learner): Promise<number> {
  const skills = await getSkills(learner.ul.id);
  // Se entiende de oído menos de lo que se lee: el listening pesa más.
  return knownRankForTheta(skills.get("listening")!.theta * 0.6 + skills.get("vocabulary")!.theta * 0.4);
}

export function candidates(learner: Learner, rank: number, minCoverage: number, rankFactor: number): Candidate[] {
  const lang = learner.language.code;
  const idx = lookup(lang);
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const v of vocabFor(lang)) {
    if ((v.rank ?? 99999) > Math.max(rank * rankFactor, 400)) continue;
    v.examples.forEach((ex, exIdx) => {
      const es = ex.translation?.es;
      if (!es || seen.has(ex.text) || ex.text.length > 110) return;
      seen.add(ex.text);
      const tokens = tokenize(lang, ex.text, idx, learner.language.spaceSeparated);
      const words = tokens.filter((t) => t.w);
      if (words.length < 3 || words.length > (learner.language.spaceSeparated ? 12 : 22)) return;
      const a = analyzeTokens(tokens, getVocab, rank, new Set());
      if (a.coverage < minCoverage) return;
      out.push({ coverage: a.coverage, item: v, exIdx, text: ex.text, es, theta: a.theta, wordIds: words.map((w) => w.id).filter((x): x is string => Boolean(x)) });
    });
  }
  return out;
}

export async function buildListening(learner: Learner, count = 10): Promise<{ items: ListeningItem[]; locale: string }> {
  const rank = await listeningRank(learner);
  const skills = await getSkills(learner.ul.id);
  const theta = skills.get("listening")!.theta;
  const rand = mulberry32(hashString(`${learner.userId}|listen|${Date.now() >> 16}`));
  // Se relaja el filtro si hay pocas frases (idiomas con menos datos o nivel muy inicial).
  let found: Candidate[] = [];
  for (const [minCov, factor] of [[0.85, 1.5], [0.7, 2.5], [0.5, 4]] as const) {
    found = candidates(learner, rank, minCov, factor);
    if (found.length >= 25) break;
  }
  const pool = shuffle(found.sort((a, b) => b.coverage - a.coverage).slice(0, 120), rand);
  if (pool.length < 4) return { items: [], locale: learner.language.speechLocale };
  const plan: ListeningKind[] =
    theta < -1.5 ? ["spot", "spot", "meaning", "spot", "meaning", "meaning", "spot", "meaning", "dictation", "dictation"]
    : theta < 0 ? ["spot", "meaning", "meaning", "dictation", "meaning", "dictation", "spot", "meaning", "dictation", "dictation"]
    : ["meaning", "dictation", "meaning", "dictation", "dictation", "meaning", "dictation", "dictation", "meaning", "dictation"];
  const items: ListeningItem[] = [];
  const used = new Set<string>();
  for (const kind of plan.slice(0, count)) {
    const c = pool.find((p) => !used.has(p.text) && (kind !== "spot" || p.wordIds.length >= 2));
    if (!c) break;
    used.add(c.text);
    const base = `listen|${c.item.id}|${c.exIdx}`;
    if (kind === "spot") {
      // La palabra menos frecuente de la frase: la que más aporta reconocer.
      const target = [...new Set(c.wordIds)].map((id) => getVocab(id)!).sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))[0]!;
      const near = vocabFor(learner.language.code).filter((v) => v.id !== target.id && v.pos === target.pos && Math.abs((v.rank ?? 0) - (target.rank ?? 0)) < 400);
      const distractors = shuffle(near, rand).slice(0, 3).map((v) => v.lemma);
      if (distractors.length < 3) continue;
      items.push({ key: `${base}|spot|${target.id}`, kind, text: c.text, options: shuffle([target.lemma, ...distractors], rand) });
    } else if (kind === "meaning") {
      const others = shuffle(pool.filter((p) => p.text !== c.text && Math.abs(p.theta - c.theta) < 1.2), rand).slice(0, 3).map((p) => p.es);
      if (others.length < 3) continue;
      items.push({ key: `${base}|meaning`, kind, text: c.text, options: shuffle([c.es, ...others], rand) });
    } else {
      items.push({ key: `${base}|dictation`, kind, text: c.text });
    }
  }
  return { items, locale: learner.language.speechLocale };
}

export interface ListeningFeedback {
  correct: boolean;
  transcript: string;
  translation: string;
  answer?: string;
  diff?: DiffPart[];
  score?: number;
}

export async function answerListening(learner: Learner, key: string, response: string, timeMs: number): Promise<ListeningFeedback> {
  if (!(await rateLimit(`listen:${learner.userId}`, 90, 60))) throw new RateLimitedError();
  const [kindTag, itemId, exIdxRaw, kind, target] = key.split("|");
  if (kindTag !== "listen" || !itemId || !kind) throw new Error("Ejercicio desconocido");
  const item = getVocab(itemId);
  if (!item || item.language !== learner.language.code) throw new Error("Ejercicio de otro idioma");
  const ex = item.examples[Number(exIdxRaw)];
  if (!ex) throw new Error("Frase desconocida");
  const translation = ex.translation?.es ?? "";
  const clean = response.slice(0, 400);
  let fb: ListeningFeedback;
  if (kind === "spot") {
    const t = target ? getVocab(target) : undefined;
    if (!t) throw new Error("Palabra desconocida");
    fb = { correct: clean.trim() === t.lemma, transcript: ex.text, translation, answer: t.lemma };
  } else if (kind === "meaning") {
    fb = { correct: clean.trim() === translation, transcript: ex.text, translation, answer: translation };
  } else {
    const g = gradeDictation(ex.text, clean, learner.language.spaceSeparated);
    fb = { correct: g.correct, transcript: ex.text, translation, diff: g.parts, score: g.score };
  }

  // Modelo del alumno: θ de listening, intento, error clasificado y actividad.
  const idx = lookup(learner.language.code);
  const difficulty = analyzeTokens(tokenize(learner.language.code, ex.text, idx, learner.language.spaceSeparated), getVocab, 0, new Set()).theta + (kind === "dictation" ? 0.4 : kind === "spot" ? -0.6 : 0);
  const skills = await getSkills(learner.ul.id);
  await repo.upsertSkillEstimates(learner.ul.id, [updateSkillOnline(skills.get("listening")!, difficulty, fb.correct)]);
  const attemptId = await repo.insertAttempt({
    userLanguageId: learner.ul.id,
    sessionId: null,
    exerciseKey: key,
    exerciseType: `listen_${kind}`,
    skill: "listening",
    errorCategory: "listening",
    correct: fb.correct,
    nearMiss: Boolean(fb.score && fb.score > 0.6 && !fb.correct),
    response: clean,
    timeMs: Math.max(0, Math.min(timeMs, 600_000)),
    attempts: 1,
    confidence: null,
    difficulty,
  });
  if (!fb.correct) {
    await repo.insertMistakes([{ userLanguageId: learner.ul.id, sessionId: null, attemptId, source: "exercise", category: "listening", subcategory: kind, userText: clean || null, correctedText: ex.text, explanation: null }]);
  }
  await repo.bumpActivity(learner.userId, learner.language.code, localDay(new Date(), learner.profile.timezone), {
    seconds: Math.min(Math.round(timeMs / 1000), 120),
    exercises: 1,
    correct: fb.correct ? 1 : 0,
  });
  return fb;
}

export async function finishListening(learner: Learner, correct: number, total: number) {
  await repo.track(learner.userId, "listening_completed", { correct, total });
  return { newAchievements: await checkAchievements(learner) };
}
