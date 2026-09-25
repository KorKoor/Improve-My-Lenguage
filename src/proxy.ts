import { NextResponse, type NextRequest } from "next/server";

// Next.js 16: "proxy" sustituye al antiguo "middleware".
// Primera barrera barata: sin cookie de sesión no se entra en /app. La
// verificación real (firma, caducidad, revocación) se hace en el servidor
// (requireViewer) — aquí no, para no pagar una llamada a Firebase por request.
const SESSION_COOKIE = "__session";

export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
