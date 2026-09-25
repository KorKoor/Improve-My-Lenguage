import type { Metadata } from "next";
import { StrokesTrainer } from "@/components/phase-zero/strokes-trainer";
import { ButtonLink } from "@/components/ui/button";
import { strokesFor } from "@/lib/content/strokes";
import { phaseZeroState, unitHref } from "@/lib/services/phase-zero";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Cómo se trazan" };

/** Fase 0 · orden de trazos de los signos más sencillos (japonés, chino, coreano, árabe). */
export default async function StrokesPage() {
  const learner = await requireLearner();
  const lang = learner.language;
  const chars = strokesFor(lang.code);
  const st = await phaseZeroState(learner);
  const next = st.units.find((u) => !st.done.has(u.id) && u.kind !== "strokes");
  const nextHref = next ? unitHref(next) : "/app/course";
  if (!chars.length || learner.profile.audioFirst) {
    return (
      <div className="card mx-auto max-w-2xl p-6">
        <h1 className="font-display text-2xl font-extrabold">Cómo se trazan</h1>
        <p className="mt-2 text-muted">
          {chars.length
            ? "En modo accesible este paso no se exige: trazar depende de ver las formas. Si quieres, puedes leer la descripción de cada trazo desactivando el modo accesible en Configuración."
            : `El ${lang.name.toLowerCase()} se escribe con letras que ya sabes trazar.`}
        </p>
        <ButtonLink href={nextHref} className="mt-4">Seguir</ButtonLink>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl">
      <StrokesTrainer chars={chars} locale={lang.speechLocale} language={lang.code} rtl={lang.rtl} nextHref={nextHref} />
    </div>
  );
}
