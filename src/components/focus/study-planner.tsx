"use client";

import { Brain, Clock, Coffee, Loader2, Play, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Confetti } from "@/components/celebrate";
import { LanguageMark } from "@/components/language-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { BREAK_ACTIVITIES, peakLabel, type BestTime } from "@/lib/engine/focus";
import type { Allocation } from "@/lib/engine/multilang";
import { ACTIVITY_META, type StudyPlan } from "@/lib/engine/study-plan";
import { goToCurrentBlock } from "./plan-bar";
import { startPlan, stopPlan, useActivePlan } from "./plan-store";

/** Colores por idioma en la línea de tiempo (por orden). */
const LANG_COLORS = ["var(--primary)", "var(--skill-listening)", "var(--skill-writing)", "var(--skill-grammar)", "var(--skill-speaking)", "var(--skill-reading)"];

export function StudyPlanner({
  plans,
  names,
  span,
  best,
  defaultMinutes,
  reasons,
  done,
  achievements = [],
}: {
  plans: Record<number, StudyPlan>;
  names: Record<string, { name: string; flag: string }>;
  span: number;
  best: BestTime | null;
  defaultMinutes: number;
  reasons: Allocation[];
  done: boolean;
  achievements?: string[];
}) {
  const durations = Object.keys(plans).map(Number).sort((a, b) => a - b);
  const [minutes, setMinutes] = useState(durations.includes(defaultMinutes) ? defaultMinutes : durations[0]!);
  const plan = plans[minutes]!;
  const active = useActivePlan();
  const router = useRouter();
  const [pending, start] = useTransition();
  const codes = Object.keys(names);
  const color = (code: string) => LANG_COLORS[Math.max(0, codes.indexOf(code)) % LANG_COLORS.length]!;
  const why = new Map(reasons.map((r) => [r.code, r.reasons]));
  const langsInPlan = [...new Set(plan.blocks.flatMap((b) => (b.kind === "study" ? [b.code] : [])))];
  const breakMin = plan.total - plan.studyMinutes;

  const begin = () =>
    start(async () => {
      const p = startPlan(plan.blocks, names);
      await goToCurrentBlock(p, router.push);
    });

  return (
    <div className="space-y-6">
      {done && (
        <div className="card relative overflow-hidden p-6 text-center animate-pop-in">
          <Confetti />
          <p className="text-4xl" aria-hidden>🏁</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">¡Plan completado!</h2>
          <p className="mt-1 text-muted">Estudio con pausas en el momento justo: así se aprende más con el mismo tiempo. Mañana te espera otro plan a tu medida.</p>
          {achievements.length > 0 && (
            <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Nuevos logros">
              {achievements.map((a) => <li key={a} className="rounded-full bg-warning-soft px-3 py-1 text-sm font-semibold">{a}</li>)}
            </ul>
          )}
        </div>
      )}

      {active && (
        <div className="card flex flex-col gap-3 border-primary p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm"><strong>Tienes un plan en curso</strong> · bloque {active.idx + 1} de {active.blocks.length}</p>
          <div className="flex gap-2">
            <Button size="sm" disabled={pending} onClick={() => start(() => goToCurrentBlock(active, router.push))}>Continuar</Button>
            <Button size="sm" variant="ghost" onClick={() => stopPlan()}>Descartar</Button>
          </div>
        </div>
      )}

      <section className="card p-5" aria-labelledby="dur-title">
        <h2 id="dur-title" className="flex items-center gap-2 font-semibold"><Clock size={18} className="text-primary" aria-hidden /> ¿Cuánto tiempo tienes?</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Duración">
          {durations.map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={d === minutes}
              onClick={() => setMinutes(d)}
              className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", d === minutes ? "bg-primary text-on-primary shadow" : "bg-surface-muted text-muted hover:text-text")}
            >
              {d < 60 ? `${d} min` : d % 60 ? `${Math.floor(d / 60)} h ${d % 60}` : `${d / 60} h`}
            </button>
          ))}
        </div>

        {/* Línea de tiempo proporcional */}
        <div className="mt-6 flex h-5 w-full overflow-hidden rounded-full bg-surface-muted" aria-hidden>
          {plan.blocks.map((b, i) => (
            <div
              key={i}
              className={cn("h-full border-r-2 border-surface last:border-r-0 transition-all duration-500", b.kind === "break" && "bg-[repeating-linear-gradient(45deg,var(--success-soft),var(--success-soft)_4px,transparent_4px,transparent_8px)]")}
              style={{ width: `${(b.minutes / plan.total) * 100}%`, background: b.kind === "study" ? color(b.code) : undefined, opacity: b.kind === "study" && b.activity !== "session" && b.activity !== "review" ? 0.7 : 1 }}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {plan.studyMinutes} min de estudio{breakMin > 0 ? ` · ${breakMin} min de descanso` : ""} · {langsInPlan.length} {langsInPlan.length === 1 ? "idioma" : "idiomas"}
        </p>

        <ol className="stagger mt-4 space-y-2" aria-label="Bloques del plan">
          {plan.blocks.map((b, i) =>
            b.kind === "study" ? (
              <li key={`${minutes}-${i}`} className="flex items-center gap-3 rounded-2xl bg-surface-muted/60 p-3">
                <span className="relative">
                  <LanguageMark code={b.code} size={36} />
                  <span className="absolute -bottom-1 -right-1 text-base" aria-hidden>{ACTIVITY_META[b.activity].icon}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{ACTIVITY_META[b.activity].label} · {names[b.code]?.name ?? b.code}</p>
                  {i === plan.blocks.findIndex((x) => x.kind === "study" && x.code === b.code) && why.get(b.code)?.length ? (
                    <p className="truncate text-xs text-muted">{why.get(b.code)!.join(" · ")}</p>
                  ) : null}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold tabular-nums"><span className="size-2 rounded-full" style={{ background: color(b.code) }} aria-hidden />{b.minutes} min</span>
              </li>
            ) : (
              <li key={`${minutes}-${i}`} className="flex items-center gap-3 rounded-2xl border border-dashed border-success/50 px-3 py-2 text-sm text-muted">
                <span className="grid size-9 place-items-center text-lg" aria-hidden>{BREAK_ACTIVITIES[b.activity].icon}</span>
                <span className="flex-1">Descanso: {BREAK_ACTIVITIES[b.activity].title.toLowerCase()}</span>
                <span className="text-xs font-semibold tabular-nums">{b.minutes} min</span>
              </li>
            ),
          )}
        </ol>

        <Button size="lg" className="mt-5 w-full" onClick={begin} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" size={18} aria-hidden /> : <Play size={18} aria-hidden />} Empezar plan de {minutes} min
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Cómo se calcula">
        <div className="card p-4">
          <Brain size={20} className="text-primary" aria-hidden />
          <p className="mt-2 font-semibold">Tu atención: ~{span} min</p>
          <p className="mt-1 text-sm text-muted">Aprendida de tus sesiones: el minuto en que tu precisión empieza a bajar. Los descansos caen justo antes.</p>
        </div>
        <div className="card p-4">
          <Sun size={20} className="text-warning-ink" aria-hidden />
          {best ? (
            <>
              <p className="mt-2 font-semibold">Rindes mejor {best.label}</p>
              <p className="mt-1 text-sm text-muted">Sobre todo {peakLabel(best.peakHour)}: {best.accuracy} % de aciertos, {best.lift} puntos más que tu media{best.confident ? "" : " (aún con pocos datos)"}.</p>
            </>
          ) : (
            <>
              <p className="mt-2 font-semibold">Tu mejor hora</p>
              <p className="mt-1 text-sm text-muted">Estudia a distintas horas unos días y te diré cuándo rindes más.</p>
            </>
          )}
        </div>
        <div className="card p-4">
          <Coffee size={20} className="text-success-ink" aria-hidden />
          <p className="mt-2 font-semibold">Descansos que ayudan</p>
          <p className="mt-1 text-sm text-muted">Pausas cortas y activas (vista, respiración, moverte) consolidan la memoria y separan idiomas parecidos.</p>
        </div>
      </section>
    </div>
  );
}
