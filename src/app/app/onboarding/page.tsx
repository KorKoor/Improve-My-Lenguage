import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { learnableLanguages, TOPICS } from "@/lib/content";
import { listUserLanguages } from "@/lib/db/repositories";
import { requireViewer } from "@/lib/services/viewer";
import { OnboardingWizard } from "./wizard";

export const metadata: Metadata = { title: "Bienvenida", robots: { index: false } };

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  const viewer = await requireViewer();
  const sp = await searchParams;
  const adding = sp.add === "1";
  if (viewer.profile.onboardedAt && viewer.profile.activeLanguage && !adding) redirect("/app");
  const existing = (await listUserLanguages(viewer.userId)).map((l) => l.languageCode);
  const p = viewer.profile;
  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 sm:px-6">
      <OnboardingWizard
        adding={adding}
        languages={learnableLanguages().map((l) => ({ code: l.code, name: l.name, nativeName: l.nativeName, flag: l.flagEmoji, status: l.status, taken: existing.includes(l.code) }))}
        topics={TOPICS}
        defaults={{
          displayName: p.displayName ?? "",
          nativeLanguage: p.nativeLanguage,
          dailyMinutes: p.dailyMinutes,
          interests: p.interests,
          explanationDepth: p.explanationDepth,
          preferredDifficulty: p.preferredDifficulty,
          competitive: p.competitive,
          interactionPrefs: p.interactionPrefs,
          aiConsent: p.aiConsent,
          privacyAccepted: Boolean(p.consentAt),
        }}
      />
    </main>
  );
}
