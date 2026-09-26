"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setLanguagePriorityAction, switchLanguageForBlockAction } from "@/app/app/study-actions";
import { LanguageMark } from "@/components/language-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PRIORITY_LABELS, type LanguagePriority } from "@/lib/engine/multilang";
import type { LanguageCard } from "@/lib/services/multilang";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

function lastSeen(d: number | null): string {
  if (d === null) return "Aún sin empezar";
  if (d === 0) return "Estudiado hoy";
  if (d === 1) return "Estudiado ayer";
  return `Hace ${d} días`;
}

export function LanguageCards({ cards, todayIdx }: { cards: LanguageCard[]; todayIdx: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setPriority = (code: string, p: LanguagePriority) =>
    start(async () => {
      setBusy(code);
      const r = await setLanguagePriorityAction(code, p);
      if (!r.ok) setError(r.error);
      setBusy(null);
      router.refresh();
    });

  const study = (code: string) =>
    start(async () => {
      setBusy(`go:${code}`);
      await switchLanguageForBlockAction(code);
      router.push("/app/session");
    });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {error && <p role="alert" className="text-sm text-danger-ink md:col-span-2">{error}</p>}
      {cards.map((c) => {
        const max = Math.max(10, ...c.week);
        return (
          <article key={c.code} className={cn("card flex flex-col gap-4 p-5", c.active && "border-primary")} aria-busy={busy === c.code}>
            <header className="flex items-center gap-3">
              <LanguageMark code={c.code} size={44} />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-extrabold">{c.name}</h2>
                <p className="text-sm text-muted">
                  {c.level ? <>Nivel <strong className="text-text">{c.level}</strong></> : "Nivel por medir"}
                  {c.targetLevel ? <> → meta {c.targetLevel}</> : null} · {lastSeen(c.daysSince)}
                </p>
              </div>
              {c.active && <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">Activo</span>}
            </header>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface-muted p-2"><p className="font-display text-lg font-extrabold tabular-nums">{c.due}</p><p className="text-[11px] text-muted">repasos</p></div>
              <div className="rounded-xl bg-surface-muted p-2"><p className="font-display text-lg font-extrabold tabular-nums">{c.minutesToday}</p><p className="text-[11px] text-muted">min hoy</p></div>
              <div className="rounded-xl bg-surface-muted p-2"><p className="font-display text-lg font-extrabold tabular-nums">{c.minutesWeek}</p><p className="text-[11px] text-muted">min semana</p></div>
            </div>

            <div>
              <div className="flex h-14 items-end gap-1.5" role="img" aria-label={`Minutos por día, última semana: ${c.week.join(", ")}`}>
                {c.week.map((m, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center">
                    <div className={cn("w-full rounded-md transition-all", m > 0 ? "bg-primary" : "bg-surface-muted")} style={{ height: `${Math.max(6, (m / max) * 44)}px`, opacity: i === 6 ? 1 : 0.55 }} />
                  </div>
                ))}
              </div>
              <div className="mt-1 flex gap-1.5 text-center text-[10px] text-muted" aria-hidden>
                {c.week.map((_, i) => <span key={i} className="flex-1">{DAYS[(todayIdx - 6 + i + 70) % 7]}</span>)}
              </div>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold text-muted">Prioridad</legend>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-muted p-1">
                {(Object.keys(PRIORITY_LABELS) as LanguagePriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={c.priority === p}
                    disabled={pending}
                    title={PRIORITY_LABELS[p].hint}
                    onClick={() => c.priority !== p && setPriority(c.code, p)}
                    className={cn("rounded-lg px-2 py-1.5 text-xs font-semibold transition", c.priority === p ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-text")}
                  >
                    {PRIORITY_LABELS[p].label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted">{PRIORITY_LABELS[c.priority].hint}</p>
            </fieldset>

            <Button variant={c.active ? "primary" : "secondary"} className="mt-auto" disabled={pending} onClick={() => study(c.code)}>
              {busy === `go:${c.code}` ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null} Estudiar {c.name.toLowerCase()} ahora <ArrowRight size={16} aria-hidden />
            </Button>
          </article>
        );
      })}
    </div>
  );
}
