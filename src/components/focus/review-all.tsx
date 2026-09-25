"use client";

import { Loader2, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { orderForInterference, reviewMinutes } from "@/lib/engine/multilang";
import type { PlanBlock } from "@/lib/engine/study-plan";
import { goToCurrentBlock } from "./plan-bar";
import { startPlan } from "./plan-store";

/**
 * «Repasar todos»: encadena los repasos pendientes de cada idioma en un plan
 * del modo estudio (idiomas cercanos separados por una micro-pausa).
 */
export function ReviewAll({ langs }: { langs: { code: string; name: string; flag: string; due: number }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const withDue = orderForInterference(langs.filter((l) => l.due > 0).sort((a, b) => b.due - a.due));
  if (withDue.length < 2) return null;
  const total = withDue.reduce((a, l) => a + Math.max(2, reviewMinutes(l.due)), 0);
  const due = withDue.reduce((a, l) => a + l.due, 0);

  const go = () =>
    start(async () => {
      const blocks: PlanBlock[] = [];
      withDue.forEach((l, i) => {
        if (i > 0) blocks.push({ kind: "break", minutes: 1, activity: i % 2 ? "eyes" : "breathe" });
        blocks.push({ kind: "study", code: l.code, activity: "review", minutes: Math.max(2, reviewMinutes(l.due)) });
      });
      const plan = startPlan(blocks, Object.fromEntries(langs.map((l) => [l.code, { name: l.name, flag: l.flag }])));
      await goToCurrentBlock(plan, router.push);
    });

  return (
    <Button variant="secondary" onClick={go} disabled={pending} className="w-full">
      {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Repeat size={16} aria-hidden />}
      Repasar todos · {due} en {withDue.length} idiomas (≈ {total} min)
    </Button>
  );
}
