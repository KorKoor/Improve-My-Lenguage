"use client";
import { createBrowserClient } from "@supabase/ssr";

/** Cliente de Supabase para el navegador (sólo auth; nunca acceso a datos). */
export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase no está configurado.");
  return createBrowserClient(url, key);
}
