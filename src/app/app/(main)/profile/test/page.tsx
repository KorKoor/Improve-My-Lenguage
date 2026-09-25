import type { Metadata } from "next";
import { PersonalityQuiz } from "@/components/profile/personality-quiz";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "¿Cómo aprendes mejor?" };

export default async function PersonalityTestPage() {
  await requireLearner();
  return <PersonalityQuiz />;
}
