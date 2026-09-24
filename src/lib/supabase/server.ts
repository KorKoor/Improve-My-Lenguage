import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";

/** Cliente de Supabase para Server Components, Server Actions y Route Handlers. */
export async function createSupabaseServer() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");
  }
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Llamado desde un Server Component: el proxy ya refresca la sesión.
        }
      },
    },
  });
}
