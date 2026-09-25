"use server";

import { revalidatePath } from "next/cache";
import { countDue } from "@/lib/db/repositories";
import { rateLimit } from "@/lib/db/limits";
import { claimDailyQuest, type XpView } from "@/lib/services/quests";
import { requireLearner } from "@/lib/services/viewer";
import { logError } from "@/lib/log";

export type QuestClaimResult =
  | { ok: true; data: { xpGained: number; xp: XpView; leveledUp: boolean; allDone: boolean; freezeEarned: boolean } }
  | { ok: false; error: string };

export async function claimQuestAction(questId: string): Promise<QuestClaimResult> {
  try {
    const learner = await requireLearner();
    if (!(await rateLimit(`quest:${learner.userId}`, 30, 3600))) return { ok: false, error: "Demasiados intentos. Espera un poco." };
    const id = typeof questId === "string" ? questId.slice(0, 40) : "";
    const data = await claimDailyQuest(learner, id, await countDue(learner.ul.id, new Date()));
    revalidatePath("/app");
    return { ok: true, data };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    const msg = err instanceof Error ? err.message : "";
    if (!/^(Misión|Aún)/.test(msg)) logError("action:quest.claim", err);
    return { ok: false, error: /^(Misión|Aún)/.test(msg) ? msg : "No se pudo reclamar la misión. Inténtalo de nuevo." };
  }
}
