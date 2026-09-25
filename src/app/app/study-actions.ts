"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/db/repositories";
import { rateLimit } from "@/lib/db/limits";
import { BREAK_ACTIVITIES, type BreakActivity } from "@/lib/engine/focus";
import { PRIORITY_LABELS, type LanguagePriority } from "@/lib/engine/multilang";
import { checkAchievements } from "@/lib/services/learning";
import { requireLearner, requireViewer } from "@/lib/services/viewer";
import { logError } from "@/lib/log";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

function fail(name: string, err: unknown): { ok: false; error: string } {
  if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
  logError(`action:${name}`, err);
  return { ok: false, error: "Algo salió mal. Inténtalo de nuevo." };
}

/** Prioridad de un idioma en el reparto de tiempo (sólo un «principal»). */
export async function setLanguagePriorityAction(code: string, priority: LanguagePriority): Promise<Result<null>> {
  try {
    const viewer = await requireViewer();
    if (!(await rateLimit(`prio:${viewer.userId}`, 30, 600))) return { ok: false, error: "Vas muy rápido. Espera un poco." };
    if (!(priority in PRIORITY_LABELS)) return { ok: false, error: "Prioridad no válida" };
    const ul = await repo.getUserLanguage(viewer.userId, typeof code === "string" ? code.slice(0, 8) : "");
    if (!ul) return { ok: false, error: "No estudias ese idioma" };
    await repo.setLanguagePriority(viewer.userId, ul.languageCode, priority);
    revalidatePath("/app", "layout");
    return { ok: true, data: null };
  } catch (err) {
    return fail("languages.priority", err);
  }
}

/** Cambia el idioma activo para empezar un bloque del modo estudio. */
export async function switchLanguageForBlockAction(code: string): Promise<Result<null>> {
  try {
    const viewer = await requireViewer();
    if (!(await rateLimit(`switch:${viewer.userId}`, 60, 600))) return { ok: false, error: "Vas muy rápido. Espera un poco." };
    const ul = await repo.getUserLanguage(viewer.userId, typeof code === "string" ? code.slice(0, 8) : "");
    if (!ul) return { ok: false, error: "No estudias ese idioma" };
    if (viewer.profile.activeLanguage !== ul.languageCode) {
      await repo.updateProfile(viewer.userId, { activeLanguage: ul.languageCode });
      revalidatePath("/app", "layout");
    }
    return { ok: true, data: null };
  } catch (err) {
    return fail("study.switch", err);
  }
}

/** Valida un plan del modo estudio que llega del navegador (forma y tamaño). */
function validPlan(p: unknown): boolean {
  if (!p || typeof p !== "object") return false;
  const x = p as { v?: unknown; blocks?: unknown; idx?: unknown; startedAt?: unknown; blockStartedAt?: unknown; names?: unknown };
  if (x.v !== 1 || !Array.isArray(x.blocks) || x.blocks.length === 0 || x.blocks.length > 40) return false;
  if (typeof x.idx !== "number" || x.idx < 0 || x.idx >= x.blocks.length) return false;
  if (typeof x.startedAt !== "number" || typeof x.blockStartedAt !== "number") return false;
  return x.blocks.every((b) => {
    const k = b as { kind?: unknown; minutes?: unknown };
    return (k.kind === "study" || k.kind === "break") && typeof k.minutes === "number" && k.minutes > 0 && k.minutes <= 180;
  });
}

/** Guarda (o borra, con null) el plan en curso para reanudarlo en otro dispositivo. */
export async function syncStudyPlanAction(plan: unknown): Promise<Result<null>> {
  try {
    const viewer = await requireViewer();
    if (!(await rateLimit(`plan-sync:${viewer.userId}`, 120, 3600))) return { ok: true, data: null };
    if (plan !== null && (!validPlan(plan) || JSON.stringify(plan).length > 20_000)) return { ok: false, error: "Plan no válido" };
    await repo.setStudyPlan(viewer.userId, plan);
    return { ok: true, data: null };
  } catch (err) {
    return fail("study.sync", err);
  }
}

/** Plan en curso guardado en el servidor (si es de las últimas 6 horas). */
export async function getStudyPlanAction(): Promise<Result<unknown>> {
  try {
    const viewer = await requireViewer();
    const p = await repo.getStudyPlan(viewer.userId);
    const fresh = validPlan(p) && Date.now() - (p as { startedAt: number }).startedAt < 6 * 3600_000;
    return { ok: true, data: fresh ? p : null };
  } catch (err) {
    return fail("study.get", err);
  }
}

/** Registra un descanso (para estadísticas y logros). */
export async function recordBreakAction(activity: BreakActivity, seconds: number, completed: boolean): Promise<Result<null>> {
  try {
    const viewer = await requireViewer();
    if (!(await rateLimit(`break:${viewer.userId}`, 60, 3600))) return { ok: true, data: null };
    const a = activity in BREAK_ACTIVITIES ? activity : "eyes";
    const s = Math.max(0, Math.min(1800, Math.round(Number(seconds) || 0)));
    await repo.track(viewer.userId, completed ? "break_completed" : "break_skipped", { activity: a, seconds: s });
    return { ok: true, data: null };
  } catch (err) {
    return fail("study.break", err);
  }
}

/** Registra un plan del modo estudio completado (y comprueba sus logros). */
export async function recordStudyPlanAction(minutes: number, languages: number): Promise<Result<{ title: string; icon: string }[]>> {
  try {
    const viewer = await requireLearner();
    if (!(await rateLimit(`plan:${viewer.userId}`, 20, 3600))) return { ok: true, data: [] };
    await repo.track(viewer.userId, "study_plan_completed", { minutes: Math.max(0, Math.min(240, Math.round(Number(minutes) || 0))), languages: Math.max(1, Math.min(12, Math.round(Number(languages) || 1))) });
    const fresh = await checkAchievements(viewer);
    return { ok: true, data: fresh.map((a) => ({ title: a.title, icon: a.icon })) };
  } catch (err) {
    return fail("study.plan", err);
  }
}
