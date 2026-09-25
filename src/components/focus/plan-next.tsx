"use client";

import { ArrowRight, Loader2, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { nextBlock } from "./plan-bar";
import { blockLabel, useActivePlan } from "./plan-store";

/** Al terminar una actividad dentro del modo estudio: botón al siguiente bloque. */
export function PlanNext() {
  const plan = useActivePlan();
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!plan) return null;
  const next = plan.blocks[plan.idx + 1];
  return (
    <div className="card flex w-full max-w-md items-center gap-3 border-primary p-4 text-left animate-pop-in">
      <Timer size={22} className="shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">Modo estudio</p>
        <p className="truncate text-muted">{next ? `Sigue: ${blockLabel(next, plan.names)}` : "Era el último bloque de tu plan"}</p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => nextBlock(router.push))}
        className="inline-flex h-10 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary"
      >
        {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
        {next ? "Siguiente" : "Terminar"} <ArrowRight size={15} aria-hidden />
      </button>
    </div>
  );
}
