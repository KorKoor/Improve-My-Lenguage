import { NextResponse } from "next/server";
import { aiAvailable } from "@/lib/ai/provider";
import { isBackendConfigured } from "@/lib/env";
import { firestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/** Salud del servicio: comprueba que Firestore responde. */
export async function GET() {
  let database: "ok" | "unconfigured" | "error" = "unconfigured";
  if (isBackendConfigured()) {
    try {
      await firestore().collection("users").limit(1).select().get();
      database = "ok";
    } catch {
      database = "error";
    }
  }
  return NextResponse.json({ status: database === "error" ? "degraded" : "ok", database, ai: aiAvailable() }, { status: database === "error" ? 503 : 200 });
}
