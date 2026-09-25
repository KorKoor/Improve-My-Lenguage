"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { BreakCoach } from "./break-coach";
import { nextBlock } from "./plan-bar";
import { blockLabel, useActivePlan } from "./plan-store";

/** Descanso de un plan del modo estudio (pantalla completa). */
export function PlanBreak() {
  const plan = useActivePlan();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const b = plan?.blocks[plan.idx];
  if (!plan || !b || b.kind !== "break") {
    return (
      <div className="grid flex-1 place-items-center py-20 text-center">
        <div className="space-y-4">
          <p className="font-display text-2xl font-extrabold">No hay ningún descanso en curso</p>
          <ButtonLink href="/app/study">Ir al modo estudio</ButtonLink>
        </div>
      </div>
    );
  }
  const next = plan.blocks[plan.idx + 1];
  return (
    <BreakCoach
      key={plan.idx}
      seconds={b.minutes * 60}
      activity={b.activity}
      why={next ? `Después: ${blockLabel(next, plan.names)}.` : undefined}
      nextLabel={next ? "Siguiente bloque" : "Terminar"}
      onDone={() => void nextBlock(router.push)}
    />
  );
}
