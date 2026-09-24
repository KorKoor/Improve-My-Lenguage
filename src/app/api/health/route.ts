import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { aiAvailable } from "@/lib/ai/provider";
import { isAuthConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Salud del servicio. Útil también para evitar que Supabase Free pause la BD (ver DEPLOYMENT.md). */
export async function GET() {
  let database: "ok" | "unconfigured" | "error" = "unconfigured";
  if (isAuthConfigured()) {
    try {
      await db()`select 1`;
      database = "ok";
    } catch {
      database = "error";
    }
  }
  return NextResponse.json({ status: database === "error" ? "degraded" : "ok", database, ai: aiAvailable() }, { status: database === "error" ? 503 : 200 });
}
