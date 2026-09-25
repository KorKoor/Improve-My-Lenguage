import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/db/limits";
import { deletePushToken, savePushToken } from "@/lib/db/repositories";
import { isSameOrigin } from "@/lib/http";
import { getViewer } from "@/lib/services/viewer";

export const dynamic = "force-dynamic";

async function readToken(request: Request): Promise<string | null> {
  try {
    const body = (await request.json()) as { token?: unknown };
    const token = body.token;
    return typeof token === "string" && token.length >= 20 && token.length <= 4096 ? token : null;
  } catch {
    return null;
  }
}

/** Registra el dispositivo actual para recibir recordatorios. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!(await rateLimit(`push-register:${viewer.userId}`, 20, 3600))) {
    return NextResponse.json({ error: "Demasiados intentos; prueba más tarde." }, { status: 429 });
  }
  const token = await readToken(request);
  if (!token) return NextResponse.json({ error: "Token de dispositivo no válido." }, { status: 400 });
  const ua = request.headers.get("user-agent")?.slice(0, 300) ?? null;
  await savePushToken(viewer.userId, token, ua);
  return NextResponse.json({ ok: true });
}

/** Desactiva los recordatorios en este dispositivo. */
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const token = await readToken(request);
  if (!token) return NextResponse.json({ error: "Token de dispositivo no válido." }, { status: 400 });
  await deletePushToken(viewer.userId, token);
  return NextResponse.json({ ok: true });
}
