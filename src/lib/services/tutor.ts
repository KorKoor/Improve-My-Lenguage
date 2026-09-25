import "server-only";
import { categoriesFor, errorLabel, getLanguage, vocabFor, topicLabel } from "../content";
import { thetaToCefr, overallTheta } from "../engine/levels";
import { rateLimit } from "../db/limits";
import * as repo from "../db/repositories";
import { env } from "../env";
import { aiAvailable, AiUnavailableError, generate, parseJson } from "../ai/provider";
import {
  explainMistakeSystemPrompt,
  feedbackSystemPrompt,
  openingPrompt,
  sanitizeFeedback,
  splitGoals,
  tutorSystemPrompt,
  type ConversationFeedback,
  type LearnerContext,
} from "../ai/prompts";
import { scenarioFromTopic } from "../content/scenarios";
import { catalog } from "../content";
import { resolveExercise } from "../engine/exercises";
import { checkAchievements, getSkills, getWeaknesses } from "./learning";
import type { Learner } from "./viewer";

export class AiQuotaError extends Error {}

export async function guardAi(learner: Learner) {
  if (!aiAvailable()) throw new AiUnavailableError("El tutor de IA no está configurado en este servidor.");
  if (!learner.profile.aiConsent) throw new AiUnavailableError("Activa el tutor de IA en Configuración para usarlo.");
  if (!(await rateLimit(`ai-min:${learner.userId}`, 10, 60))) throw new AiQuotaError("Vas muy rápido. Espera un momento.");
  if (!(await rateLimit(`ai-day:${learner.userId}`, env.aiDailyLimitPerUser, 86_400))) {
    throw new AiQuotaError("Has alcanzado el límite diario del tutor. Mañana se renueva; mientras tanto, las sesiones siguen disponibles.");
  }
}

export async function buildLearnerContext(learner: Learner): Promise<LearnerContext> {
  const [skills, weaknesses, knowledge, mistakes, goal] = await Promise.all([
    getSkills(learner.ul.id),
    getWeaknesses(learner.ul.id),
    repo.getAllKnowledge(learner.ul.id),
    repo.recentMistakeExamples(learner.ul.id, 8),
    repo.getActiveGoal(learner.ul.id),
  ]);
  const measured = [...skills.values()].filter((s) => s.evidence > 0);
  const overall = overallTheta(measured);
  const vocab = vocabFor(learner.language.code);
  const learning = knowledge
    .filter((k) => k.itemType === "vocab" && k.reps > 0)
    .map((k) => vocab.find((v) => v.id === k.itemId)?.lemma)
    .filter((x): x is string => !!x);
  return {
    languageName: learner.language.name.toLowerCase(),
    languageEnglishName: learner.language.englishName,
    nativeLanguageName: getLanguage(learner.native)?.name.toLowerCase() ?? "español",
    level: overall === null ? "desconocido" : thetaToCefr(overall),
    skills: measured.map((s) => ({ skill: s.skill, level: thetaToCefr(s.theta) })),
    weakAreas: weaknesses.slice(0, 4).map((w) => errorLabel(w.category)),
    recentMistakes: mistakes.filter((m) => m.userText).map((m) => ({ wrong: m.userText!, right: m.correctedText })),
    interests: learner.profile.interests.map(topicLabel),
    goal: goal ? `Reach ${goal.targetLevel}${goal.deadline ? ` by ${goal.deadline}` : ""}, ${goal.minutesPerDay} min/day` : null,
    knownWords: learning,
    explanationDepth: learner.profile.explanationDepth,
    displayName: learner.profile.displayName,
    learningStyle: learner.profile.personality
      ? {
          correction: learner.profile.personality.tuning.correction,
          challenge: learner.profile.personality.dims.challenge > 0.3,
          favors: learner.profile.personality.dims.words < -0.2 ? "main goal is conversation" : learner.profile.personality.dims.words > 0.3 ? "loves learning new vocabulary" : "balanced goals",
        }
      : null,
  };
}

/** «¿Por qué?» tras un fallo: explicación corta y personalizada (usa la cuota diaria de IA). */
export async function explainMistake(learner: Learner, key: string, response: string): Promise<string> {
  const resolved = resolveExercise(key, catalog, learner.native);
  if (!resolved) throw new Error("Ejercicio desconocido");
  const [type, id] = key.split("|");
  if (!id?.startsWith(`${learner.language.code}:`)) throw new Error("Ejercicio de otro idioma");
  await guardAi(learner);
  const ctx = await buildLearnerContext(learner);
  const text = await generate({
    tier: "fast",
    temperature: 0.3,
    maxTokens: 220,
    system: explainMistakeSystemPrompt(ctx),
    messages: [
      {
        role: "user",
        content: [
          `Exercise type: ${type}`,
          resolved.explanation ? `Hint shown to the learner: ${resolved.explanation}` : null,
          `Correct answer: ${resolved.display}`,
          `Learner answered: ${response.slice(0, 300) || "(nothing)"}`,
        ].filter(Boolean).join("\n"),
      },
    ],
  });
  return text.replace(/[*#`]/g, "").trim().slice(0, 600);
}

export async function startConversation(learner: Learner, topic: string | null) {
  await guardAi(learner);
  const ctx = await buildLearnerContext(learner);
  const conv = await repo.createConversation(learner.ul.id, topic?.slice(0, 200) ?? null);
  const opening = await generate({
    tier: "smart",
    system: tutorSystemPrompt(ctx, topic),
    messages: [{ role: "user", content: openingPrompt(ctx, topic) }],
    maxTokens: 200,
  });
  const first = splitGoals(opening);
  await repo.addMessage(learner.ul.id, conv.id, "assistant", first.text);
  await repo.track(learner.userId, "conversation_started", { topic: topic ?? null });
  return { conversationId: conv.id, message: first.text, goals: first.goals };
}

export async function sendTutorMessage(learner: Learner, conversationId: string, text: string) {
  const conv = await repo.getConversation(learner.ul.id, conversationId);
  if (!conv || conv.endedAt) throw new Error("Conversación no encontrada o terminada");
  const clean = text.trim().slice(0, 1000);
  if (!clean) throw new Error("Mensaje vacío");
  await guardAi(learner);
  await repo.addMessage(learner.ul.id, conv.id, "user", clean);
  const history = await repo.getMessages(learner.ul.id, conv.id);
  const ctx = await buildLearnerContext(learner);
  // Sólo los últimos 12 turnos: controla coste y latencia.
  const recent = history.slice(-12).map((m) => ({ role: m.role, content: m.content }));
  if (recent[0]?.role === "assistant") recent.unshift({ role: "user", content: "(conversation start)" });
  const reply = await generate({ tier: "smart", system: tutorSystemPrompt(ctx, conv.topic), messages: recent, maxTokens: 240 });
  const { text: visible, goals } = splitGoals(reply);
  await repo.addMessage(learner.ul.id, conv.id, "assistant", visible);
  if (scenarioFromTopic(conv.topic) && goals.length === 3) await repo.track(learner.userId, "scenario_completed", { scenario: conv.topic });
  return { message: visible, goals };
}

export async function endConversation(learner: Learner, conversationId: string): Promise<ConversationFeedback> {
  const conv = await repo.getConversation(learner.ul.id, conversationId);
  if (!conv) throw new Error("Conversación no encontrada");
  if (conv.endedAt && conv.feedback) return conv.feedback as ConversationFeedback;
  const history = await repo.getMessages(learner.ul.id, conv.id);
  const learnerTexts = history.filter((m) => m.role === "user").map((m) => m.content);
  if (learnerTexts.length === 0) {
    const empty: ConversationFeedback = { summary: "No hubo mensajes que analizar.", strengths: [], mistakes: [], suggestedFocus: null };
    await repo.endConversation(learner.ul.id, conv.id, empty);
    return empty;
  }
  await guardAi(learner);
  const ctx = await buildLearnerContext(learner);
  const categories = categoriesFor(learner.language.code).map((c) => ({ id: c.id, label: c.label }));
  const raw = await generate({
    tier: "smart",
    json: true,
    temperature: 0.2,
    maxTokens: 900,
    system: feedbackSystemPrompt(ctx, categories),
    messages: [{ role: "user", content: learnerTexts.map((t, i) => `[${i + 1}] ${t}`).join("\n") }],
  });
  const feedback =
    sanitizeFeedback(parseJson(raw), new Set(categories.map((c) => c.id)), learnerTexts) ?? {
      summary: "No pudimos generar el análisis esta vez, pero tu conversación quedó guardada.",
      strengths: [],
      mistakes: [],
      suggestedFocus: null,
    };
  await repo.insertMistakes(
    feedback.mistakes.map((m) => ({
      userLanguageId: learner.ul.id,
      sessionId: null,
      attemptId: null,
      source: "tutor" as const,
      category: m.category,
      subcategory: null,
      userText: m.userText,
      correctedText: m.correction,
      explanation: m.explanation,
    })),
  );
  await repo.endConversation(learner.ul.id, conv.id, feedback);
  // Hablar con el tutor cuenta como práctica oral (evidencia débil de speaking).
  const skills = await getSkills(learner.ul.id);
  const sp = skills.get("speaking")!;
  const ratio = feedback.mistakes.length / Math.max(1, learnerTexts.length);
  await repo.upsertSkillEstimates(learner.ul.id, [
    { ...sp, theta: Math.max(-4, Math.min(4, sp.theta + (ratio < 0.3 ? 0.08 : ratio > 0.8 ? -0.08 : 0))), evidence: sp.evidence + 1 },
  ]);
  await checkAchievements(learner);
  return feedback;
}
