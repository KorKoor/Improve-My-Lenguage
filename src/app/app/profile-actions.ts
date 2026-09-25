"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/db/repositories";
import { rateLimit } from "@/lib/db/limits";
import { PERSONALITY_QUESTIONS, scorePersonality, type PersonalityResult } from "@/lib/engine/personality";
import { checkAchievements } from "@/lib/services/learning";
import { AVATARS } from "@/lib/services/profile";
import { cheer, newGroupCode } from "@/lib/services/group";
import { requireLearner, requireViewer } from "@/lib/services/viewer";
import { logError } from "@/lib/log";

/** Server Actions del perfil: test de aprendizaje, avatar y nombre. */
export type ProfileResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(name: string, fn: () => Promise<T>): Promise<ProfileResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    logError(`action:${name}`, err);
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

// ── Grupo familiar / de estudio ─────────────────────────────────────────────
/** El logro «En familia» se comprueba con el perfil ya actualizado. */
async function unlockGroupAchievement() {
  try {
    const learner = await requireLearner();
    const profile = (await repo.getProfile(learner.userId)) ?? learner.profile;
    await checkAchievements({ ...learner, profile });
  } catch {
    // Sin idioma activo todavía: se desbloqueará en la próxima actividad.
  }
}

export async function createGroupAction(name: string): Promise<ProfileResult<{ code: string }>> {
  return run("group.create", async () => {
    const viewer = await requireViewer();
    if (!(await rateLimit(`group-create:${viewer.userId}`, 5, 86400))) throw userError("Has creado varios grupos hoy. Prueba mañana.");
    if (viewer.profile.groupId) throw userError("Ya estás en un grupo. Sal de él para crear otro.");
    const clean = String(name ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40) || "Mi familia";
    const g = await repo.createGroup(viewer.userId, clean, newGroupCode);
    await repo.track(viewer.userId, "group_created");
    await unlockGroupAchievement();
    revalidatePath("/app/group");
    return { code: g.id };
  });
}

export async function joinGroupAction(code: string): Promise<ProfileResult<null>> {
  return run("group.join", async () => {
    const viewer = await requireViewer();
    // Límite estricto: evita adivinar códigos por fuerza bruta.
    if (!(await rateLimit(`group-join:${viewer.userId}`, 10, 3600))) throw userError("Demasiados intentos. Espera una hora.");
    if (viewer.profile.groupId) throw userError("Ya estás en un grupo. Sal de él para unirte a otro.");
    const c = String(code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const r = await repo.joinGroup(viewer.userId, c);
    if (r === "not_found") throw userError("No encontramos ese código. Revísalo con quien te lo dio.");
    if (r === "full") throw userError("Ese grupo ya está completo (8 personas).");
    await repo.track(viewer.userId, "group_joined");
    await unlockGroupAchievement();
    revalidatePath("/app", "layout");
    return null;
  });
}

export async function leaveGroupAction(): Promise<ProfileResult<null>> {
  return run("group.leave", async () => {
    const viewer = await requireViewer();
    if (viewer.profile.groupId) await repo.leaveGroup(viewer.userId, viewer.profile.groupId);
    revalidatePath("/app", "layout");
    return null;
  });
}

export async function cheerAction(toId: string, emoji: string): Promise<ProfileResult<null>> {
  return run("group.cheer", async () => {
    const viewer = await requireViewer();
    try {
      await cheer(viewer, String(toId ?? "").slice(0, 128), String(emoji ?? ""));
    } catch (err) {
      throw userError(err instanceof Error ? err.message : "No se pudo enviar.");
    }
    return null;
  });
}
