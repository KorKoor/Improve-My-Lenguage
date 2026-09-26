import type { Metadata } from "next";
import { SessionRunner } from "@/components/session/runner";
import { requireLearner } from "@/lib/services/viewer";
import { getSkills, romanLevelFor } from "@/lib/services/learning";
import { phaseZeroUnits } from "@/lib/engine/phase-zero";
import { writingUnits } from "@/lib/content/writing-system";
import { aiAvailable } from "@/lib/ai/provider";
import { sessionMinutesFor, viewerAttentionSpan } from "@/lib/services/multilang";

export const metadata: Metadata = { title: "Sesión" };

export default async function SessionPage({ searchParams }: { searchParams: Promise<{ minutes?: string; focus?: string; surprise?: string; lesson?: string; again?: string; phase?: string; writing?: string }> }) {
  const learner = await requireLearner();
  const sp = await searchParams;
  const lesson = /^\d{1,2}$/.test(sp.lesson ?? "") ? Math.max(1, Math.min(30, Number(sp.lesson))) : null;
  const minutes = Math.max(5, Math.min(60, Number(sp.minutes) || (await sessionMinutesFor(learner))));
  // Unidad de la Fase 0 (aprender a leer).
  const phase = sp.phase ? phaseZeroUnits(learner.language.code).find((u) => u.id === sp.phase && u.kind !== "strokes") : undefined;
  // Unidad de «Escritura y ortografía».
  const writing = sp.writing ? writingUnits(learner.language.code).find((u) => u.id === sp.writing) : undefined;
  return (
    <SessionRunner
      // Cambiar de lección (o repetirla) monta un reproductor nuevo: sin esto se quedaría la sesión anterior.
      key={`${sp.lesson ?? ""}|${sp.phase ?? ""}|${sp.writing ?? ""}|${sp.focus ?? ""}|${sp.minutes ?? ""}|${sp.surprise ?? ""}|${sp.again ?? ""}`}
      minutes={phase || writing ? 5 : minutes}
      focus={phase ? `phase:${phase.id}` : writing ? `writing:${writing.id}` : lesson ? `lesson:${lesson}` : (sp.focus ?? null)}
      surprise={sp.surprise === "1"}
      locale={learner.language.speechLocale}
      language={learner.language.code}
      rtl={learner.language.rtl}
      aiEnabled={aiAvailable() && learner.profile.aiConsent}
      span={viewerAttentionSpan(learner)}
      smartBreaks={learner.profile.smartBreaks}
      languageName={learner.language.name}
      gentle={(await getSkills(learner.ul.id)).get("listening")!.theta < -1.1}
      romanLevel={await romanLevelFor(learner)}
      audioFirst={learner.profile.audioFirst}
      title={phase ? phase.title : writing ? writing.title : lesson ? `Lección ${lesson}` : sp.focus === "leeches" ? "Palabras rebeldes" : sp.focus === "letters" ? "Repaso de letras" : "Sesión de estudio"}
    />
  );
}
