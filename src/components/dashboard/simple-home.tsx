import { ArrowRight, BookOpen, CalendarCheck, CircleHelp, Clock, Gauge, Lightbulb, Repeat } from "lucide-react";
import { InstallApp } from "@/components/install-app";
import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardData } from "@/lib/services/insights";
import type { NextStep } from "@/lib/engine/next-step";

const STEP_EMOJI: Record<NextStep["kind"], string> = { review: "🔁", letters: "🔤", phase: "🔤", writing: "✍️", lesson: "🧭", session: "✨", story: "📚", done: "🌟" };

/**
 * Inicio del modo sencillo: una acción principal enorme, frases claras en
 * lugar de métricas y ninguna decisión obligatoria. Pensado para personas que
 * no usan muchas apps (o que sólo quieren practicar sin pensar).
 */
export function SimpleHome({ d, languageName, greeting, step }: { d: DashboardData; languageName: string; dailyMinutes: number; greeting: string; step: NextStep }) {
  const lang = languageName.toLowerCase();
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex items-center gap-4 animate-rise">
        <Mascot size={72} mood={d.studiedToday ? "cheer" : "happy"} className="hidden shrink-0 sm:block" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{greeting}{d.greetingName ? `, ${d.greetingName}` : ""}</h1>
          <p className="mt-1 text-lg text-muted">
            {d.studiedToday ? "¡Ya practicaste hoy! Si quieres, puedes seguir un poco más." : `Vamos a practicar ${lang}.`}
          </p>
        </div>
      </header>

      {/* Un solo botón: la app decide qué toca ahora (lección, repaso, práctica o historia). */}
      <Card className={step.kind === "done" ? "border-2 border-success bg-success-soft/40 p-6 sm:p-8" : "border-2 border-primary p-6 sm:p-8"}>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Lo siguiente</p>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-5xl" aria-hidden>{STEP_EMOJI[step.kind]}</span>
          <div>
            <h2 className="font-display text-3xl font-extrabold">{step.title}</h2>
            <p className="mt-1 text-lg text-muted">{step.subtitle}</p>
          </div>
        </div>
        <ButtonLink href={step.href} size="lg" className="mt-6 h-20 w-full text-2xl">
          {step.kind === "done" ? "Un poquito más" : "Seguir aprendiendo"} <ArrowRight size={26} aria-hidden />
        </ButtonLink>
        {!d.assessed && (step.kind === "lesson" || step.kind === "phase") && (
          <p className="mt-4 text-center text-muted">
            ¿Ya sabes algo de {lang}?{" "}
            <Link href="/app/assessment" className="font-semibold text-primary underline-offset-4 hover:underline"><Gauge size={15} className="mr-1 inline" aria-hidden />Hacer el test de nivel</Link>
          </p>
        )}
      </Card>

      {d.dueCount > 0 && step.kind !== "review" && (
        <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary" aria-hidden><Repeat size={26} /></span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-extrabold">{d.dueCount === 1 ? "Tienes 1 palabra para repasar" : `Tienes ${d.dueCount} palabras para repasar`}</h2>
            <p className="text-muted">Es el mejor momento: justo antes de que se te olviden.</p>
          </div>
          <ButtonLink href="/app/review" variant="secondary" size="lg" className="w-full sm:w-auto">Repasar</ButtonLink>
        </Card>
      )}

      <section aria-label="Tus avances" className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: CalendarCheck, color: "var(--skill-listening)", value: d.streak, text: d.streak === 1 ? "día seguido practicando" : "días seguidos practicando" },
          { icon: BookOpen, color: "var(--skill-vocabulary)", value: d.wordsLearned, text: d.wordsLearned === 1 ? "palabra que ya sabes" : "palabras que ya sabes" },
          { icon: Clock, color: "var(--skill-reading)", value: d.weekMinutes, text: "minutos esta semana" },
        ].map((s) => (
          <div key={s.text} className="card flex items-center gap-4 p-5 sm:flex-col sm:items-start">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl" style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 14%, transparent)` }} aria-hidden>
              <s.icon size={24} />
            </span>
            <p><span className="block font-display text-3xl font-extrabold">{s.value}</span><span className="text-muted">{s.text}</span></p>
          </div>
        ))}
      </section>

      <Card className="flex gap-4 bg-primary-soft p-6">
        <Lightbulb size={26} className="mt-0.5 shrink-0 text-primary" aria-hidden />
        <div>
          <h2 className="font-display text-lg font-extrabold">Consejo de hoy</h2>
          <p className="mt-1 text-lg">{d.recommendation.reason}</p>
        </div>
      </Card>

      {d.wordOfDay && (
        <Card className="p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-muted">Palabra del día</p>
          <p className="mt-1 font-display text-3xl font-extrabold">{d.wordOfDay.lemma}</p>
          <p className="text-xl">{d.wordOfDay.translation.slice(0, 2).join(", ")}</p>
          {d.wordOfDay.example?.translation && <p className="mt-2 text-lg text-muted">«{d.wordOfDay.example.text}» — {d.wordOfDay.example.translation}</p>}
        </Card>
      )}

      <InstallApp compact />

      <nav aria-label="Otras formas de practicar" className="grid gap-3 sm:grid-cols-3">
        <Link href="/app/read" className="card lift flex items-center gap-3 p-5 text-lg font-semibold hover:border-primary">
          <span className="text-2xl" aria-hidden>📖</span> Leer
        </Link>
        <Link href="/app/listen" className="card lift flex items-center gap-3 p-5 text-lg font-semibold hover:border-primary">
          <span className="text-2xl" aria-hidden>🎧</span> Escuchar
        </Link>
        <Link href="/app/speak" className="card lift flex items-center gap-3 p-5 text-lg font-semibold hover:border-primary">
          <span className="text-2xl" aria-hidden>🎙️</span> Hablar
        </Link>
      </nav>

      <nav aria-label="Más opciones" className="grid gap-3 sm:grid-cols-2">
        <Link href="/app/vocabulary" className="card flex items-center gap-3 p-5 text-lg font-semibold hover:border-primary">
          <BookOpen size={22} className="text-primary" aria-hidden /> Ver mis palabras
        </Link>
        <Link href="/app?tutorial=1" className="card flex items-center gap-3 p-5 text-lg font-semibold hover:border-primary">
          <CircleHelp size={22} className="text-primary" aria-hidden /> ¿Cómo funciona? Ver el tutorial
        </Link>
      </nav>
    </div>
  );
}
