"use server";

import { AiUnavailableError } from "@/lib/ai/provider";
import { worldKind } from "@/lib/engine/world";
import { logError } from "@/lib/log";
import { AiQuotaError } from "@/lib/services/tutor";
import { createWorldLesson, WorldInputError } from "@/lib/services/world";
import { requireLearner } from "@/lib/services/viewer";

export type WorldResult = { ok: true; id: string } | { ok: false; error: string };

/** «Aprende con el mundo»: crea la lección y devuelve su id (o un mensaje claro si no se puede). */
export async function createWorldLessonAction(kind: string, input: string): Promise<WorldResult> {
  try {
    const learner = await requireLearner();
    const meta = worldKind(kind);
    if (!meta) return { ok: false, error: "Elige de dónde quieres aprender." };
    const text = typeof input === "string" ? input.trim().slice(0, meta.input === "long" ? 8000 : 500) : "";
    return { ok: true, id: await createWorldLesson(learner, meta.id, text) };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    if (err instanceof WorldInputError || err instanceof AiUnavailableError || err instanceof AiQuotaError) return { ok: false, error: err.message };
    logError("action:world.create", err);
    return { ok: false, error: "Afi no pudo preparar la lección ahora. Inténtalo de nuevo en un momento." };
  }
}
