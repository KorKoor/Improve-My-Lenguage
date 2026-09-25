import type { Metadata } from "next";
import { AlphabetTrainer } from "@/components/alphabet/trainer";
import { ButtonLink } from "@/components/ui/button";
import { alphabetFor } from "@/lib/content/alphabets";
import { getAlphabet } from "@/lib/db/repositories";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Alfabeto" };

/**
 * «El alfabeto»: el paso 0 para los idiomas que no usan letras latinas. Tabla
 * de letras que suenan al tocarlas, por grupos, con un mini ejercicio por grupo.
 */
export default async function AlphabetPage() {
  const learner = await requireLearner();
  const lang = learner.language;
  const alphabet = alphabetFor(lang.code);
  if (!alphabet) {
    return (
      <div className="card p-6">
        <h1 className="font-display text-2xl font-extrabold">Alfabeto</h1>
        <p className="mt-2 text-muted">El {lang.name.toLowerCase()} usa el mismo alfabeto que el español, así que puedes empezar directamente. Las letras especiales las verás en las primeras lecciones, siempre con su audio.</p>
        <ButtonLink href="/app/course" className="mt-4">Ir al Camino guiado</ButtonLink>
      </div>
    );
  }
  const progress = await getAlphabet(learner.ul.id);
  return <AlphabetTrainer alphabet={alphabet} locale={lang.speechLocale} rtl={lang.rtl} languageName={lang.name} initialProgress={progress} />;
}
