import "server-only";
import { getVocab } from "../content";
import * as repo from "../db/repositories";
import { rateLimit } from "../db/limits";
import { updateSkillOnline } from "../engine/levels";
import { localDay } from "../engine/progress";
import { hashString, mulberry32, shuffle } from "../engine/random";
import { gradeDictation, type DiffPart } from "../listening/diff";
import { analyzeTokens, knownRankForTheta, tokenize } from "../reading/text";
import { checkAchievements, getSkills, RateLimitedError } from "./learning";
import { candidates, lookup } from "./listening";
import type { Learner } from "./viewer";

/**
 * Pronunciación: lees en voz alta frases reales de tu nivel y el
 * reconocimiento de voz del navegador transcribe lo que dijiste. Comparamos
 * la transcripción con la frase palabra por palabra (en el servidor).
 * No se graba ni se guarda audio: sólo llega el texto reconocido.
 */
export interface SpeakingItem {
  key: string;
  text: string;
  translation: string;
}

export async function buildSpeaking(learner: Learner, count = 8): Promise<{ items: SpeakingItem[]; locale: string }> {
  const skills = await getSkills(learner.ul.id);
  // Se pronuncia bien antes lo que ya se entiende: frases algo más fáciles que tu lectura.
  const rank = knownRankForTheta(Math.min(skills.get("vocabulary")!.theta, skills.get("pronunciation")!.theta + 0.5) - 0.3);
  let found: ReturnType<typeof candidates> = [];
  for (const [minCov, factor] of [[0.9, 1.2], [0.75, 2], [0.5, 4]] as const) {
    found = candidates(learner, rank, minCov, factor).filter((c) => {
      const n = learner.language.spaceSeparated ? c.text.split(/\s+/).length : [...c.text].length;
      return learner.language.spaceSeparated ? n >= 3 && n <= 9 : n >= 4 && n <= 16;
    });
    if (found.length >= 20) break;
  }
  const rand = mulberry32(hashString(`${learner.userId}|speak|${Date.now() >> 16}`));
  const items = shuffle(found, rand)
    .slice(0, count)
    .sort((a, b) => a.text.length - b.text.length)
    .map((c) => ({ key: `speak|${c.item.id}|${c.exIdx}`, text: c.text, translation: c.es }));
  return { items, locale: learner.language.speechLocale };
}

export interface SpeakingFeedback {
  correct: boolean;
  score: number;
  heard: string;
  diff: DiffPart[];
  tip: string;
}

/** Evalúa las alternativas del reconocedor y se queda con la mejor. */
export async function answerSpeaking(learner: Learner, key: string, alternatives: string[], timeMs: number): Promise<SpeakingFeedback> {
  if (!(await rateLimit(`speak:${learner.userId}`, 90, 60))) throw new RateLimitedError();
  const [tag, itemId, exIdxRaw] = key.split("|");
  if (tag !== "speak" || !itemId) throw new Error("Ejercicio desconocido");
  const item = getVocab(itemId);
  if (!item || item.language !== learner.language.code) throw new Error("Ejercicio de otro idioma");
  const ex = item.examples[Number(exIdxRaw)];
  if (!ex) throw new Error("Frase desconocida");

  const alts = alternatives.map((a) => a.slice(0, 300)).filter(Boolean).slice(0, 5);
  let best = { heard: "", ...gradeDictation(ex.text, "", learner.language.spaceSeparated) };
  for (const a of alts) {
    const g = gradeDictation(ex.text, a, learner.language.spaceSeparated);
    if (g.score > best.score) best = { heard: a, ...g };
  }
  const score = best.score;
  const correct = score >= 0.8;
  const missing = best.parts.filter((p) => p.kind === "missing").map((p) => p.text);
  const tip =
    alts.length === 0 ? "No te oímos. Acerca el micrófono y habla con calma."
    : correct && score === 1 ? "¡Pronunciación clarísima!"
    : correct ? "¡Muy bien! Casi perfecto."
    : missing.length ? `Revisa: ${missing.slice(0, 3).map((m) => `«${m}»`).join(", ")}. Escucha el modelo y repite más despacio.`
    : "Escucha el modelo y repite imitando el ritmo.";

  const idx = lookup(learner.language.code);
  const difficulty = analyzeTokens(tokenize(learner.language.code, ex.text, idx, learner.language.spaceSeparated), getVocab, 0, new Set()).theta;
  const skills = await getSkills(learner.ul.id);
  await repo.upsertSkillEstimates(learner.ul.id, [updateSkillOnline(skills.get("pronunciation")!, difficulty, correct)]);
  await repo.insertAttempt({
    userLanguageId: learner.ul.id,
    sessionId: null,
    exerciseKey: key,
    exerciseType: "speak_read_aloud",
    skill: "pronunciation",
    errorCategory: "pronunciation",
    correct,
    nearMiss: !correct && score >= 0.6,
    response: best.heard,
    timeMs: Math.max(0, Math.min(timeMs, 600_000)),
    attempts: 1,
    confidence: null,
    difficulty,
  });
  await repo.bumpActivity(learner.userId, learner.language.code, localDay(new Date(), learner.profile.timezone), {
    seconds: Math.min(Math.round(timeMs / 1000), 90),
    exercises: 1,
    correct: correct ? 1 : 0,
  });
  return { correct, score, heard: best.heard, diff: best.parts, tip };
}

export async function finishSpeaking(learner: Learner, correct: number, total: number) {
  await repo.track(learner.userId, "speaking_completed", { correct, total });
  return { newAchievements: await checkAchievements(learner) };
}
