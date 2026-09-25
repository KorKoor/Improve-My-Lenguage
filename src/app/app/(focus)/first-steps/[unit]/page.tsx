import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FirstStepsRunner } from "@/components/first-steps/unit-runner";
import { FIRST_STEPS, unitPhrases } from "@/lib/content/first-steps";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Primeros pasos" };

export default async function FirstStepsUnitPage({ params }: { params: Promise<{ unit: string }> }) {
  const learner = await requireLearner();
  const { unit: id } = await params;
  const idx = FIRST_STEPS.findIndex((u) => u.id === id);
  const unit = FIRST_STEPS[idx];
  if (!unit) notFound();
  const phrases = unitPhrases(unit, learner.language.code);
  if (phrases.length < 4) notFound();
  const next = FIRST_STEPS[idx + 1];
  return (
    <FirstStepsRunner
      unitId={unit.id}
      title={unit.title}
      emoji={unit.emoji}
      phrases={phrases}
      locale={learner.language.speechLocale}
      language={learner.language.code}
      rtl={learner.language.rtl}
      spaced={learner.language.spaceSeparated}
      nextHref={next ? `/app/first-steps/${next.id}` : null}
    />
  );
}
