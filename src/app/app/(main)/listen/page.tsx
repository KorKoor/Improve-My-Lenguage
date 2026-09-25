import type { Metadata } from "next";
import { ListeningRunner } from "@/components/listening/runner";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Escucha" };

export default async function ListenPage() {
  const learner = await requireLearner();
  return <ListeningRunner languageName={learner.language.name} />;
}
