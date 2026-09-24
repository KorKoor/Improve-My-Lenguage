import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy-session";

// Next.js 16: "proxy" sustituye al antiguo "middleware".
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
