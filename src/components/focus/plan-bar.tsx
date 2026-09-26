"use client";

import { ArrowRight, Loader2, Timer, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { recordStudyPlanAction, switchLanguageForBlockAction } from "@/app/app/study-actions";
import { cn } from "@/lib/cn";
import { advancePlan, blockHref, currentPlan, blockLabel, restorePlanFromServer, stopPlan, useActivePlan, type ActivePlan } from "./plan-store";
import { formatClock } from "./break-coach";

/** Lleva al bloque actual del plan (cambiando de idioma si hace falta). */
export async function goToCurrentBlock(plan: ActivePlan, push: (href: string) => void) {
  const b = plan.blocks[plan.idx]!;
  if (b.kind === "study") await switchLanguageForBlockAction(b.code);
  push(blockHref(b, plan.idx));
}

/** Termina el bloque actual y va al siguiente (o al resumen si era el último). */
export async function nextBlock(push: (href: string) => void) {
  const before = currentPlan();
  const p = advancePlan();
  if (p) return goToCurrentBlock(p, push);
  let ach = "";
  if (before) {
    const langs = new Set(before.blocks.flatMap((b) => (b.kind === "study" ? [b.code] : []))).size;
    const r = await recordStudyPlanAction(Math.round((Date.now() - before.startedAt) / 60000), langs);
    if (r.ok && r.data.length) ach = `&ach=${encodeURIComponent(r.data.map((a) => `${a.icon} ${a.title}`).join("|"))}`;
  }
  push(`/app/study?done=1${ach}`);
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

/**
 * Barra del modo estudio: bloque actual, tiempo restante y «Siguiente».
 * `inline` en las pantallas de enfoque (sin barra de pestañas).
 */
export function PlanBar({ inline = false }: { inline?: boolean }) {
  const plan = useActivePlan();
  const path = usePathname();
  const router = useRouter();
  const [pending, start] = useTransition();
  const now = useNow(Boolean(plan));
  const warned = useRef<number>(-1);
  // Reanudar en este dispositivo un plan empezado en otro.
  useEffect(() => {
    void restorePlanFromServer();
  }, []);

  const hidden = !plan || path.startsWith("/app/study");
  const block = plan?.blocks[plan.idx];
  const left = plan && block ? block.minutes * 60 - (now - plan.blockStartedAt) / 1000 : 0;
  const over = left <= 0;

  // Deja sitio a la barra flotante para que no tape el final de la página.
  useEffect(() => {
    if (inline || hidden) return;
    document.body.classList.add("has-plan");
    return () => document.body.classList.remove("has-plan");
  }, [inline, hidden]);

  useEffect(() => {
    if (!plan || !over || warned.current === plan.idx) return;
    warned.current = plan.idx;
    navigator.vibrate?.(80);
  }, [over, plan]);

  if (hidden || !block) return null;
  const nextB = plan.blocks[plan.idx + 1];

  return (
    <div
      className={cn(
        "z-30 flex items-center gap-3 rounded-2xl border bg-surface/95 px-3 py-2 text-sm shadow-lg backdrop-blur",
        inline ? "mt-3" : "fixed inset-x-3 bottom-[84px] lg:bottom-5 lg:left-auto lg:right-6 lg:w-[380px]",
        over ? "border-success animate-pop" : "border-border",
      )}
      role="status"
      aria-label="Modo estudio en curso"
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", over ? "bg-success-soft text-success-ink" : "bg-primary-soft text-primary")}>
        <Timer size={18} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{blockLabel(block, plan.names)}</p>
        <p className="truncate text-xs text-muted">
          {over ? (nextB ? <>¡Tiempo cumplido! Sigue: {blockLabel(nextB, plan.names)}</> : "¡Último bloque cumplido!") : <><span className="tabular-nums">{formatClock(left)}</span> restantes · bloque {plan.idx + 1} de {plan.blocks.length}</>}
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => nextBlock(router.push))}
        className={cn("inline-flex h-9 shrink-0 items-center gap-1 rounded-xl px-3 font-semibold", over ? "bg-success-ink text-on-status" : "bg-primary-soft text-primary")}
      >
        {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
        {nextB ? "Siguiente" : "Terminar"} <ArrowRight size={15} aria-hidden />
      </button>
      <button type="button" onClick={() => stopPlan()} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-muted" aria-label="Salir del modo estudio">
        <X size={15} />
      </button>
    </div>
  );
}
