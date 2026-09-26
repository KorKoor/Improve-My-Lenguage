import type { Metadata } from "next";
import { WorldStart } from "@/components/world/start";
import { aiAvailable } from "@/lib/ai/provider";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Aprende con el mundo" };

export default async function WorldPage() {
  const learner = await requireLearner();
  const available = aiAvailable();
  const reason = !available
    ? "Esta función usa IA y no está configurada en este servidor. Todo lo demás funciona sin ella."
    : !learner.profile.aiConsent
      ? "Para crear lecciones con Afi hace falta activar la IA en Configuración (tú decides; puedes desactivarla cuando quieras)."
      : undefined;
  return <WorldStart languageName={learner.language.name} ready={available && learner.profile.aiConsent} reason={reason} />;
}
