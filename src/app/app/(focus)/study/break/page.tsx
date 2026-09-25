import type { Metadata } from "next";
import { PlanBreak } from "@/components/focus/plan-break";

export const metadata: Metadata = { title: "Descanso" };

export default function StudyBreakPage() {
  return <PlanBreak />;
}
