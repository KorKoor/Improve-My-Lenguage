import "server-only";
import { catalog, errorLabel, grammarFor, grammarForCategory } from "../content";
import type { Skill } from "../content/types";
import { ACHIEVEMENT_RULES, newlyUnlocked } from "../engine/achievements";
import { evaluateChoice, evaluateText, type EvaluationResult } from "../engine/evaluate";
import { canonicalMatchResponse, resolveExercise } from "../engine/exercises";
import { Fsrs, newCard, ratingFromOutcome, targetRetention, type CardMemory } from "../engine/fsrs";
import { defaultEstimate, overallTheta, thetaToCefr, updateSkillOnline, type SkillEstimate } from "../engine/levels";
import { planSession, type SessionPlan } from "../engine/planner";
import { computeStreak, localDay, summarizeVocabulary } from "../engine/progress";
import { buildSessionSteps, sessionSeed, wordCard, type SessionStep } from "../engine/session-builder";
import { gradeDictation } from "../listening/diff";
import { isLeech } from "../engine/insights";
import { detectWeaknesses, type Weakness } from "../engine/weakness";
import { polyglotDays } from "../engine/multilang";
import { calibrationStep } from "../engine/calibration";
import { buildCourse, lessonPassed, lessonSteps, type Lesson } from "../engine/course";
import { storiesFor } from "../content/stories";
import * as repo from "../db/repositories";
import { rateLimit } from "../db/limits";
import type { KnowledgeDbRow } from "../db/types";
import { aiAvailable } from "../ai/provider";
import type { Learner } from "./viewer";

// Un planificador FSRS por retención objetivo (se reutilizan: sólo hay unas pocas).
const schedulers = new Map<number, Fsrs>();
function fsrsFor(learner: Learner): Fsrs {
  const r = targetRetention({ challenge: learner.profile.personality?.dims.challenge, dailyMinutes: learner.profile.dailyMinutes });
  let f = schedulers.get(r);
  if (!f) schedulers.set(r, (f = new Fsrs({ requestRetention: r })));
  return f;
}
const DAY = 86_400_000;

export function knowledgeToCard(k: KnowledgeDbRow | undefined, now: Date): CardMemory {
  if (!k || k.reps === 0) return newCard(now);
  return {
    stability: k.stability,
    difficulty: k.difficulty,
    reps: k.reps,
    lapses: k.lapses,
    state: k.state,
    lastReview: k.lastReviewAt,
    due: k.dueAt,
  };
}

// Sin datos se asume principiante (A1 alto): mejor subir rápido que abrumar.
export async function getSkills(ulId: string, fallbackTheta = -2.4): Promise<Map<Skill, SkillEstimate>> {
  const rows = await repo.getSkillEstimates(ulId);
  const map = new Map<Skill, SkillEstimate>();
  for (const r of rows) map.set(r.skill, r);
  for (const s of ["vocabulary", "grammar", "reading", "listening", "writing", "speaking", "pronunciation"] as Skill[]) {
    if (!map.has(s)) map.set(s, defaultEstimate(s, fallbackTheta));
  }
  return map;
}

/**
 * «Esto es muy difícil»: baja el nivel estimado de todas las habilidades
 * (sin bajar de A1) para que los próximos ejercicios sean de reconocimiento.
 */
export async function lowerLevel(learner: Learner, delta = 0.8): Promise<void> {
  const skills = await getSkills(learner.ul.id);
  await repo.upsertSkillEstimates(
    learner.ul.id,
    [...skills.values()].map((s) => ({ ...s, theta: Math.max(-3.2, s.theta - delta), se: Math.max(s.se, 0.6) })),
  );
  await repo.track(learner.userId, "level_lowered", { language: learner.language.code, delta });
}

export async function getWeaknesses(ulId: string, now = new Date()): Promise<Weakness[]> {
  const since = new Date(now.getTime() - 28 * DAY);
  const [mistakes, stats, sessions] = await Promise.all([
    repo.recentMistakes(ulId, since),
    repo.attemptStatsByCategory(ulId, since),
    repo.recentSessionIds(ulId, 6),
  ]);
  // "vocabulary" genérico no es una debilidad accionable a nivel de gramática.
  return detectWeaknesses(mistakes, stats, sessions, now).filter((w) => w.category !== "vocabulary");
}

export type SessionFocus = "new_words" | "listening" | "review" | "leeches" | `grammar:${string}` | `lesson:${number}` | null;

export interface BuiltSession {
  sessionId: string;
  plan: SessionPlan;
  steps: SessionStep[];
}

/** Planifica y construye una sesión completa para el alumno. */
export async function startSession(
  learner: Learner,
  minutes: number,
  opts: { focus?: SessionFocus; surprise?: boolean } = {},
): Promise<BuiltSession> {
  const now = new Date();
  const ulId = learner.ul.id;
  const [skills, weaknesses, knowledge, dueCount] = await Promise.all([
    getSkills(ulId),
    getWeaknesses(ulId, now),
    repo.getAllKnowledge(ulId),
    repo.countDue(ulId, now),
  ]);
  let due = await repo.getDueKnowledge(ulId, now, 40);
  // Palabras rebeldes: se reaprenden (ficha + ejercicios) aunque no toque repasarlas.
  const leeches =
    opts.focus === "leeches"
      ? knowledge
          .filter((k) => k.itemType === "vocab" && k.reps > 0 && isLeech({ lapses: k.lapses, incorrect: k.incorrectCount, correct: k.correctCount }))
          .sort((a, b) => b.lapses + b.incorrectCount - (a.lapses + a.incorrectCount))
          .slice(0, 10)
      : [];
  if (leeches.length) due = leeches;
  const vocabTotal = catalog.vocab(learner.language.code).length;
  const seenIds = new Set(knowledge.filter((k) => k.reps > 0).map((k) => k.itemId));

  let plan: SessionPlan;
  const focus = opts.focus ?? null;
  if (focus === "leeches" && leeches.length) {
    plan = { totalMinutes: minutes, blocks: [{ kind: "review", minutes, reason: "Reaprendemos las palabras que más se te resisten: primero la ficha con un ejemplo, luego práctica." }] };
  } else if (focus === "review" || focus === "leeches") {
    plan = { totalMinutes: minutes, blocks: [{ kind: "review", minutes, reason: "Repaso de los elementos que están a punto de olvidarse." }] };
  } else if (focus === "new_words") {
    plan = { totalMinutes: minutes, blocks: [{ kind: "new_words", minutes, reason: "Vocabulario nuevo adaptado a tu nivel e intereses." }] };
  } else if (focus === "listening") {
    plan = { totalMinutes: minutes, blocks: [{ kind: "listening", minutes, reason: "Práctica de comprensión auditiva con dictados." }] };
  } else if (focus?.startsWith("grammar:")) {
    plan = { totalMinutes: minutes, blocks: [{ kind: "grammar", minutes, reason: "Práctica enfocada en este tema.", target: focus.slice(8) }] };
  } else {
    plan = planSession({
      minutes,
      dueReviews: dueCount,
      newWordsAvailable: vocabTotal - seenIds.size,
      weaknesses,
      weaknessLabel: errorLabel,
      grammarForCategory,
      skills: [...skills.values()],
      aiAvailable: aiAvailable() && learner.profile.aiConsent,
      audioAvailable: true,
      difficulty: learner.profile.preferredDifficulty,
      styleWeights: learner.profile.personality?.tuning.blockWeights,
      surprise: opts.surprise,
      seed: now.getTime() % 100000,
    });
  }

  const day = localDay(now, learner.profile.timezone);
  // Camino guiado: la lección fija sustituye a la sesión planificada.
  if (focus?.startsWith("lesson:")) {
    const course = courseFor(learner);
    const n = Math.max(1, Math.min(course.length, Number(focus.slice(7)) || 1));
    const lesson = course[n - 1]!;
    const lessonPlan: SessionPlan & { lesson: number } = { totalMinutes: 10, blocks: [{ kind: "new_words", minutes: 10, reason: lesson.goal }], lesson: n };
    const steps = lessonSteps(lesson, course[n - 2] ?? null, learner.language.code, learner.native, catalog, grammarFor(learner.language.code), sessionSeed(ulId, day, `lesson-${n}`));
    const session = await repo.createSession(ulId, "focus", 10, lessonPlan);
    await repo.track(learner.userId, "lesson_started", { lesson: n, language: learner.language.code });
    return { sessionId: session.id, plan: lessonPlan, steps };
  }
  const steps = buildSessionSteps({
    plan,
    language: learner.language.code,
    native: learner.native,
    catalog,
    grammar: grammarFor(learner.language.code),
    knowledge,
    due,
    // A quien le gusta el reto, palabras nuevas un poco más altas (±0.3 logits).
    vocabTheta: skills.get("vocabulary")!.theta + (learner.profile.personality?.dims.challenge ?? 0) * 0.3,
    grammarTheta: skills.get("grammar")!.theta,
    listeningTheta: skills.get("listening")?.theta,
    interests: learner.profile.interests,
    seed: sessionSeed(ulId, day, opts.surprise ? String(now.getTime()) : String(knowledge.length)),
    style: learner.profile.personality ? { ear: learner.profile.personality.dims.ear, challenge: learner.profile.personality.dims.challenge } : undefined,
  });

  // Palabras rebeldes: su ficha va delante, como si fueran nuevas.
  if (leeches.length) {
    const intros = leeches
      .map((k) => catalog.vocabById(k.itemId))
      .filter((v): v is NonNullable<typeof v> => Boolean(v))
      .map((v) => ({ kind: "intro" as const, block: "review" as const, word: wordCard(v, learner.native) }));
    steps.unshift(...intros);
  }

  const kind = focus === "review" ? "review" : focus ? "focus" : opts.surprise ? "surprise" : "daily";
  const session = await repo.createSession(ulId, kind, plan.totalMinutes, plan);
  await repo.track(learner.userId, "session_started", { kind, minutes: plan.totalMinutes, steps: steps.length });
  return { sessionId: session.id, plan, steps };
}

export interface AnswerInput {
  sessionId: string | null;
  key: string;
  response: string;
  /** Para emparejar: { lema: traducción } */
  pairs?: Record<string, string>;
  timeMs: number;
  attempts: number;
  confidence?: number;
}

export interface AnswerFeedback {
  /** Para "¿Lo sabías con seguridad?" (sólo aciertos). */
  attemptId?: string;
  correct: boolean;
  nearMiss: boolean;
  note?: EvaluationResult["note"];
  expected: string;
  explanation?: string;
  errorLabel?: string;
}

export class RateLimitedError extends Error {}

/**
 * Evalúa en el servidor y actualiza TODO el modelo del alumno:
 * memoria FSRS de cada ítem, θ de la habilidad, historial de errores,
 * contadores de sesión y actividad diaria.
 */
export async function submitAnswer(learner: Learner, input: AnswerInput): Promise<AnswerFeedback> {
  if (!(await rateLimit(`answer:${learner.userId}`, 90, 60))) throw new RateLimitedError();
  const now = new Date();
  const ulId = learner.ul.id;
  const lang = learner.language.code;

  const resolved = resolveExercise(input.key, catalog, learner.native);
  if (!resolved) throw new Error("Ejercicio desconocido");
  const [type, idPart] = input.key.split("|") as [string, string];
  const itemIds = type === "match" ? idPart.split(",") : [idPart];
  if (!itemIds.every((id) => id.startsWith(`${lang}:`))) throw new Error("El ejercicio no pertenece al idioma activo");

  let sessionId: string | null = null;
  if (input.sessionId) {
    const s = await repo.getSession(ulId, input.sessionId);
    sessionId = s ? s.id : null;
  }

  const response = input.response.slice(0, 500);
  let result: EvaluationResult;
  if (resolved.mode === "match") {
    result = evaluateChoice(canonicalMatchResponse(input.pairs ?? {}), resolved.accepted[0]!);
  } else if (resolved.mode === "speech") {
    const g = gradeDictation(resolved.accepted[0]!, response, learner.language.spaceSeparated);
    result = { correct: g.score >= 0.8, nearMiss: g.score >= 0.6 && g.score < 0.8 };
  } else if (resolved.mode === "choice") {
    result = resolved.accepted.map((a) => evaluateChoice(response, a)).find((r) => r.correct) ?? { correct: false, nearMiss: false };
  } else {
    result = evaluateText(response, resolved.accepted, lang, { typos: resolved.typos });
  }

  const timeMs = Math.max(0, Math.min(input.timeMs, 10 * 60_000));
  const skill: Skill =
    type === "dictation" || type === "listen_mc" || type === "listen_pick" || type === "dictation_word" || type === "phrase_listen" ? "listening"
    : type === "speak" ? "pronunciation"
    : type === "grammar" || type === "rearrange" || type === "conjugate" ? "grammar"
    : "vocabulary";

  // 1. Memoria FSRS por ítem
  const expectedMs = { match: 20000, dictation: 25000, rearrange: 20000, grammar: 15000, recall: 10000, cloze: 12000, conjugate: 12000, speak: 20000, listen_mc: 9000, listen_pick: 9000, dictation_word: 14000 }[type] ?? 7000;
  const rating = ratingFromOutcome({
    correct: result.correct,
    nearMiss: result.nearMiss,
    timeMs,
    expectedMs,
    attempts: Math.max(1, input.attempts),
    confidence: input.confidence,
  });
  const existing = await repo.getKnowledge(ulId, itemIds);
  const byId = new Map(existing.map((k) => [k.itemId, k]));
  const previousKnowledge = itemIds.map((id) => byId.get(id) ?? null);
  // Las frases de «Primeros pasos» no llevan tarjeta de repaso propia (no inflan los pendientes).
  const tracked = type.startsWith("phrase_") ? [] : itemIds;
  for (const itemId of tracked) {
    const prev = byId.get(itemId);
    const card = fsrsFor(learner).review(knowledgeToCard(prev, now), rating, now);
    const exposures = (prev?.exposureCount ?? 0) + 1;
    await repo.saveKnowledge({
      userLanguageId: ulId,
      itemId,
      itemType: type === "grammar" ? "grammar" : "vocab",
      status: prev?.status === "known" ? "known" : !result.correct && (prev?.lapses ?? 0) >= 2 ? "difficult" : prev?.status === "difficult" && result.correct ? "learning" : prev?.status ?? "learning",
      stability: card.stability,
      difficulty: card.difficulty,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      dueAt: card.due,
      lastReviewAt: card.lastReview,
      exposureCount: exposures,
      correctCount: (prev?.correctCount ?? 0) + (result.correct ? 1 : 0),
      incorrectCount: (prev?.incorrectCount ?? 0) + (result.correct ? 0 : 1),
      avgResponseMs: Math.round(((prev?.avgResponseMs ?? timeMs) * (exposures - 1) + timeMs) / exposures),
    });
  }

  // 2. Estimación de habilidad (θ)
  const skills = await getSkills(ulId);
  const difficulty = difficultyOfKey(input.key);
  const updated = updateSkillOnline(skills.get(skill)!, difficulty, result.correct);
  await repo.upsertSkillEstimates(ulId, [updated]);

  // 3. Intento + error clasificado
  const attemptId = await repo.insertAttempt({
    userLanguageId: ulId,
    sessionId,
    exerciseKey: input.key,
    exerciseType: type,
    skill,
    errorCategory: resolved.errorCategory,
    correct: result.correct,
    nearMiss: result.nearMiss,
    response,
    timeMs,
    attempts: Math.max(1, input.attempts),
    confidence: input.confidence ?? null,
    difficulty,
    previousKnowledge: result.correct ? previousKnowledge : undefined,
  });
  // «No lo sé» (respuesta vacía) no es un patrón de error: no se registra como fallo tipificado.
  const gaveUp = !response.trim() && resolved.mode !== "match";
  if (!result.correct && !gaveUp) {
    await repo.insertMistakes([
      {
        userLanguageId: ulId,
        sessionId,
        attemptId,
        source: "exercise",
        category: resolved.errorCategory,
        subcategory: type,
        userText: response || null,
        correctedText: resolved.display,
        explanation: resolved.explanation ?? null,
      },
    ]);
  }

  // 4. Contadores
  if (sessionId) await repo.bumpSession(ulId, sessionId, result.correct);
  await repo.bumpActivity(learner.userId, lang, localDay(now, learner.profile.timezone), {
    seconds: Math.min(Math.round(timeMs / 1000), 120),
    exercises: 1,
    correct: result.correct ? 1 : 0,
    wordsReviewed: type === "grammar" ? 0 : itemIds.length,
  });

  return {
    attemptId,
    correct: result.correct,
    nearMiss: result.nearMiss,
    note: result.note,
    expected: resolved.display,
    explanation: resolved.explanation,
    errorLabel: result.correct || gaveUp ? undefined : errorLabel(resolved.errorCategory),
  };
}

/** Dificultad θ aproximada de un ejercicio a partir de su key (sin confiar en el cliente). */
function difficultyOfKey(key: string): number {
  const [type, id] = key.split("|") as [string, string];
  const CEFR: Record<string, number> = { A1: -2.5, A2: -1.5, B1: -0.5, B2: 0.5, C1: 1.5, C2: 2.5 };
  if (type === "grammar") return CEFR[catalog.grammarById(id)?.cefr ?? "B1"] ?? 0;
  if (type.startsWith("phrase_")) return -2.8;
  if (type === "match") {
    const items = id.split(",").map((i) => catalog.vocabById(i)).filter(Boolean);
    return items.reduce((a, v) => a + (CEFR[v!.cefr] ?? 0), 0) / Math.max(1, items.length) - 0.5;
  }
  const v = catalog.vocabById(id);
  const offset: Record<string, number> = { meaning_mc: -0.6, reverse_mc: -0.3, recall: 0.3, cloze: 0.1, rearrange: 0.2, dictation: 0.5 };
  return (CEFR[v?.cefr ?? "B1"] ?? 0) + (offset[type] ?? 0);
}

/**
 * "¿Lo sabías con seguridad?" tras un acierto. Si el alumno adivinó, el
 * repaso se recalcula desde el estado previo con calificación "Hard": la
 * palabra volverá antes. Sólo sobre aciertos recientes (≤ 15 min) y una vez.
 */
export async function reviseConfidence(learner: Learner, attemptId: string, guessed: boolean): Promise<void> {
  const ulId = learner.ul.id;
  const attempt = await repo.getAttempt(ulId, attemptId);
  if (!attempt || !attempt.correct || attempt.confidence !== null) return;
  if (Date.now() - attempt.createdAt.getTime() > 15 * 60_000) return;
  await repo.setAttemptConfidence(ulId, attemptId, guessed ? 0.2 : 1);
  if (!guessed || !attempt.previousKnowledge) return;

  const [type, idPart] = attempt.exerciseKey.split("|") as [string, string];
  const itemIds = type === "match" ? idPart.split(",") : [idPart];
  const current = new Map((await repo.getKnowledge(ulId, itemIds)).map((k) => [k.itemId, k]));
  const at = attempt.createdAt;
  for (const [i, itemId] of itemIds.entries()) {
    const prev = attempt.previousKnowledge[i] ?? undefined;
    const now = current.get(itemId);
    if (!now) continue;
    const card = fsrsFor(learner).review(knowledgeToCard(prev, at), 2, at);
    await repo.saveKnowledge({
      ...now,
      stability: card.stability,
      difficulty: card.difficulty,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      dueAt: card.due,
      lastReviewAt: card.lastReview,
    });
  }
  await repo.track(learner.userId, "answer_guessed", { key: attempt.exerciseKey });
}

export interface SessionSummary {
  total: number;
  correct: number;
  minutes: number;
  newAchievements: { id: string; title: string; icon: string }[];
  /** Lección del Camino guiado (si la sesión era una lección). */
  lesson?: { n: number; passed: boolean; stars: number; next: number | null; title: string | null; storyId: string | null };
  /** Si el nivel se ajustó con esta sesión (primeras sesiones de un idioma). */
  levelAdjusted?: { direction: "down" | "up"; level: string; reason: string };
}

export async function finishSession(
  learner: Learner,
  sessionId: string,
  durationSeconds: number,
  focus?: { onsetMin: number | null; breaks: number },
): Promise<SessionSummary | null> {
  const s = await repo.completeSession(learner.ul.id, sessionId, Math.max(0, Math.min(durationSeconds, 4 * 3600)));
  if (!s) return null;
  // Historial de atención: alimenta el temporizador inteligente (sólo sesiones con datos suficientes).
  if (focus && s.exercisesCount >= 8) {
    const durationMin = Math.round(s.durationSeconds / 60);
    await repo.pushFocusHistory(learner.userId, {
      onsetMin: focus.onsetMin !== null && focus.onsetMin <= durationMin + 1 ? focus.onsetMin : null,
      durationMin,
      breaks: focus.breaks,
      at: new Date().toISOString(),
    });
  }
  await repo.bumpActivity(learner.userId, learner.language.code, localDay(new Date(), learner.profile.timezone), { sessions: 1 });
  await repo.track(learner.userId, "session_completed", { exercises: s.exercisesCount, correct: s.correctCount });
  // Recalibración: las primeras sesiones corrigen un diagnóstico demasiado alto o bajo.
  let levelAdjusted: SessionSummary["levelAdjusted"];
  const cal = calibrationStep({ sessionNumber: await repo.countCompletedSessions(learner.ul.id), total: s.exercisesCount, correct: s.correctCount });
  if (cal && (await repo.claimCalibration(learner.ul.id, sessionId))) {
    const skills = await getSkills(learner.ul.id);
    const moved = [...skills.values()].map((k) => ({ ...k, theta: Math.max(-3.2, Math.min(3, k.theta + cal.delta)), se: Math.max(k.se, 0.5) }));
    await repo.upsertSkillEstimates(learner.ul.id, moved);
    const measured = moved.filter((k) => k.evidence > 0);
    const overall = overallTheta(measured.length ? measured : moved);
    levelAdjusted = { direction: cal.delta < 0 ? "down" : "up", level: overall === null ? "A1" : thetaToCefr(overall), reason: cal.reason };
    await repo.track(learner.userId, "level_recalibrated", { delta: cal.delta, language: learner.language.code });
  }
  // Lección del Camino guiado: se aprueba con ≥ 60 % de aciertos.
  let lesson: SessionSummary["lesson"];
  const planLesson = (s.plan as { lesson?: number } | null)?.lesson;
  if (typeof planLesson === "number") {
    const passed = lessonPassed(s.correctCount, s.exercisesCount);
    const acc = s.exercisesCount ? s.correctCount / s.exercisesCount : 0;
    const stars = !passed ? 0 : acc >= 0.9 ? 3 : acc >= 0.75 ? 2 : 1;
    if (passed) await repo.saveCourseLesson(learner.ul.id, planLesson, stars);
    const course = courseFor(learner);
    const next = passed && planLesson < course.length ? course[planLesson]! : null;
    lesson = { n: planLesson, passed, stars, next: next?.n ?? null, title: next?.title ?? null, storyId: course[planLesson - 1]?.storyId ?? null };
    await repo.track(learner.userId, passed ? "lesson_passed" : "lesson_failed", { lesson: planLesson, language: learner.language.code });
  }
  const newAchievements = await checkAchievements(learner);
  return {
    total: s.exercisesCount,
    correct: s.correctCount,
    minutes: Math.round(s.durationSeconds / 60),
    newAchievements,
    levelAdjusted,
    lesson,
  };
}

export async function checkAchievements(learner: Learner) {
  const now = new Date();
  const [unlocked, sessions, days, exercises, conversations, assessments, languages, knowledge] = await Promise.all([
    repo.getUnlockedAchievements(learner.userId),
    repo.sessionCounts(learner.userId),
    repo.allActiveDays(learner.userId),
    repo.totalExercises(learner.userId),
    repo.countConversations(learner.userId),
    repo.countCompletedAssessments(learner.userId),
    repo.listUserLanguages(learner.userId),
    repo.getAllKnowledge(learner.ul.id),
  ]);
  const [readings, writings, listening, speaking, scenarios, verbDrills, questsClaimed, studyPlans, breaksCompleted, langActivity] = await Promise.all([
    repo.countReadings(learner.userId),
    repo.countWritings(learner.userId),
    repo.countEvents(learner.userId, "listening_completed"),
    repo.countEvents(learner.userId, "speaking_completed"),
    repo.countEvents(learner.userId, "scenario_completed"),
    repo.countEvents(learner.userId, "verbs_completed"),
    repo.countEvents(learner.userId, "quest_claimed"),
    repo.countEvents(learner.userId, "study_plan_completed"),
    repo.countEvents(learner.userId, "break_completed"),
    languages.length > 1 ? repo.getActivityByLanguage(learner.userId, "2000-01-01") : Promise.resolve([]),
  ]);
  const vocab = summarizeVocabulary(
    knowledge.map((k) => ({ ...knowledgeToCard(k, now), itemId: k.itemId, itemType: k.itemType })),
    now,
  );
  const fresh = newlyUnlocked(
    {
      sessionsCompleted: sessions.completed,
      wordsLearned: vocab.learned,
      currentStreak: computeStreak([...days, ...learner.profile.frozenDays], localDay(now, learner.profile.timezone)),
      exercisesCompleted: exercises,
      conversations,
      minutesStudied: sessions.minutes,
      assessmentsCompleted: assessments,
      languagesStarted: languages.length,
      readingsCompleted: readings,
      writingsCompleted: writings,
      listeningSessions: listening,
      speakingSessions: speaking,
      scenariosCompleted: scenarios,
      verbDrills,
      questsClaimed,
      inGroup: Boolean(learner.profile.groupId),
      personalityDone: Boolean(learner.profile.personality),
      polyglotDays: polyglotDays(langActivity).length,
      studyPlans,
      breaksCompleted,
    },
    new Set(unlocked.map((u) => u.achievementId)),
  );
  await repo.unlockAchievements(learner.userId, fresh.map((f) => f.id));
  return fresh.map((f) => ({ id: f.id, title: f.title, icon: f.icon }));
}

export { ACHIEVEMENT_RULES };

/** Camino guiado del idioma activo (determinista: se calcula, no se guarda). */
const courses = new Map<string, Lesson[]>();
export function courseFor(learner: Pick<Learner, "language" | "native">): Lesson[] {
  const key = `${learner.language.code}|${learner.native}`;
  let c = courses.get(key);
  if (!c) {
    c = buildCourse(learner.language.code, catalog.vocab(learner.language.code), grammarFor(learner.language.code), learner.native, storiesFor(learner.language.code).filter((s) => s.level === "A1" || s.level === "A2").map((s) => s.id));
    courses.set(key, c);
  }
  return c;
}
