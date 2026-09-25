import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { aiAvailable } from "@/lib/ai/provider";
import { vocabFor } from "@/lib/content";
import { isBackendConfigured } from "@/lib/env";
import { firestore } from "@/lib/firebase/admin";
import { recentErrorCounts } from "@/lib/log";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

/**
 * Salud del servicio. Público: estado general (Firestore y contenido).
 * Con `Authorization: Bearer <CRON_SECRET>`: además errores de hoy/ayer por
 * ámbito, versión desplegada y tiempos, para vigilar la app sin servicios externos.
 */
export async function GET(req: Request) {
  const started = Date.now();
  let database: "ok" | "unconfigured" | "error" = "unconfigured";
  if (isBackendConfigured()) {
    try {
      await firestore().collection("users").limit(1).select().get();
      database = "ok";
    } catch {
      database = "error";
    }
  }
  let content: "ok" | "error" = "ok";
  try {
    if (vocabFor("en").length < 1000) content = "error";
  } catch {
    content = "error";
  }
  const degraded = database === "error" || content === "error";
  const body: Record<string, unknown> = { status: degraded ? "degraded" : "ok", database, content, ai: aiAvailable() };
  if (authorized(req)) {
    body.version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
    body.checkMs = Date.now() - started;
    if (database === "ok") body.errors = await recentErrorCounts().catch(() => null);
  }
  return NextResponse.json(body, { status: degraded ? 503 : 200, headers: { "cache-control": "no-store" } });
}
