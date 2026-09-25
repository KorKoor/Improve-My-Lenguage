import type { Metadata } from "next";
import { SpeakingRunner } from "@/components/speaking/runner";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Pronunciación" };

export default async function SpeakPage() {
  const learner = await requireLearner();
  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Pronunciación</h1>
        <p className="mt-1 max-w-2xl text-muted">Lee frases reales en voz alta y comprueba qué se entiende. Perder el miedo a hablar empieza aquí.</p>
      </header>
      <SpeakingRunner languageName={learner.language.name} />
    </div>
  );
}
