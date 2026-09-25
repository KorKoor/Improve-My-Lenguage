import { NextResponse, type NextRequest } from "next/server";
import { destroySession, verifySession } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/http";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const user = await verifySession().catch(() => null);
  await destroySession(user?.uid ?? null);
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), { status: 303 });
}
