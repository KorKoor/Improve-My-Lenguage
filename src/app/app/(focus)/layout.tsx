import { ComfortSync } from "@/components/comfort";
import { requireLearner } from "@/lib/services/viewer";

/** Modo enfoque: sin navegación, para sesiones, repasos y diagnóstico. */
export default async function FocusLayout({ children }: { children: React.ReactNode }) {
  const learner = await requireLearner();
  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 sm:px-6">
      <ComfortSync textSize={learner.profile.textSize} slowAudio={learner.profile.slowAudio} />
      {children}
    </main>
  );
}
