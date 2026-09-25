import { AlertTriangle, Globe2, Plus, Timer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LanguageCards } from "@/components/focus/language-cards";
import { LanguageMark } from "@/components/language-mark";
import { ButtonLink } from "@/components/ui/button";
import { languagesOverview } from "@/lib/services/multilang";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Mis idiomas" };

export default async function LanguagesPage() {
  const learner = await requireLearner();
  const o = await languagesOverview(learner);
  const names = Object.fromEntries(o.cards.map((c) => [c.code, c.name]));
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: learner.profile.timezone }).format(new Date());
  const todayIdx = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(weekday);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end gap-4 animate-rise">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-extrabold">Mis idiomas</h1>
          <p className="mt-1 max-w-2xl text-muted">Estudia varios idiomas a la vez sin descuidar ninguno: elige cuál es tu foco y cada día repartimos tu tiempo según lo que más lo necesita.</p>
        </div>
        <ButtonLink href="/app/onboarding?add=1" variant="secondary"><Plus size={16} aria-hidden /> Añadir idioma</ButtonLink>
      </header>

      <section className="card overflow-hidden p-0" aria-labelledby="today-title">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 id="today-title" className="flex items-center gap-2 font-semibold"><Timer size={18} className="text-primary" aria-hidden /> Tus {o.budget} minutos de hoy</h2>
            <ul className="mt-3 space-y-2">
              {o.allocation.map((a) => (
                <li key={a.code} className="flex items-center gap-3 text-sm">
                  <LanguageMark code={a.code} size={28} />
                  <span className="font-semibold">{names[a.code]}</span>
                  <span className="min-w-0 truncate text-muted">· {a.mode === "review" ? "repaso" : "sesión"}{a.reasons[0] ? ` · ${a.reasons[0]}` : ""}</span>
                  <span className="ml-auto shrink-0 whitespace-nowrap font-bold tabular-nums text-primary">{a.minutes} min</span>
                </li>
              ))}
            </ul>
            {o.cards.length > o.allocation.length && (
              <p className="mt-2 text-xs text-muted">Los idiomas en «Mantener» que están al día descansan hoy: la repetición espaciada los protege.</p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:w-56">
            <ButtonLink href="/app/study">Abrir modo estudio</ButtonLink>
            <p className="text-center text-xs text-muted">Con temporizador y descansos</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-surface-muted/50 text-center">
          <div className="p-3"><p className="font-display text-xl font-extrabold tabular-nums">{o.cards.length}</p><p className="text-xs text-muted">{o.cards.length === 1 ? "idioma" : "idiomas"}</p></div>
          <div className="p-3"><p className="font-display text-xl font-extrabold tabular-nums">{o.weekTotal}</p><p className="text-xs text-muted">min esta semana</p></div>
          <div className="p-3"><p className="font-display text-xl font-extrabold tabular-nums">{o.polyglotDays}</p><p className="text-xs text-muted">días políglota</p></div>
        </div>
      </section>

      <LanguageCards cards={o.cards} todayIdx={todayIdx < 0 ? 0 : todayIdx} />

      {o.tips.length > 0 && (
        <section aria-labelledby="tips-title" className="space-y-3">
          <h2 id="tips-title" className="flex items-center gap-2 font-display text-xl font-extrabold"><Globe2 size={20} className="text-primary" aria-hidden /> Para que no se mezclen</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {o.tips.map((t) => (
              <li key={`${t.a}-${t.b}`} className="card flex gap-3 p-4 text-sm">
                <span className="flex shrink-0 -space-x-2"><LanguageMark code={t.a} size={30} /><LanguageMark code={t.b} size={30} className="ring-2 ring-surface" /></span>
                <p>{t.level === 2 && <AlertTriangle size={14} className="mr-1 inline text-warning" aria-label="Atención" />}{t.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {o.cards.length === 1 && (
        <section className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-muted">¿Te animas con otro? Estudiar un segundo idioma, aunque sean 5 minutos al día, refuerza la memoria. Nosotros nos encargamos de que no se mezclen.</p>
          <Link href="/app/onboarding?add=1" className="font-semibold text-primary hover:underline">Añadir un idioma →</Link>
        </section>
      )}
    </div>
  );
}
