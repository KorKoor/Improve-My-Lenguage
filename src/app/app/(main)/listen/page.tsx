import type { Metadata } from "next";
import { ListeningRunner } from "@/components/listening/runner";
import { requireLearner } from "@/lib/services/viewer";
import { getSkills } from "@/lib/services/learning";

export const metadata: Metadata = { title: "Escucha" };

export default async function ListenPage() {
  const learner = await requireLearner();
  const beginner = (await getSkills(learner.ul.id)).get("listening")!.theta < -1.1;
  return <ListeningRunner languageName={learner.language.name} beginner={beginner} />;
}
