"use server";

import { revalidatePath } from "next/cache";
import { letterById } from "@/lib/content/phase-zero";
import * as repo from "@/lib/db/repositories";
import { rateLimit } from "@/lib/db/limits";
import { localDay } from "@/lib/engine/progress";
import { placement, phaseDone, phaseProgress, phaseZeroUnits } from "@/lib/engine/phase-zero";
import { logError } from "@/lib/log";
import { unitHref } from "@/lib/services/phase-zero";
import { requireLearner } from "@/lib/services/viewer";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function guard<T>(name: string, fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    logError(`action:${name}`, err);
    return { ok: false, error: "No se pudo guardar. Inténtalo de nuevo." };
  }
}

export interface PlacementResult {
  correct: number;
  total: number;
  skipAll: boolean;
  next: { title: string; href: string } | null;
}

/**
 * Diagnóstico «¿Sabes leer esto?»: se corrige en el servidor (la respuesta
 * nunca viaja al cliente) y coloca al alumno en su punto de la Fase 0.
 */
export async function placePhaseZeroAction(responses: { id: string; response: string }[]): Promise<Result<PlacementResult>> {
  return guard("phase.place", async () => {
    const learner = await requireLearner();
    if (!(await rateLimit(`place:${learner.userId}`, 10, 3600))) throw new Error("rate");
    const lang = learner.language.code;
    const results = (Array.isArray(responses) ? responses : []).slice(0, 12).flatMap((r) => {
      const ref = typeof r?.id === "string" ? letterById(r.id.slice(0, 40)) : null;
      if (!ref || ref.lang !== lang) return [];
      return [{ id: r.id, correct: typeof r.response === "string" && r.response === ref.letter.r }];
    });
    const place = placement(lang, results);
    await repo.savePhaseZeroUnits(learner.ul.id, Object.fromEntries(place.passedUnits.map((u) => [u, 2])));
    await repo.setPhaseZeroFlags(learner.ul.id, { diagnosed: true, skipped: place.skipAll });
    await repo.track(learner.userId, "phase_zero_placed", { language: lang, correct: results.filter((r) => r.correct).length, skip: place.skipAll });
    const state = await repo.getReadingState(learner.ul.id);
    const progress = phaseProgress(phaseZeroUnits(lang), phaseDone(state.phase, state.alphabet), state.skipped);
    revalidatePath("/app", "layout");
    return {
      correct: results.filter((r) => r.correct).length,
      total: results.length,
      skipAll: place.skipAll,
      next: progress.next ? { title: progress.next.title, href: unitHref(progress.next) } : null,
    };
  });
}

/**
 * Sin diagnóstico visual (modo accesible) o para saltar/volver: el alumno dice
 * si ya sabe leer. `knows` = salta la Fase 0; false = empieza (o vuelve) a ella.
 */
export async function setPhaseZeroKnownAction(knows: boolean): Promise<Result<null>> {
  return guard("phase.known", async () => {
    const learner = await requireLearner();
    await repo.setPhaseZeroFlags(learner.ul.id, { diagnosed: true, skipped: Boolean(knows) });
    await repo.track(learner.userId, knows ? "phase_zero_skipped" : "phase_zero_started", { language: learner.language.code });
    revalidatePath("/app", "layout");
    return null;
  });
}

/** Trazos practicados (unidad «Cómo se trazan»): calcar es libre, así que siempre se da por hecha. */
export async function completeStrokesAction(traced: number, total: number, seconds: number): Promise<Result<null>> {
  return guard("phase.strokes", async () => {
    const learner = await requireLearner();
    const t = Math.max(1, Math.min(20, Math.round(Number(total) || 1)));
    const c = Math.max(0, Math.min(t, Math.round(Number(traced) || 0)));
    await repo.savePhaseZeroUnits(learner.ul.id, { strokes: c / t >= 0.8 ? 3 : c > 0 ? 2 : 1 });
    await repo.bumpActivity(learner.userId, learner.language.code, localDay(new Date(), learner.profile.timezone), {
      seconds: Math.max(0, Math.min(1800, Math.round(Number(seconds) || 0))),
      exercises: 0,
      correct: 0,
    });
    await repo.track(learner.userId, "phase_strokes_done", { language: learner.language.code, traced: c, total: t });
    revalidatePath("/app", "layout");
    return null;
  });
}
