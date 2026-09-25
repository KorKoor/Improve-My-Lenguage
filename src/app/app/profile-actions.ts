"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/db/repositories";
import { rateLimit } from "@/lib/db/limits";
import { PERSONALITY_QUESTIONS, scorePersonality, type PersonalityResult } from "@/lib/engine/personality";
import { checkAchievements } from "@/lib/services/learning";
import { AVATARS } from "@/lib/services/profile";
import { requireLearner, requireViewer } from "@/lib/services/viewer";

/** Server Actions del perfil: test de aprendizaje, avatar y nombre. */
export type ProfileResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(name: string, fn: () => Promise<T>): Promise<ProfileResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    console.error(`[action:${name}]`, err);
    return { ok: false, error: err instanceof Error && err.name === "UserFacing" ? err.message : "Algo salió mal. Inténtalo de nuevo." };
  }
}

function userError(message: string) {
  const e = new Error(message);
  e.name = "UserFacing";
  return e;
}

export async function savePersonalityAction(
  answers: Record<string, number>,
  apply: boolean,
): Promise<ProfileResult<{ result: PersonalityResult; newAchievements: { id: string; title: string; icon: string }[] }>> {
  return run("profile.personality", async () => {
    const learner = await requireLearner();
    if (!(await rateLimit(`personality:${learner.userId}`, 10, 3600))) throw userError("Demasiados intentos seguidos. Prueba más tarde.");
    // Sólo aceptamos las preguntas conocidas y valores 1–5.
    const clean: Record<string, number> = {};
    for (const q of PERSONALITY_QUESTIONS) {
      const v = Number(answers?.[q.id]);
      if (Number.isInteger(v) && v >= 1 && v <= 5) clean[q.id] = v;
    }
    if (Object.keys(clean).length < PERSONALITY_QUESTIONS.length - 3) throw userError("Responde al menos casi todas las preguntas.");
    const result = scorePersonality(clean);
    await repo.savePersonality(learner.userId, result);
    if (apply) {
      await repo.updateProfile(learner.userId, {
        preferredDifficulty: result.tuning.preferredDifficulty,
        explanationDepth: result.tuning.explanationDepth,
        competitive: result.tuning.competitive,
      });
    }
    await repo.track(learner.userId, "personality_completed", { archetype: result.archetype, applied: apply });
    const newAchievements = await checkAchievements({ ...learner, profile: { ...learner.profile, personality: result } });
    revalidatePath("/app", "layout");
    return { result, newAchievements };
  });
}

export async function resetPersonalityAction(): Promise<ProfileResult<null>> {
  return run("profile.personality.reset", async () => {
    const viewer = await requireViewer();
    await repo.savePersonality(viewer.userId, null);
    revalidatePath("/app/profile");
    return null;
  });
}

export async function updateIdentityAction(input: { avatar?: string | null; displayName?: string }): Promise<ProfileResult<null>> {
  return run("profile.identity", async () => {
    const viewer = await requireViewer();
    const patch: repo.ProfileUpdate = {};
    if (input.avatar !== undefined) {
      if (input.avatar !== null && !(AVATARS as readonly string[]).includes(input.avatar)) throw userError("Avatar no válido.");
      patch.avatar = input.avatar;
    }
    if (typeof input.displayName === "string") {
      const name = input.displayName.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40);
      if (!name) throw userError("Escribe un nombre.");
      patch.displayName = name;
    }
    await repo.updateProfile(viewer.userId, patch);
    revalidatePath("/app", "layout");
    return null;
  });
}
