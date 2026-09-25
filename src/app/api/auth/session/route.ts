import { NextResponse } from "next/server";
import { createSessionFromIdToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { rateLimit } from "@/lib/db/limits";
import { isBackendConfigured } from "@/lib/env";
import { isSameOrigin } from "@/lib/http";
import { ensureProfile, track } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

/** Canjea un ID token de Firebase (recién emitido) por la cookie de sesión. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  if (!isBackendConfigured()) return NextResponse.json({ error: "Servidor sin configurar" }, { status: 503 });

  let idToken: unknown;
  try {
    ({ idToken } = (await request.json()) as { idToken?: unknown });
  } catch {
    /* cuerpo no válido */
  }
  if (typeof idToken !== "string" || idToken.length < 100 || idToken.length > 4096) {
    return NextResponse.json({ error: "Token no válido" }, { status: 400 });
  }

  try {
    const { cookie, user } = await createSessionFromIdToken(idToken);
    if (!(await rateLimit(`login:${user.uid}`, 30, 3600))) {
      return NextResponse.json({ error: "Demasiados inicios de sesión; espera un poco." }, { status: 429 });
    }
    const name = typeof user.name === "string" ? user.name.split(" ")[0]! : null;
    await ensureProfile(user.uid, name);
    await track(user.uid, "signed_in", { provider: user.firebase.sign_in_provider });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions);
    return res;
  } catch (err) {
    const recent = (err as Error).message === "recent_login_required";
    if (!recent) console.error("[auth] no se pudo crear la sesión", (err as Error).message);
    return NextResponse.json({ error: recent ? "Vuelve a iniciar sesión." : "No se pudo iniciar sesión." }, { status: 401 });
  }
}
