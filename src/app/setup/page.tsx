import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mascot } from "@/components/mascot";
import { isBackendConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Configuración inicial", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function Setup() {
  if (isBackendConfigured()) redirect("/app");
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Mascot size={96} mood="calm" />
      <h1 className="mt-4 font-display text-3xl font-extrabold">Falta configurar el servidor</h1>
      <p className="mt-3 text-muted">La web pública funciona, pero para iniciar sesión y guardar tu progreso hacen falta estas variables de entorno (ver <code>.env.example</code> y <code>docs/DEPLOYMENT.md</code>):</p>
      <ul className="card mt-6 space-y-2 p-6 font-mono text-sm">
        <li>NEXT_PUBLIC_FIREBASE_API_KEY · _AUTH_DOMAIN · _PROJECT_ID · _APP_ID</li>
        <li>FIREBASE_SERVICE_ACCOUNT <span className="font-sans text-muted">(sólo servidor)</span></li>
      </ul>
      <p className="mt-6 text-sm text-muted">Después despliega las reglas e índices de Firestore con <code>firebase deploy --only firestore</code> y vuelve a desplegar la app.</p>
    </main>
  );
}
