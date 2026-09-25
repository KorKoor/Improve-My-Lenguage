import type { Metadata } from "next";
import { SessionRunner } from "@/components/session/runner";
import { countDue } from "@/lib/db/repositories";
import { requireLearner } from "@/lib/services/viewer";
import { getSkills } from "@/lib/services/learning";
import { aiAvailable } from "@/lib/ai/provider";
import { viewerAttentionSpan } from "@/lib/services/multilang";

export const metadata: Metadata = { title: "Repaso" };

export default async function ReviewPage() {
  const learner = await requireLearner();
  const due = await countDue(learner.ul.id, new Date());
  const minutes = Math.max(5, Math.min(30, Math.ceil(due * 0.3)));
  return (
    <SessionRunner
      minutes={minutes}
      focus="review"
      surprise={false}
      locale={learner.language.speechLocale}
      language={learner.language.code}
      rtl={learner.language.rtl}
      aiEnabled={aiAvailable() && learner.profile.aiConsent}
      span={viewerAttentionSpan(learner)}
      smartBreaks={learner.profile.smartBreaks}
      languageName={learner.language.name}
      gentle={(await getSkills(learner.ul.id)).get("listening")!.theta < -1.1}
      title="Repaso"
    />
  );
}
