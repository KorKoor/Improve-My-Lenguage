import { NextResponse } from "next/server";
import { pruneExpired } from "@/lib/db/limits";
import { prunePushTokens, reminderCandidates } from "@/lib/db/repositories";
import { isAdminConfigured, sendPush } from "@/lib/firebase/admin";
import { reminderMessage } from "@/lib/services/reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Recordatorios diarios (Vercel Cron, ver vercel.json). Protegido con
 * CRON_SECRET: Vercel envía `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isAdminConfigured()) return NextResponse.json({ ok: true, skipped: "Firebase Admin no configurado" });
  // Mantenimiento diario: rate limits y caché de IA caducados.
  const expired = await pruneExpired().catch((err) => {
    console.error("[cron:reminders] fallo al limpiar caducados", err);
    return 0;
  });

  const candidates = await reminderCandidates(500);
  let sent = 0;
  const invalid: string[] = [];
  for (const c of candidates) {
    try {
      const r = await sendPush(c.tokens, reminderMessage(c));
      sent += r.sent;
      invalid.push(...r.invalid);
    } catch (err) {
      console.error("[cron:reminders] fallo al enviar", err);
    }
  }
  await prunePushTokens(invalid);
  return NextResponse.json({ ok: true, users: candidates.length, sent, pruned: invalid.length, expired });
}
