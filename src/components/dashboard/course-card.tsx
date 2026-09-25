import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Lesson } from "@/lib/engine/course";

/** Inicio de un principiante: la siguiente lección del Camino guiado, sin decidir nada. */
export function CourseCard({ lesson, done, total, language, big = false }: { lesson: Lesson; done: number; total: number; language: string; big?: boolean }) {
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
