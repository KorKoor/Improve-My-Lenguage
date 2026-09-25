import type { Metadata } from "next";
import { SpeakingRunner } from "@/components/speaking/runner";
import { requireLearner } from "@/lib/services/viewer";
import { PairsTrainer } from "@/components/speaking/pairs-trainer";
import { pairSetsFor } from "@/lib/content/minimal-pairs";

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
      {pairSetsFor(learner.language.code).length > 0 && (
        <section aria-labelledby="pairs-title" className="space-y-3">
          <h2 id="pairs-title" className="font-display text-xl font-extrabold">Entrena el oído: pares mínimos</h2>
          <p className="max-w-2xl text-sm text-muted">Dos palabras que sólo cambian en un sonido que en español no existe. Si tu oído las distingue, tu boca aprenderá a decirlas.</p>
          <PairsTrainer sets={pairSetsFor(learner.language.code)} locale={learner.language.speechLocale} language={learner.language.code} />
        </section>
      )}
    </div>
  );
}
