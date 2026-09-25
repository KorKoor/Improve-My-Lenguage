"use server";

import { rateLimit } from "@/lib/db/limits";
import { RateLimitedError } from "@/lib/services/learning";
import { answerListening, buildListening, finishListening, type ListeningFeedback, type ListeningItem } from "@/lib/services/listening";
import { completeReading, readerForOwnText, type ReaderData } from "@/lib/services/reading";
import { requireLearner } from "@/lib/services/viewer";

/**
 * Server Actions de las habilidades (lectura, escucha, escritura).
 * Mismo contrato que actions.ts: validan en el servidor y nunca lanzan
 * errores crudos al cliente.
 */
export type SkillResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(name: string, fn: () => Promise<T>): Promise<SkillResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    console.error(`[action:${name}]`, err);
    const message =
      err instanceof UserFacingError ? err.message
      : err instanceof RateLimitedError ? "Vas muy rápido. Espera unos segundos."
      : "Algo salió mal. Inténtalo de nuevo; tu progreso está a salvo.";
    return { ok: false, error: message };
  }
}

class UserFacingError extends Error {}

const str = (v: unknown, max = 200): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown, min: number, max: number, def: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : def;
};

// ── Lectura ─────────────────────────────────────────────────────────────────
export async function readOwnTextAction(text: string): Promise<SkillResult<ReaderData>> {
  return run("reading.own", async () => {
    const learner = await requireLearner();
    if (!(await rateLimit(`reader-own:${learner.userId}`, 20, 3600))) throw new UserFacingError("Has analizado muchos textos seguidos. Espera un poco.");
    const clean = str(text, 8000);
    if (clean.length < 20) throw new UserFacingError("Pega un texto un poco más largo (al menos una frase).");
    return readerForOwnText(learner, clean);
  });
}

export async function completeReadingAction(input: {
  source: string;
  title: string;
  url: string;
  level: string;
  theta: number;
  words: number;
  correct: number;
  total: number;
  seconds: number;
}): Promise<SkillResult<{ newAchievements: { id: string; title: string; icon: string }[] }>> {
  return run("reading.complete", async () => {
    const learner = await requireLearner();
    if (!(await rateLimit(`reading-done:${learner.userId}`, 60, 3600))) throw new UserFacingError("Demasiadas lecturas seguidas; espera un momento.");
    const total = int(input.total, 0, 20, 0);
    const url = str(input.url, 500);
    return completeReading(learner, {
      source: ["wikipedia", "wikinews", "wikivoyage", "simplewiki", "own", "graded"].includes(input.source) ? input.source : "own",
      title: str(input.title, 200),
      url: /^https:\/\/[a-z-]+\.(wikipedia|wikinews|wikivoyage)\.org\//.test(url) ? url : "",
      level: ["A1", "A2", "B1", "B2", "C1", "C2"].includes(input.level) ? input.level : "B1",
      theta: Math.max(-4, Math.min(4, Number(input.theta) || 0)),
      words: int(input.words, 0, 20000, 0),
      correct: int(input.correct, 0, total, 0),
      total,
      seconds: int(input.seconds, 0, 7200, 0),
    });
  });
}

// ── Escucha ─────────────────────────────────────────────────────────────────
export async function startListeningAction(): Promise<SkillResult<{ items: ListeningItem[]; locale: string }>> {
  return run("listening.start", async () => buildListening(await requireLearner()));
}

export async function answerListeningAction(key: string, response: string, timeMs: number): Promise<SkillResult<ListeningFeedback>> {
  return run("listening.answer", async () => answerListening(await requireLearner(), str(key, 300), str(response, 400), int(timeMs, 0, 600_000, 0)));
}

export async function finishListeningAction(correct: number, total: number): Promise<SkillResult<{ newAchievements: { id: string; title: string; icon: string }[] }>> {
  return run("listening.finish", async () => {
    const t = int(total, 0, 50, 0);
    return finishListening(await requireLearner(), int(correct, 0, t, 0), t);
  });
}
