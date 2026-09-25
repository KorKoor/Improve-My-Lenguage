import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Lesson } from "@/lib/engine/course";
import { alphabetDue } from "@/lib/engine/next-step";

/** Inicio de un principiante: la siguiente lección del Camino guiado, sin decidir nada. */
export function CourseCard({ lesson, done, total, language, big = false, alphabet }: { lesson: Lesson; done: number; total: number; language: string; big?: boolean; alphabet?: { done: number; total: number; name: string } }) {
  // Idiomas de otra escritura: primero las letras (van dos grupos por delante de las lecciones).
  if (alphabet && alphabetDue(alphabet, done)) {
    return (
      <section className="card flex flex-col gap-4 border-2 border-primary bg-primary-soft/40 p-5 animate-rise" aria-labelledby="course-title">
        <div className="flex items-center gap-4">
          <span className={big ? "grid size-16 shrink-0 place-items-center rounded-2xl bg-surface text-4xl shadow-sm" : "grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-3xl shadow-sm"} aria-hidden>🔤</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Camino guiado · antes de la lección {lesson.n}</p>
            <h2 id="course-title" className={big ? "font-display text-2xl font-extrabold" : "font-display text-xl font-extrabold"}>{alphabet.done === 0 ? `Aprende a leer ${language.toLowerCase()}` : `${alphabet.name}: grupo ${alphabet.done + 1}`}</h2>
            <p className="text-sm text-muted">El {language.toLowerCase()} usa otras letras. Tócalas para oír cómo suenan y practícalas en un minuto.</p>
          </div>
        </div>
        <ProgressBar value={alphabet.done / alphabet.total} label={`${alphabet.done} de ${alphabet.total} grupos de letras`} height={8} />
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="/app/alphabet" size="lg" className={big ? "h-16 w-full text-xl" : ""}>
            {alphabet.done === 0 ? "Empezar por las letras" : "Seguir con las letras"} <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          {!big && <Link href={`/app/session?lesson=${lesson.n}`} className="text-sm font-semibold text-primary hover:underline">Ir a la lección {lesson.n}</Link>}
        </div>
      </section>
    );
  }
  return (
    <section className="card flex flex-col gap-4 border-2 border-primary bg-primary-soft/40 p-5 animate-rise" aria-labelledby="course-title">
      <div className="flex items-center gap-4">
        <span className={big ? "grid size-16 shrink-0 place-items-center rounded-2xl bg-surface text-4xl shadow-sm" : "grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-3xl shadow-sm"} aria-hidden>{lesson.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Camino guiado · lección {lesson.n} de {total}</p>
          <h2 id="course-title" className={big ? "font-display text-2xl font-extrabold" : "font-display text-xl font-extrabold"}>{done === 0 ? `Empieza ${language.toLowerCase()} desde cero` : lesson.title}</h2>
          <p className="text-sm text-muted">{lesson.goal}</p>
        </div>
      </div>
      <ProgressBar value={done / total} label={`${done} de ${total} lecciones`} height={8} />
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href={`/app/session?lesson=${lesson.n}`} size="lg" className={big ? "h-16 w-full text-xl" : ""}>
          {done === 0 ? "Empezar" : "Continuar"} <ArrowRight size={18} aria-hidden />
        </ButtonLink>
        {!big && <Link href="/app/course" className="text-sm font-semibold text-primary hover:underline">Ver las 30 lecciones</Link>}
      </div>
    </section>
  );
}
