import { ArrowRight, Check, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import { alphabetFor } from "@/lib/content/alphabets";
import { getAlphabet, getCourse } from "@/lib/db/repositories";
import { nextLesson } from "@/lib/engine/course";
import { courseFor } from "@/lib/services/learning";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Camino guiado" };

/**
 * Camino guiado A0 → A1: 30 lecciones en orden. La siguiente se destaca; las
 * que están más allá se ven pero con candado suave (se pueden abrir igual).
 */
export default async function CoursePage() {
  const learner = await requireLearner();
  const course = courseFor(learner);
  const done = await getCourse(learner.ul.id);
  const next = nextLesson(done, course.length);
  const passed = Object.keys(done).length;
  const abc = alphabetFor(learner.language.code);
  const letters = abc ? await getAlphabet(learner.ul.id) : {};
  const abcDone = abc ? abc.groups.filter((g) => letters[g.id]).length : 0;

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Camino guiado de {learner.language.name.toLowerCase()}</h1>
        <p className="mt-1 max-w-2xl text-muted">De cero a A1 en 30 lecciones de unos 10 minutos. Tú sólo pulsa «Continuar»: nosotros elegimos qué toca, con frases útiles, palabras básicas, un poco de gramática y repaso de lo anterior.</p>
      </header>

      {abc && (
        <section className={cn("card flex flex-col gap-4 p-5 sm:flex-row sm:items-center", abcDone < abc.groups.length && "border-2 border-primary bg-primary-soft/40")} aria-labelledby="abc-title">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-3xl shadow-sm" aria-hidden>🔤</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Lección 0 · antes de empezar</p>
            <h2 id="abc-title" className="font-display text-xl font-extrabold">{abc.name}</h2>
            <p className="text-sm text-muted">Sin saber leer las letras, lo demás no se entiende. Tócalas para oírlas y practícalas por grupos: {abcDone} de {abc.groups.length} hechos.</p>
            <ProgressBar value={abcDone / abc.groups.length} label={`${abcDone} de ${abc.groups.length} grupos de letras`} height={8} className="mt-2" />
          </div>
          <ButtonLink href="/app/alphabet" size="lg" variant={abcDone < abc.groups.length ? "primary" : "secondary"}>
            {abcDone === 0 ? "Empezar por las letras" : abcDone < abc.groups.length ? "Seguir con las letras" : "Repasar las letras"} <ArrowRight size={18} aria-hidden />
          </ButtonLink>
        </section>
      )}

      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted">{passed} de {course.length} lecciones</p>
          <ProgressBar value={passed / course.length} label={`${passed} de ${course.length} lecciones`} height={10} className="mt-2" />
        </div>
        <ButtonLink href={`/app/session?lesson=${next}`} size="lg">
          {passed === 0 ? "Empezar lección 1" : passed >= course.length ? "Repasar" : `Lección ${next}`} <ArrowRight size={18} aria-hidden />
        </ButtonLink>
      </section>

      <ol className="grid gap-2 sm:grid-cols-2">
        {course.map((l) => {
          const stars = done[l.n] ?? 0;
          const current = l.n === next && passed < course.length;
          const ahead = l.n > next;
          return (
            <li key={l.n} className="min-w-0">
              <Link
                href={`/app/session?lesson=${l.n}`}
                className={cn("card lift flex items-center gap-3 p-3 hover:border-primary", current && "border-2 border-primary bg-primary-soft/40", ahead && "opacity-60")}
                aria-current={current ? "step" : undefined}
              >
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold", stars ? "bg-success text-white" : current ? "bg-primary text-on-primary" : "bg-surface-muted text-muted")}>
                  {stars ? <Check size={18} aria-label="Aprobada" /> : ahead ? <Lock size={15} aria-label="Más adelante" /> : l.n}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold"><span aria-hidden>{l.emoji}</span> {l.n}. {l.title}</p>
                  <p className="truncate text-xs text-muted">{l.goal}</p>
                </div>
                {stars > 0 && <span className="shrink-0 text-xs" aria-label={`${stars} estrellas`}>{"⭐".repeat(stars)}</span>}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
