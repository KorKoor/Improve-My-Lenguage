import type { Metadata } from "next";
import { SessionRunner } from "@/components/session/runner";
import { getLanguage } from "@/lib/content";
import { listUserLanguages } from "@/lib/db/repositories";
import { aiAvailable } from "@/lib/ai/provider";
import { viewerAttentionSpan } from "@/lib/services/multilang";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Repaso de todos tus idiomas" };

/** Repaso intercalado: lo vencido de todos los idiomas en una sola sesión, alternándolos. */
export default async function MixedReviewPage() {
  const learner = await requireLearner();
  const langs = await listUserLanguages(learner.userId);
  const languages = Object.fromEntries(
    langs.flatMap((ul) => {
      const l = getLanguage(ul.languageCode);
      return l ? [[l.code, { locale: l.speechLocale, rtl: l.rtl, name: l.name }]] : [];
    }),
  );
  return (
    <SessionRunner
      minutes={15}
      focus="mixed"
      surprise={false}
      locale={learner.language.speechLocale}
      language={learner.language.code}
      rtl={learner.language.rtl}
      languages={languages}
      aiEnabled={aiAvailable() && learner.profile.aiConsent}
      span={viewerAttentionSpan(learner)}
      smartBreaks={learner.profile.smartBreaks}
      title="Repaso de todos tus idiomas"
    />
  );
}
