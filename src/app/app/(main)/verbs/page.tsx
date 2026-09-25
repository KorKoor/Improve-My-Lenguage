import type { Metadata } from "next";
import { VerbTrainer } from "@/components/verbs/trainer";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { verbsHome } from "@/lib/services/verbs";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Verbos" };

export default async function VerbsPage({ searchParams }: { searchParams: Promise<{ verb?: string }> }) {
  const learner = await requireLearner();
  const [home, sp] = await Promise.all([verbsHome(learner), searchParams]);
  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Verbos</h1>
        <p className="mt-1 max-w-2xl text-muted">Conjuga los verbos de {learner.language.name.toLowerCase()} en los tiempos de tu nivel. Tablas completas de Wiktionary para los verbos más usados.</p>
      </header>
      {home.supported ? (
        <VerbTrainer verbs={home.verbs} level={home.level} language={learner.language.code} languageName={learner.language.name} initialVerb={sp.verb ?? null} />
      ) : (
        <Card>
          <EmptyState title={learner.language.code === "en" ? "El inglés casi no conjuga" : "Aquí los verbos no cambian por persona"}>
            {learner.language.code === "en"
              ? "En inglés sólo cambia la tercera persona (he goes) y el pasado (went). Los verbos irregulares y los tiempos se practican en Gramática y en tus sesiones."
              : `En ${learner.language.name.toLowerCase()} los verbos no cambian según la persona (yo, tú, él…), así que no hay tablas que memorizar. Practica sus terminaciones y tiempos en Gramática.`}
          </EmptyState>
        </Card>
      )}
    </div>
  );
}
