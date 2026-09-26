import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PhaseDiagnostic } from "@/components/phase-zero/diagnostic";
import { diagnosticItems } from "@/lib/engine/phase-zero";
import { hashString } from "@/lib/engine/random";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "¿Sabes leer esto?" };

/** Prueba de un minuto para colocar al alumno en la Fase 0. */
export default async function PhaseCheckPage() {
  const learner = await requireLearner();
  // En modo accesible la prueba visual no tiene sentido: se elige en la portada.
  if (learner.profile.audioFirst) redirect("/app/start");
  const items = diagnosticItems(learner.language.code, hashString(`${learner.ul.id}|${new Date().toISOString().slice(0, 10)}`));
  if (!items.length) redirect("/app/start");
  return (
    <div className="mx-auto max-w-2xl">
      <PhaseDiagnostic items={items} language={learner.language.code} rtl={learner.language.rtl} languageName={learner.language.name} />
    </div>
  );
}
