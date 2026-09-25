import type { Metadata } from "next";
import { StudyPlanner } from "@/components/focus/study-planner";
import { studyModeData } from "@/lib/services/multilang";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Modo estudio" };

export default async function StudyPage({ searchParams }: { searchParams: Promise<{ done?: string; ach?: string }> }) {
  const learner = await requireLearner();
  const [data, sp] = await Promise.all([studyModeData(learner), searchParams]);
  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Modo estudio</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Tú dices cuánto tiempo tienes. Lo repartimos entre tus idiomas según lo que más lo necesita hoy, con descansos en el momento justo y un temporizador que te guía bloque a bloque.
        </p>
      </header>
      <StudyPlanner
        plans={data.plans}
        names={data.names}
        span={data.span}
        best={data.best}
        defaultMinutes={learner.profile.dailyMinutes}
        reasons={data.overview.allocation}
        done={sp.done === "1"}
        achievements={sp.done === "1" && sp.ach ? sp.ach.split("|").slice(0, 5).map((a) => a.slice(0, 60)) : []}
      />
    </div>
  );
}
