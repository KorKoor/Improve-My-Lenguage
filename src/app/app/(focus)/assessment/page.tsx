import type { Metadata } from "next";
import { AssessmentRunner } from "@/components/assessment/assessment-runner";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Diagnóstico" };

export default async function AssessmentPage({ searchParams }: { searchParams: Promise<{ restart?: string }> }) {
  const learner = await requireLearner();
  const sp = await searchParams;
  return <AssessmentRunner languageName={learner.language.name} language={learner.language.code} rtl={learner.language.rtl} restart={sp.restart === "1"} alreadyAssessed={Boolean(learner.ul.assessedAt)} locale={learner.language.speechLocale} />;
}
