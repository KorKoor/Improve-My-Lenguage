import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/db/limits";
import { listPushTokens, prunePushTokens } from "@/lib/db/repositories";
import { isAdminConfigured, sendPush } from "@/lib/firebase/admin";
import { isSameOrigin } from "@/lib/http";
import { getViewer } from "@/lib/services/viewer";

export const dynamic = "force-dynamic";

/** Envía una notificación de prueba sólo a los dispositivos del propio usuario. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!isAdminConfigured()) return NextResponse.json({ error: "Las notificaciones no están configuradas en el servidor." }, { status: 503 });
  if (!(await rateLimit(`push-test:${viewer.userId}`, 5, 3600))) {
    return NextResponse.json({ error: "Demasiadas pruebas; espera una hora." }, { status: 429 });
  }
  const tokens = await listPushTokens(viewer.userId);
  if (tokens.length === 0) return NextResponse.json({ error: "No hay dispositivos registrados." }, { status: 404 });
  try {
    const { sent, invalid } = await sendPush(tokens, {
      title: "Improve My Languages",
      body: "Las notificaciones funcionan. Te avisaremos cuando tengas repasos pendientes.",
      link: "/app",
    });
    await prunePushTokens(invalid);
    return NextResponse.json({ ok: sent > 0, sent });
  } catch (err) {
    console.error("[push] fallo en notificación de prueba", err);
    return NextResponse.json({ error: "No se pudo enviar la notificación." }, { status: 502 });
  }
}
