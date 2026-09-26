"use client";

import { Pause, Play, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { recordBreakAction } from "@/app/app/study-actions";
import { Button } from "@/components/ui/button";
import { BREAK_ACTIVITIES, type BreakActivity } from "@/lib/engine/focus";
import { cn } from "@/lib/cn";
import { markBreak } from "./focus-clock";

const BREATH = [
  { label: "Inhala", secs: 4 },
  { label: "Mantén", secs: 4 },
  { label: "Exhala", secs: 6 },
];

export function formatClock(total: number): string {
  const s = Math.max(0, Math.round(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Tono suave al terminar el descanso (sin archivos de audio). */
function chime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [660, 880].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.25);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * 0.25 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.25 + 0.9);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.25);
      o.stop(ctx.currentTime + i * 0.25 + 1);
    });
    navigator.vibrate?.(120);
  } catch {}
}

/**
 * Descanso guiado: cuenta atrás, actividad con pasos (respiración animada,
 * vista, estiramientos…) y aviso al terminar. Se puede pausar o saltar.
 */
export function BreakCoach({
  seconds,
  activity,
  why,
  onDone,
  nextLabel = "Volver a estudiar",
}: {
  seconds: number;
  activity: BreakActivity;
  why?: string;
  onDone: (completed: boolean) => void;
  nextLabel?: string;
}) {
  const a = BREAK_ACTIVITIES[activity];
  const [left, setLeft] = useState(seconds);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const done = left <= 0;
  const reported = useRef(false);

  useEffect(() => {
    if (paused || done) return;
    const t = setInterval(() => {
      setLeft((l) => l - 1);
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [paused, done]);

  useEffect(() => {
    if (done) chime();
  }, [done]);

  // Mientras dura el descanso, la página de fondo no se desplaza.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const finish = (completed: boolean) => {
    if (completed) markBreak();
    if (!reported.current) {
      reported.current = true;
      void recordBreakAction(activity, elapsed, completed);
    }
    onDone(completed);
  };

  // Fase de respiración (14 s por ciclo) y paso actual de la actividad.
  const cycle = elapsed % 14;
  const phase = cycle < 4 ? BREATH[0]! : cycle < 8 ? BREATH[1]! : BREATH[2]!;
  const stepIdx = Math.min(a.steps.length - 1, Math.floor((elapsed / Math.max(1, seconds)) * a.steps.length));
  const pct = 1 - Math.max(0, left) / seconds;
  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="break-title" onKeyDown={(e) => e.key === "Escape" && finish(done)} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-bg/95 p-4 backdrop-blur animate-fade">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="animate-drift absolute -left-16 top-10 size-64 rounded-full bg-primary-soft opacity-60 blur-3xl" />
        <div className="animate-drift absolute -right-10 bottom-10 size-72 rounded-full bg-success-soft opacity-60 blur-3xl" style={{ animationDelay: "-3s" }} />
      </div>
      <div className="relative w-full max-w-md text-center animate-rise">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Descanso inteligente</p>
        <h2 id="break-title" className="mt-1 font-display text-3xl font-extrabold">{a.icon} {a.title}</h2>
        {why && <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{why}</p>}

        <div className="relative mx-auto mt-6 grid size-56 place-items-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--success)" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          {activity === "breathe" && !done ? (
            <div className="grid size-40 place-items-center rounded-full bg-success-soft animate-breathe" style={{ animationPlayState: paused ? "paused" : "running" }}>
              <span className="font-display text-xl font-extrabold text-success-ink" aria-live="polite">{phase.label}</span>
            </div>
          ) : (
            <div className="grid size-40 place-items-center rounded-full bg-surface shadow-sm">
              <span className={cn("text-6xl", !paused && !done && "animate-float")} aria-hidden>{done ? "✨" : a.icon}</span>
            </div>
          )}
          <span className="absolute -bottom-2 rounded-full bg-surface px-3 py-1 font-display text-lg font-extrabold tabular-nums shadow-sm">
            {done ? "¡Listo!" : <><span className="sr-only">Quedan </span>{formatClock(left)}</>}
          </span>
        </div>

        {!done ? (
          <ol className="mx-auto mt-8 max-w-sm space-y-1.5 text-left text-sm">
            {a.steps.map((s, i) => (
              <li key={s} className={cn("flex gap-2 rounded-xl px-3 py-2 transition", i === stepIdx ? "bg-surface font-semibold shadow-sm" : i < stepIdx ? "text-muted line-through decoration-border" : "text-muted")}>
                <span className="tabular-nums">{i + 1}.</span> {s}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mx-auto mt-8 max-w-sm text-muted">Tu cerebro ha tenido tiempo de consolidar. Vuelves con la atención renovada.</p>
        )}

        <div className="mt-6 flex justify-center gap-2">
          {done ? (
            <Button size="lg" onClick={() => finish(true)} autoFocus>{nextLabel}</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setPaused((p) => !p)} aria-pressed={paused} autoFocus>
                {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />} {paused ? "Reanudar" : "Pausar"}
              </Button>
              <Button variant="ghost" onClick={() => finish(false)}>
                <SkipForward size={16} aria-hidden /> Saltar descanso
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
