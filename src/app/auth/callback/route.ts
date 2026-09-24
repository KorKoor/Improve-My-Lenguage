import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/** Intercambia el código OAuth / confirmación de correo por una sesión (PKCE). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/app";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/app";
  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    console.error("[auth] exchangeCodeForSession falló", error.message);
  }
  return NextResponse.redirect(new URL("/login?error=callback", origin));
}
