import type { Metadata } from "next";
import { OwnTextReader } from "@/components/reading/own-text";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Leer tu propio texto" };

export default async function OwnTextPage() {
  const learner = await requireLearner();
  return <OwnTextReader languageName={learner.language.name} />;
}
