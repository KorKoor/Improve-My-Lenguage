import type { Metadata } from "next";
import { Mascot } from "@/components/mascot";
import { isAuthConfigured } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Configuración inicial", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function Setup() {
  if (isAuthConfigured()) redirect("/app");
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Mascot size={96} mood="calm" />
      <h1 className="mt-4 font-display text-3xl font-extrabold">Falta configurar el servidor</h1>
      <p className="mt-3 text-muted">La web pública funciona, pero para iniciar sesión y guardar tu progreso hacen falta estas variables de entorno (ver <code>.env.example</code> y <code>docs/DEPLOYMENT.md</code>):</p>
      <ul className="card mt-6 space-y-2 p-6 font-mono text-sm">
        <li>NEXT_PUBLIC_SUPABASE_URL</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        <li>DATABASE_URL</li>
      </ul>
      <p className="mt-6 text-sm text-muted">Después ejecuta la migración <code>supabase/migrations/0001_init.sql</code> en el SQL Editor de Supabase y vuelve a desplegar.</p>
    </main>
  );
}
