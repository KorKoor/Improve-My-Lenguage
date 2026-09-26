"use client";

import { Coffee, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BreakCoach } from "./break-coach";
import { FOCUS_SNOOZE, FOCUS_START, markBreak, readClock, writeClock } from "./focus-clock";

const START = FOCUS_START;
const SNOOZE = FOCUS_SNOOZE;
/** Una ausencia más larga que esto ya cuenta como descanso. */
const AWAY_RESET_MS = 5 * 60_000;
const get = readClock;
const set = writeClock;

/**
 * Guardián de foco para toda la app: cuenta el tiempo de uso continuado (la
 * pestaña visible) y, al superar ~1,5× tu capacidad de atención sin pausa,
 * propone un descanso guiado. Irse más de 5 minutos cuenta como descanso.
 */
export function FocusGuard({ span }: { span: number }) {
  const [ask, setAsk] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const limitMs = Math.max(15, Math.round(span * 1.5)) * 60_000;

  useEffect(() => {
    if (!get(START)) set(START, Date.now());
    let hiddenAt = 0;
    let lastInput = Date.now();
    const onVis = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > AWAY_RESET_MS) set(START, Date.now());
    };
    // Sin tocar nada durante un rato también es una pausa.
    const onInput = () => {
      const now = Date.now();
      if (now - lastInput > AWAY_RESET_MS) set(START, now);
      lastInput = now;
    };
    const check = () => {
      if (document.hidden) return;
      const now = Date.now();
      if (now - lastInput > AWAY_RESET_MS) return;
      if (now - get(START) >= limitMs && now >= get(SNOOZE)) setAsk(true);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointerdown", onInput, { passive: true });
    window.addEventListener("keydown", onInput);
    const t = setInterval(check, 30_000);
    check();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onInput);
      window.removeEventListener("keydown", onInput);
      clearInterval(t);
    };
  }, [limitMs]);

  if (breaking) {
    return (
      <BreakCoach
        seconds={180}
        activity="stretch"
        why={`Llevas más de ${Math.round(limitMs / 60_000)} minutos seguidos. Tres minutos de pausa y vuelves con la cabeza fresca.`}
        nextLabel="Seguir"
        onDone={() => {
          markBreak();
          setBreaking(false);
          setAsk(false);
        }}
      />
    );
  }
  if (!ask) return null;
  const minutes = Math.round((Date.now() - get(START)) / 60_000);
  return (
    <div role="status" className="fixed inset-x-3 top-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-success/40 bg-surface p-3 text-sm shadow-lg animate-sheet">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success-ink"><Coffee size={20} aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Llevas {minutes} min seguidos</p>
        <p className="text-muted">Una pausa corta ahora mejora lo que recuerdas después.</p>
      </div>
      <Button size="sm" variant="success" onClick={() => setBreaking(true)}>Pausa</Button>
      <button
        type="button"
        className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-muted"
        aria-label="Ahora no"
        onClick={() => {
          set(SNOOZE, Date.now() + 15 * 60_000);
          setAsk(false);
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
