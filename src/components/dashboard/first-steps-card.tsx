import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { FirstUnit } from "@/lib/content/first-steps";

/** Inicio de un principiante: la siguiente unidad de «Primeros pasos». */
export function FirstStepsCard({ done, total, next, language }: { done: number; total: number; next: FirstUnit; language: string }) {
  return (
    <section className="card flex flex-col gap-4 border-primary bg-primary-soft/40 p-5 sm:flex-row sm:items-center animate-rise" aria-labelledby="fs-title">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-3xl shadow-sm" aria-hidden>{next.emoji}</span>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Primeros pasos · {done} de {total}</p>
        <h2 id="fs-title" className="font-display text-xl font-extrabold">{done === 0 ? `¿Empiezas de cero en ${language.toLowerCase()}? Empieza aquí` : `Siguiente: ${next.title}`}</h2>
        <p className="text-sm text-muted">{next.goal} Frases útiles, audio lento y ejercicios de escuchar y elegir.</p>
      </div>
      <ButtonLink href={`/app/first-steps/${next.id}`} size="lg">{done === 0 ? "Empezar" : "Continuar"} <ArrowRight size={18} aria-hidden /></ButtonLink>
    </section>
  );
}
