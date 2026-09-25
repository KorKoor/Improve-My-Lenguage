"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLanguage, getVocab, TOPICS } from "@/lib/content";
import { CEFR_LEVELS, type CefrLevel } from "@/lib/content/types";
import * as repo from "@/lib/db/repositories";
import { rateLimit } from "@/lib/db/limits";
import { AiUnavailableError } from "@/lib/ai/provider";
import { answerAssessment, startFromZero, startOrResumeAssessment, type AssessmentStep } from "@/lib/services/assessment";
import { deleteAccount } from "@/lib/services/account";
import { finishSession, lowerLevel, RateLimitedError, reviseConfidence, startSession, submitAnswer, type AnswerFeedback, type BuiltSession, type SessionFocus, type SessionSummary } from "@/lib/services/learning";
import { AiQuotaError, endConversation, explainMistake, sendTutorMessage, startConversation } from "@/lib/services/tutor";
import type { ConversationFeedback } from "@/lib/ai/prompts";
import { requireLearner, requireViewer } from "@/lib/services/viewer";
import { logError } from "@/lib/log";

/**
 * Server Actions: la única superficie de escritura de la app.
 * Todas validan la entrada en el servidor, requieren sesión y devuelven
 * resultados tipados (nunca errores 500 crudos al usuario).
 */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(name: string, fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    // redirect()/notFound() lanzan errores de control que deben propagarse.
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    if (err instanceof RateLimitedError) return { ok: false, error: "Vas muy rápido. Espera unos segundos." };
    if (err instanceof AiUnavailableError || err instanceof AiQuotaError) return { ok: false, error: err.message };
    logError(`action:${name}`, err);
    return { ok: false, error: "Algo salió mal. Tu progreso está a salvo; inténtalo de nuevo." };
  }
}

const str = (v: unknown, max = 200): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown, min: number, max: number, def: number): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : def;
};
const oneOf = <T extends string>(v: unknown, opts: readonly T[], def: T): T => (opts.includes(v as T) ? (v as T) : def);
const isLevel = (v: unknown): v is CefrLevel => CEFR_LEVELS.includes(v as CefrLevel);

// ── Onboarding ─────────────────────────────────────────────────────────────
export interface OnboardingInput {
  displayName: string;
  nativeLanguage: string;
  language: string;
  selfLevel: CefrLevel | "unknown";
  targetLevel: CefrLevel;
  months: number;
  reason: string;
  dailyMinutes: number;
  interests: string[];
  explanationDepth: "brief" | "balanced" | "detailed";
  preferredDifficulty: "easy" | "balanced" | "challenging";
  competitive: boolean;
  interactionPrefs: string[];
  aiConsent: boolean;
  privacyAccepted: boolean;
  timezone: string;
  /** "simple": letra grande, audio lento, explicaciones detalladas y un inicio con una sola acción. */
  experience?: "standard" | "simple";
  textSize?: "normal" | "large" | "xl";
  /** Añadiendo otro idioma: los minutos son para ese idioma (se suman al total diario). */
  adding?: boolean;
  /** Papel del idioma nuevo en el reparto de tiempo. */
  priority?: "main" | "active" | "maintain";
}

export async function saveOnboarding(input: OnboardingInput): Promise<ActionResult<{ next: string }>> {
  return run("onboarding", async () => {
    const viewer = await requireViewer();
    const lang = getLanguage(str(input.language, 8));
    if (!lang || lang.status === "planned") throw new Error("Idioma no disponible");
    if (!input.privacyAccepted) throw new Error("Falta aceptar el aviso de privacidad");
    const topics = new Set(TOPICS.map((t) => t.id));
    let tz = str(input.timezone, 64) || "America/Mexico_City";
    try {
      new Intl.DateTimeFormat("en", { timeZone: tz });
    } catch {
      tz = "America/Mexico_City";
    }
    const existed = Boolean(await repo.getUserLanguage(viewer.userId, lang.code));
    const ul = await repo.upsertUserLanguage(viewer.userId, lang.code, isLevel(input.selfLevel) ? input.selfLevel : null);
    const adding = Boolean(input.adding) && Boolean(viewer.profile.onboardedAt);
    const months = int(input.months, 1, 36, 6);
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + months);
    const minutes = int(input.dailyMinutes, 5, 120, 15);
    await repo.setGoal(ul.id, {
      targetLevel: isLevel(input.targetLevel) ? input.targetLevel : "B2",
      deadline: deadline.toISOString().slice(0, 10),
      minutesPerDay: minutes,
      reason: str(input.reason, 200) || null,
    });
    await repo.updateProfile(viewer.userId, {
      displayName: str(input.displayName, 60) || viewer.profile.displayName,
      nativeLanguage: getLanguage(str(input.nativeLanguage, 8)) ? str(input.nativeLanguage, 8) : "es",
      activeLanguage: lang.code,
      timezone: tz,
      // Al añadir un idioma, su tiempo se suma al total diario que se reparte entre todos.
      dailyMinutes: adding ? (existed ? viewer.profile.dailyMinutes : Math.min(120, viewer.profile.dailyMinutes + minutes)) : minutes,
      interests: (Array.isArray(input.interests) ? input.interests : []).filter((t) => topics.has(t)).slice(0, 8),
      explanationDepth: oneOf(input.explanationDepth, ["brief", "balanced", "detailed"] as const, "balanced"),
      preferredDifficulty: oneOf(input.preferredDifficulty, ["easy", "balanced", "challenging"] as const, "balanced"),
      competitive: Boolean(input.competitive),
      interactionPrefs: (Array.isArray(input.interactionPrefs) ? input.interactionPrefs : []).map((p) => str(p, 30)).filter(Boolean).slice(0, 8),
      motivation: str(input.reason, 200) || null,
      aiConsent: Boolean(input.aiConsent),
      consentAt: new Date(),
      onboardedAt: viewer.profile.onboardedAt ?? new Date(),
      ...(input.experience === undefined
        ? {}
        : {
            simpleMode: input.experience === "simple",
            slowAudio: input.experience === "simple",
            textSize: oneOf(input.textSize, ["normal", "large", "xl"] as const, input.experience === "simple" ? "large" : "normal"),
          }),
    });
    if (adding) await repo.setLanguagePriority(viewer.userId, lang.code, oneOf(input.priority, ["main", "active", "maintain"] as const, "active"));
    await repo.track(viewer.userId, adding ? "language_added" : "onboarding_completed", { language: lang.code });
    return { next: "/app/assessment" };
  });
}

// ── Diagnóstico ────────────────────────────────────────────────────────────
export async function tooHardAction(): Promise<ActionResult<null>> {
  return run("session.too-hard", async () => {
    const learner = await requireLearner();
    // Bajar el nivel es barato pero no debe poder repetirse sin control.
    if (!(await rateLimit(`too-hard:${learner.userId}`, 5, 3600))) throw new RateLimitedError();
    await lowerLevel(learner);
    revalidatePath("/app", "layout");
    return null;
  });
}

export async function startFromZeroAction(): Promise<ActionResult<null>> {
  return run("assessment.zero", async () => {
    const learner = await requireLearner();
    if (!(await rateLimit(`zero:${learner.userId}`, 5, 3600))) throw new RateLimitedError();
    await startFromZero(learner);
    revalidatePath("/app", "layout");
    return null;
  });
}

export async function startAssessmentAction(restart = false): Promise<ActionResult<AssessmentStep>> {
  return run("assessment.start", async () => startOrResumeAssessment(await requireLearner(), Boolean(restart)));
}

export async function answerAssessmentAction(assessmentId: string, itemId: string, choice: string, timeMs: number): Promise<ActionResult<AssessmentStep>> {
  return run("assessment.answer", async () => {
    const learner = await requireLearner();
    const step = await answerAssessment(learner, str(assessmentId, 64), str(itemId, 100), str(choice, 300), int(timeMs, 0, 600_000, 0));
    if (step.done) revalidatePath("/app");
    return step;
  });
}

// ── Sesiones ───────────────────────────────────────────────────────────────
export async function startSessionAction(opts: { minutes?: number; focus?: string | null; surprise?: boolean }): Promise<ActionResult<BuiltSession>> {
  return run("session.start", async () => {
    const learner = await requireLearner();
    const f = str(opts.focus, 80);
    const focus: SessionFocus =
      f === "new_words" || f === "listening" || f === "review" || f === "leeches" ? f
      : f.startsWith("grammar:") ? (f as `grammar:${string}`)
      : /^lesson:\d{1,2}$/.test(f) ? (f as `lesson:${number}`)
      : null;
    return startSession(learner, int(opts.minutes, 5, 60, learner.profile.dailyMinutes), { focus, surprise: Boolean(opts.surprise) });
  });
}

export async function submitAnswerAction(input: {
  sessionId: string | null;
  key: string;
  response: string;
  pairs?: Record<string, string>;
  timeMs: number;
  attempts: number;
  confidence?: number;
}): Promise<ActionResult<AnswerFeedback>> {
  return run("session.answer", async () => {
    const learner = await requireLearner();
    const pairs: Record<string, string> = {};
    if (input.pairs && typeof input.pairs === "object") {
      for (const [k, v] of Object.entries(input.pairs).slice(0, 10)) pairs[str(k, 100)] = str(v, 100);
    }
    return submitAnswer(learner, {
      sessionId: input.sessionId ? str(input.sessionId, 64) : null,
      key: str(input.key, 400),
      response: str(input.response, 500),
      pairs,
      timeMs: int(input.timeMs, 0, 600_000, 0),
      attempts: int(input.attempts, 1, 5, 1),
      confidence: input.confidence === undefined ? undefined : Math.max(0, Math.min(1, Number(input.confidence) || 0)),
    });
  });
}

export async function reviseConfidenceAction(attemptId: string, guessed: boolean): Promise<ActionResult<null>> {
  return run("session.confidence", async () => {
    await reviseConfidence(await requireLearner(), str(attemptId, 64), guessed === true);
    return null;
  });
}

export async function finishSessionAction(
  sessionId: string,
  durationSeconds: number,
  focus?: { onsetMin: number | null; breaks: number },
): Promise<ActionResult<SessionSummary | null>> {
  return run("session.finish", async () => {
    const f = focus && typeof focus === "object" ? { onsetMin: focus.onsetMin === null ? null : int(focus.onsetMin, 0, 240, 0), breaks: int(focus.breaks, 0, 20, 0) } : undefined;
    const summary = await finishSession(await requireLearner(), str(sessionId, 64), int(durationSeconds, 0, 14_400, 0), f);
    revalidatePath("/app");
    return summary;
  });
}

// ── Vocabulario ────────────────────────────────────────────────────────────
export async function setWordStatusAction(itemId: string, status: "known" | "difficult" | "saved" | "learning"): Promise<ActionResult<null>> {
  return run("vocab.status", async () => {
    const learner = await requireLearner();
    const item = getVocab(str(itemId, 100));
    if (!item || item.language !== learner.language.code) throw new Error("Palabra desconocida");
    await repo.setKnowledgeStatus(learner.ul.id, item.id, "vocab", oneOf(status, ["known", "difficult", "saved", "learning"] as const, "saved"));
    revalidatePath("/app/vocabulary");
    return null;
  });
}

// ── Tutor ──────────────────────────────────────────────────────────────────
export async function startConversationAction(topic: string | null): Promise<ActionResult<{ conversationId: string; message: string; goals: number[] }>> {
  return run("tutor.start", async () => startConversation(await requireLearner(), topic ? str(topic, 200) : null));
}

export async function sendTutorMessageAction(conversationId: string, text: string): Promise<ActionResult<{ message: string; goals: number[] }>> {
  return run("tutor.send", async () => sendTutorMessage(await requireLearner(), str(conversationId, 64), str(text, 1000)));
}

export async function endConversationAction(conversationId: string): Promise<ActionResult<ConversationFeedback>> {
  return run("tutor.end", async () => {
    const fb = await endConversation(await requireLearner(), str(conversationId, 64));
    revalidatePath("/app");
    return fb;
  });
}

// ── Configuración ──────────────────────────────────────────────────────────
export async function updateSettingsAction(input: {
  displayName?: string;
  dailyMinutes?: number;
  theme?: string;
  explanationDepth?: string;
  preferredDifficulty?: string;
  interests?: string[];
  aiConsent?: boolean;
  nativeLanguage?: string;
  textSize?: string;
  simpleMode?: boolean;
  slowAudio?: boolean;
  smartBreaks?: boolean;
}): Promise<ActionResult<null>> {
  return run("settings.update", async () => {
    const viewer = await requireViewer();
    const topics = new Set(TOPICS.map((t) => t.id));
    await repo.updateProfile(viewer.userId, {
      displayName: input.displayName !== undefined ? str(input.displayName, 60) || null : undefined,
      dailyMinutes: input.dailyMinutes !== undefined ? int(input.dailyMinutes, 5, 120, 15) : undefined,
      theme: input.theme !== undefined ? oneOf(input.theme, ["light", "dark", "system"] as const, "light") : undefined,
      explanationDepth: input.explanationDepth !== undefined ? oneOf(input.explanationDepth, ["brief", "balanced", "detailed"] as const, "balanced") : undefined,
      preferredDifficulty: input.preferredDifficulty !== undefined ? oneOf(input.preferredDifficulty, ["easy", "balanced", "challenging"] as const, "balanced") : undefined,
      interests: input.interests !== undefined ? input.interests.filter((t) => topics.has(t)).slice(0, 8) : undefined,
      aiConsent: input.aiConsent !== undefined ? Boolean(input.aiConsent) : undefined,
      nativeLanguage: input.nativeLanguage !== undefined && getLanguage(str(input.nativeLanguage, 8)) ? str(input.nativeLanguage, 8) : undefined,
      textSize: input.textSize !== undefined ? oneOf(input.textSize, ["normal", "large", "xl"] as const, "normal") : undefined,
      simpleMode: input.simpleMode !== undefined ? Boolean(input.simpleMode) : undefined,
      slowAudio: input.slowAudio !== undefined ? Boolean(input.slowAudio) : undefined,
      smartBreaks: input.smartBreaks !== undefined ? Boolean(input.smartBreaks) : undefined,
    });
    revalidatePath("/app", "layout");
    return null;
  });
}

/** Tutorial de bienvenida: terminado o saltado (se puede repetir desde Configuración). */
export async function completeTutorialAction(skipped: boolean): Promise<ActionResult<null>> {
  return run("tutorial.done", async () => {
    const viewer = await requireViewer();
    await repo.updateProfile(viewer.userId, { tutorialDoneAt: new Date() });
    await repo.track(viewer.userId, skipped ? "tutorial_skipped" : "tutorial_completed");
    return null;
  });
}

export async function setActiveLanguageAction(code: string): Promise<ActionResult<null>> {
  return run("settings.language", async () => {
    const viewer = await requireViewer();
    const ul = await repo.getUserLanguage(viewer.userId, str(code, 8));
    if (!ul) throw new Error("No estudias ese idioma todavía");
    await repo.updateProfile(viewer.userId, { activeLanguage: ul.languageCode });
    revalidatePath("/app", "layout");
    return null;
  });
}

export async function deleteAccountAction(confirmation: string): Promise<ActionResult<null>> {
  const res = await run("account.delete", async () => {
    if (str(confirmation, 20).toUpperCase() !== "ELIMINAR") throw new Error("Confirmación incorrecta");
    const viewer = await requireViewer();
    await deleteAccount(viewer.userId);
    return null;
  });
  if (res.ok) redirect("/?deleted=1");
  return res;
}

export async function explainMistakeAction(key: string, response: string): Promise<ActionResult<string>> {
  return run("session.explain", async () => explainMistake(await requireLearner(), str(key, 300), str(response, 300)));
}
