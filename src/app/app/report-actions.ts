"use server";

import { revalidatePath } from "next/cache";
import { getVocab } from "@/lib/content";
import * as repo from "@/lib/db/repositories";
import { rateLimit } from "@/lib/db/limits";
import { phraseById } from "@/lib/engine/exercises";
import { isAdminEmail } from "@/lib/env";
import { logError } from "@/lib/log";
import { requireLearner, requireViewer } from "@/lib/services/viewer";

type Result = { ok: true } | { ok: false; error: string };
const KINDS = ["translation", "audio", "example", "other"] as const;

/** «Reportar»: una palabra o frase con traducción, audio o ejemplo incorrectos. */
export async function reportContentAction(itemId: string, kind: string, note: string): Promise<Result> {
  try {
    const learner = await requireLearner();
    if (!(await rateLimit(`report:${learner.userId}`, 30, 86_400))) return { ok: false, error: "Ya enviaste muchos reportes hoy. ¡Gracias!" };
    const id = typeof itemId === "string" ? itemId.slice(0, 120) : "";
    const lang = learner.language.code;
    const vocab = id.startsWith(`${lang}:w:`) ? getVocab(id) : undefined;
    const phrase = id.startsWith(`${lang}:p:`) ? phraseById(id) : null;
    if (!vocab && !phrase) return { ok: false, error: "No encontramos esa palabra." };
    const k = (KINDS as readonly string[]).includes(kind) ? (kind as (typeof KINDS)[number]) : "other";
    const shown = vocab ? `${vocab.lemma} = ${(vocab.translations.es ?? []).join(" / ")}` : `${phrase!.text} = ${phrase!.es}`;
    await repo.reportContent(learner.userId, { itemId: id, language: lang, kind: k, note: typeof note === "string" ? note.trim().slice(0, 300) || null : null, shown });
    return { ok: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    logError("action:report", err);
    return { ok: false, error: "No se pudo enviar. Inténtalo de nuevo." };
  }
}

/** Revisión (sólo administradores): marca como corregido o descartado. */
export async function resolveReportsAction(itemId: string, status: "fixed" | "dismissed"): Promise<Result> {
  try {
    const viewer = await requireViewer();
    if (!isAdminEmail(viewer.email)) return { ok: false, error: "No autorizado" };
    await repo.resolveReports(typeof itemId === "string" ? itemId.slice(0, 120) : "", status === "fixed" ? "fixed" : "dismissed");
    revalidatePath("/app/admin");
    return { ok: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    logError("action:report.resolve", err);
    return { ok: false, error: "No se pudo actualizar." };
  }
}
