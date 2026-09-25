import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AccessibleInvite, SkipPhase, StartChoice } from "@/components/phase-zero/start-actions";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { PhaseUnitKind } from "@/lib/engine/phase-zero";
import { phaseZeroState, unitHref } from "@/lib/services/phase-zero";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Aprender a leer" };

const SECTIONS: { kind: PhaseUnitKind; title: string; about: string }[] = [
  { kind: "letters", title: "Letras y sonidos", about: "Cómo se escribe cada sonido. Toca cualquier letra para oírla." },
  { kind: "strokes", title: "Cómo se trazan", about: "El orden de los trazos de los signos más sencillos." },
  { kind: "rules", title: "Reglas para leer bien", about: "Una regla por pantalla, con ejemplos que suenan." },
  { kind: "words", title: "Tus primeras palabras", about: "Sólo palabras con letras que ya conoces." },
  { kind: "phrases", title: "Tus primeras frases", about: "Saludar y presentarte con lo que ya lees." },
];

/**
 * Fase 0 «aprender a leer y a sonar»: la portada. Muestra el camino completo
 * (letras → trazos → reglas → palabras → frases), el siguiente paso y, la
 * primera vez, la elección entre empezar de cero o hacer la prueba de 1 minuto.
 */
export default async function StartPage() {
  const learner = await requireLearner();
  const lang = learner.language;
  const st = await phaseZeroState(learner);
  const { units, done, progress } = st;
  const pending = units.find((u) => !done.has(u.id)) ?? null;
  const count = units.filter((u) => done.has(u.id)).length;
  const firstTime = !st.diagnosed && count === 0 && !progress.complete;

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Aprender a leer {lang.name.toLowerCase()}</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Antes de las lecciones: las letras y cómo suenan, las reglas para leer bien y tus primeras palabras. Todo tiene audio: toca cualquier cosa para oírla. Nunca te pediremos leer algo con letras que aún no has visto.
        </p>
      </header>

      {firstTime && pending && <StartChoice firstHref={unitHref(pending)} language={lang.name} audioFirst={learner.profile.audioFirst} />}

      <AccessibleInvite enabled={learner.profile.audioFirst} />

      {!firstTime && (
        <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center" aria-labelledby="p0-progress">
          <div className="flex-1">
            <h2 id="p0-progress" className="text-sm font-semibold text-muted">{count} de {units.length} pasos</h2>
            <ProgressBar value={count / units.length} label={`${count} de ${units.length} pasos para aprender a leer`} height={10} className="mt-2" />
            {pending && <p className="mt-2 text-sm">Siguiente: <strong>{pending.title}</strong></p>}
          </div>
          {pending ? (
            <ButtonLink href={unitHref(pending)} size="lg">{count === 0 ? "Empezar" : "Continuar"} <ArrowRight size={18} aria-hidden /></ButtonLink>
          ) : (
            <ButtonLink href="/app/course" size="lg">¡Ya sabes leer! Al Camino guiado <ArrowRight size={18} aria-hidden /></ButtonLink>
          )}
        </section>
      )}

      {SECTIONS.filter((sec) => units.some((u) => u.kind === sec.kind)).map((sec, si) => {
        const list = units.filter((u) => u.kind === sec.kind);
        return (
          <section key={sec.kind} aria-labelledby={`sec-${sec.kind}`}>
            <h2 id={`sec-${sec.kind}`} className="font-display text-xl font-extrabold">{si + 1}. {sec.title}</h2>
            <p className="text-sm text-muted">{sec.about}</p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {list.map((u) => {
                const ok = done.has(u.id);
                const current = pending?.id === u.id;
                return (
                  <li key={u.id} className="min-w-0">
                    <Link href={unitHref(u)} aria-current={current ? "step" : undefined} className={cn("card lift flex items-center gap-3 p-3 hover:border-primary", current && "border-2 border-primary bg-primary-soft/40")}>
                      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold", ok ? "bg-success text-white" : current ? "bg-primary text-on-primary" : "bg-surface-muted text-muted")}>
                        {ok ? <Check size={18} aria-label="Hecho" /> : u.n}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 font-semibold"><span aria-hidden>{u.emoji}</span> {u.title}</span>
                        <span className="block text-xs text-muted">{u.goal}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      <p className="text-center"><SkipPhase skipped={progress.complete && Boolean(pending)} /></p>
    </div>
  );
}
