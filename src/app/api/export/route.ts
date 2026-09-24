import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/db/limits";
import { exportData } from "@/lib/services/account";
import { getViewer } from "@/lib/services/viewer";

export const dynamic = "force-dynamic";

/** Exportación de todos los datos del usuario (derecho de acceso/portabilidad). */
export async function GET() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!(await rateLimit(`export:${viewer.userId}`, 5, 3600))) return NextResponse.json({ error: "Demasiadas exportaciones; espera una hora." }, { status: 429 });
  const data = await exportData(viewer.userId);
  return new NextResponse(JSON.stringify({ email: viewer.email, ...data }, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="improve-my-languages-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
