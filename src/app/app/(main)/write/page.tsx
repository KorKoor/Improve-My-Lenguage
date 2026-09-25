import type { Metadata } from "next";
import { WritingStudio } from "@/components/writing/studio";
import { writingHistory, writingHome } from "@/lib/services/writing";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Escritura" };

export default async function WritePage() {
  const learner = await requireLearner();
  const [home, history] = await Promise.all([writingHome(learner), writingHistory(learner)]);
  return (
    <WritingStudio
      prompts={home.prompts}
      level={home.level}
      aiEnabled={home.aiEnabled}
      locale={learner.language.speechLocale}
      languageName={learner.language.name}
      history={history}
    />
  );
}
