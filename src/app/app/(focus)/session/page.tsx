import type { Metadata } from "next";
import { SessionRunner } from "@/components/session/runner";
import { requireLearner } from "@/lib/services/viewer";
import { aiAvailable } from "@/lib/ai/provider";
import { viewerAttentionSpan } from "@/lib/services/multilang";

export const metadata: Metadata = { title: "Sesión" };

export default async function SessionPage({ searchParams }: { searchParams: Promise<{ minutes?: string; focus?: string; surprise?: string }> }) {
  const learner = await requireLearner();
  const sp = await searchParams;
  const minutes = Math.max(5, Math.min(60, Number(sp.minutes) || learner.profile.dailyMinutes));
  return (
    <SessionRunner
      minutes={minutes}
      focus={sp.focus ?? null}
      surprise={sp.surprise === "1"}
      locale={learner.language.speechLocale}
      language={learner.language.code}
      rtl={learner.language.rtl}
      aiEnabled={aiAvailable() && learner.profile.aiConsent}
      span={viewerAttentionSpan(learner)}
      smartBreaks={learner.profile.smartBreaks}
      title={sp.focus === "leeches" ? "Palabras rebeldes" : "Sesión de estudio"}
    />
  );
}
