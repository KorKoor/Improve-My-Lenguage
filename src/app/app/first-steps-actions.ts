"use server";

import { revalidatePath } from "next/cache";
import { FIRST_STEPS } from "@/lib/content/first-steps";
import { getStory } from "@/lib/content/stories";
import * as repo from "@/lib/db/repositories";
import { rateLimit } from "@/lib/db/limits";
import { localDay } from "@/lib/engine/progress";
import { checkAchievements } from "@/lib/services/learning";
import { requireLearner } from "@/lib/services/viewer";
import { logError } from "@/lib/log";

/** Guarda una unidad de «Primeros pasos» terminada (cuenta para la racha y la actividad). */
export async function completeFirstStepsUnitAction(
  unitId: string,
  correct: number,
  total: number,
  seconds: number,
): Promise<{ ok: true; data: { stars: number; newAchievements: { title: string; icon: string }[] } } | { ok: false; error: string }> {
  try {
    const learner = await requireLearner();
    if (!(await rateLimit(`first:${learner.userId}`, 40, 3600))) return { ok: false, error: "Vas muy rápido. Espera un poco." };
    const unit = FIRST_STEPS.find((u) => u.id === unitId);
    if (!unit) return { ok: false, error: "Unidad desconocida" };
    const t = Math.max(1, Math.min(60, Math.round(Number(total) || 0)));
    const c = Math.max(0, Math.min(t, Math.round(Number(correct) || 0)));
    const stars = c / t >= 0.9 ? 3 : c / t >= 0.7 ? 2 : 1;
    await repo.saveFirstStepsUnit(learner.ul.id, unit.id, stars);
    await repo.bumpActivity(learner.userId, learner.language.code, localDay(new Date(), learner.profile.timezone), {
      seconds: Math.max(0, Math.min(1800, Math.round(Number(seconds) || 0))),
      exercises: t,
      correct: c,
    });
    await repo.track(learner.userId, "first_steps_unit", { unit: unit.id, stars });
    const fresh = await checkAchievements(learner);
    revalidatePath("/app");
    return { ok: true, data: { stars, newAchievements: fresh.map((a) => ({ title: a.title, icon: a.icon })) } };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    logError("action:first-steps", err);
    return { ok: false, error: "No se pudo guardar. Inténtalo de nuevo." };
  }
}

/** Historia graduada terminada: cuenta como lectura (actividad y racha). */
export async function completeStoryAction(storyId: string, correct: number, total: number, seconds: number): Promise<{ ok: boolean }> {
  try {
    const learner = await requireLearner();
    if (!(await rateLimit(`story:${learner.userId}`, 40, 3600))) return { ok: false };
    const story = getStory(learner.language.code, typeof storyId === "string" ? storyId.slice(0, 40) : "");
    if (!story) return { ok: false };
    const t = Math.max(1, Math.min(10, Math.round(Number(total) || 0)));
    const c = Math.max(0, Math.min(t, Math.round(Number(correct) || 0)));
    await repo.bumpActivity(learner.userId, learner.language.code, localDay(new Date(), learner.profile.timezone), {
      seconds: Math.max(0, Math.min(1800, Math.round(Number(seconds) || 0))),
      exercises: t,
      correct: c,
    });
    await repo.track(learner.userId, "story_completed", { story: story.id, correct: c, total: t });
    revalidatePath("/app/stories");
    return { ok: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    logError("action:story", err);
    return { ok: false };
  }
}
