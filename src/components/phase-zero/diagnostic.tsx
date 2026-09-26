"use client";
import { ArrowRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { placePhaseZeroAction, type PlacementResult } from "@/app/app/phase-actions";
import { Afi } from "@/components/afi/afi";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DiagnosticItem } from "@/lib/engine/phase-zero";

/**
 * «¿Sabes leer esto?»: ocho letras de dificultad creciente, sin corregir una
 * a una (es una prueba rápida, no un examen). Al final, el servidor coloca al
 * alumno en su punto de la Fase 0.
 */
export function PhaseDiagnostic({ items, language, rtl, languageName }: { items: DiagnosticItem[]; language: string; rtl: boolean; languageName: string }) {
  const [pos, setPos] = useState(0);
  const [answers, setAnswers] = useState<{ id: string; response: string }[]>([]);
  const [result, setResult] = useState<PlacementResult | "saving" | "error" | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const item = items[pos];

  // Cada letra nueva: el foco va a la pregunta (el lector de pantalla la anuncia).
  useEffect(() => {
    heading.current?.focus();
  }, [pos]);

  const answer = async (response: string) => {
    const next = [...answers, { id: item!.id, response }];
    setAnswers(next);
    if (pos + 1 < items.length) return setPos(pos + 1);
    setResult("saving");
    const r = await placePhaseZeroAction(next);
    setResult(r.ok ? r.data : "error");
  };

  if (result === "saving") {
    return <div className="grid place-items-center py-20" aria-live="polite"><Loader2 className="animate-spin text-primary" aria-label="Calculando tu punto de partida" /></div>;
  }
  if (result === "error") {
    return (
      <div className="card p-6 text-center" role="alert">
        <p className="font-semibold">No pudimos guardar el resultado.</p>
        <ButtonLink href="/app/start" className="mt-4">Volver</ButtonLink>
      </div>
    );
  }
  if (result) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center animate-rise" role="status">
        <Afi size={110} mood="curious" />
        <h1 className="font-display text-3xl font-extrabold">{result.skipAll ? `¡Ya sabes leer ${languageName.toLowerCase()}!` : result.correct === 0 ? "Empezamos desde cero" : `Reconoces ${result.correct} de ${result.total}`}</h1>
        <p className="max-w-md text-muted">
          {result.skipAll
            ? "Saltas el paso de aprender a leer y vas directo al Camino guiado. Puedes repasar las letras cuando quieras."
            : result.correct === 0
              ? "Perfecto: así aprenderás cada letra bien desde el principio."
              : "Te saltamos lo que ya dominas y empiezas justo donde te hace falta."}
        </p>
        {result.skipAll || !result.next ? (
          <ButtonLink href="/app/course" size="lg">Ir al Camino guiado <ArrowRight size={18} aria-hidden /></ButtonLink>
        ) : (
          <ButtonLink href={result.next.href} size="lg">Empezar: {result.next.title} <ArrowRight size={18} aria-hidden /></ButtonLink>
        )}
      </div>
    );
  }
  if (!item) return null;

  return (
    <div className="pb-10">
      <div className="flex items-center gap-4">
        <Link href="/app/start" aria-label="Salir de la prueba" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted"><X size={20} /></Link>
        <ProgressBar value={pos / items.length} label={`Letra ${pos + 1} de ${items.length}`} height={10} className="flex-1" />
      </div>
      <h1 ref={heading} tabIndex={-1} className="mt-6 text-sm font-semibold text-muted outline-none">
        Letra {pos + 1} de {items.length}: ¿cómo suena? Si no la conoces, pulsa «No lo sé».
      </h1>
      <div key={pos} className="card mt-3 grid place-items-center p-10 animate-rise">
        <span className="font-display text-7xl font-extrabold" lang={language} dir={rtl ? "rtl" : "ltr"}>{item.shown}</span>
      </div>
      <div className="mt-5 grid gap-2.5" role="group" aria-label="Opciones">
        {item.options.map((o) => (
          <button key={o} type="button" onClick={() => void answer(o)} className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-left text-lg font-medium transition hover:border-primary hover:bg-primary-soft/40">
            {o}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Button variant="ghost" onClick={() => void answer("")}>🤷 No lo sé</Button>
      </div>
    </div>
  );
}
