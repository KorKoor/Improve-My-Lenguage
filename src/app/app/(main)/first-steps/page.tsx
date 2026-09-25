import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { FIRST_STEPS, hasFirstSteps, unitPhrases } from "@/lib/content/first-steps";
import { getFirstSteps } from "@/lib/db/repositories";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Primeros pasos" };

export default async function FirstStepsPage() {
  const learner = await requireLearner();
  const lang = learner.language;
  if (!hasFirstSteps(lang.code)) {
    return (
      <div className="card p-6">
        <h1 className="font-display text-2xl font-extrabold">Primeros pasos</h1>
        <p className="mt-2 text-muted">Todavía no hay frases de inicio para {lang.name.toLowerCase()}. Empieza con una sesión: los primeros ejercicios son de elegir y escuchar.</p>
        <ButtonLink href="/app/session" className="mt-4">Empezar sesión</ButtonLink>
      </div>
    );
  }
  const progress = await getFirstSteps(learner.ul.id);
  const done = FIRST_STEPS.filter((u) => progress[u.id]).length;
  const nextUnit = FIRST_STEPS.find((u) => !progress[u.id]) ?? FIRST_STEPS[0]!;

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Primeros pasos en {lang.name.toLowerCase()}</h1>
        <p className="mt-1 max-w-2xl text-muted">
          ¿No sabes nada todavía? Perfecto: empieza aquí. Seis unidades cortas con las frases que más vas a usar, audio lento y ejercicios de escuchar y elegir. Nada de escribir de memoria.
        </p>
      </header>

      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted">{done} de {FIRST_STEPS.length} unidades</p>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {FIRST_STEPS.map((u) => <span key={u.id} className={cn("h-2.5 flex-1 rounded-full", progress[u.id] ? "bg-success" : "bg-surface-muted")} />)}
          </div>
        </div>
        <ButtonLink href={`/app/first-steps/${nextUnit.id}`} size="lg">
          {done === 0 ? "Empezar" : done === FIRST_STEPS.length ? "Repasar" : "Continuar"} <ArrowRight size={18} aria-hidden />
        </ButtonLink>
      </section>

      <ol className="stagger grid gap-3 sm:grid-cols-2">
        {FIRST_STEPS.map((u, i) => {
          const stars = progress[u.id] ?? 0;
          const sample = unitPhrases(u, lang.code).slice(0, 3);
          return (
            <li key={u.id} className="min-w-0">
              <Link href={`/app/first-steps/${u.id}`} className={cn("card lift flex h-full gap-4 p-5 hover:border-primary", stars > 0 && "border-success/50")}>
                <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-3xl", stars > 0 ? "bg-success-soft" : "bg-primary-soft")} aria-hidden>{u.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted">Unidad {i + 1}</p>
                  <h2 className="font-display text-lg font-extrabold">{u.title}</h2>
                  <p className="text-sm text-muted">{u.goal}</p>
                  <p className="mt-2 truncate text-sm" lang={lang.code} dir={lang.rtl ? "rtl" : "ltr"}>{sample.map((s) => s.text).join(" · ")}</p>
                </div>
                <span className="shrink-0 text-sm" aria-label={stars ? `${stars} estrellas` : "Sin empezar"}>
                  {stars ? <><Check size={16} className="inline text-success" aria-hidden /> {"⭐".repeat(stars)}</> : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="text-sm text-muted">
        Al terminar, sigue con la <Link href="/app/session" className="font-semibold text-primary hover:underline">sesión diaria</Link>: vocabulario básico con repetición espaciada, empezando por reconocer.
      </p>
    </div>
  );
}
