import { AlertTriangle, CalendarDays, Globe2, Plus, Timer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LanguageCards } from "@/components/focus/language-cards";
import { ReviewAll } from "@/components/focus/review-all";
import { LanguageMark } from "@/components/language-mark";
import { ButtonLink } from "@/components/ui/button";
import { languagesOverview, type LanguageCard } from "@/lib/services/multilang";
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
          <div className="flex flex-col gap-2 sm:w-64">
            <ButtonLink href="/app/study">Abrir modo estudio</ButtonLink>
            <ReviewAll langs={o.cards.map((c) => ({ code: c.code, name: c.name, flag: c.flag, due: c.due }))} />
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

      <ForecastCard cards={o.cards} todayIdx={todayIdx < 0 ? 0 : todayIdx} />

      {o.tips.length > 0 && (
        <section aria-labelledby="tips-title" className="space-y-3">
          <h2 id="tips-title" className="flex items-center gap-2 font-display text-xl font-extrabold"><Globe2 size={20} className="text-primary" aria-hidden /> Para que no se mezclen</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {o.tips.map((t) => (
              <li key={`${t.a}-${t.b}`} className="card flex gap-3 p-4 text-sm">
                <span className="flex shrink-0 -space-x-2"><LanguageMark code={t.a} size={30} /><LanguageMark code={t.b} size={30} className="ring-2 ring-surface" /></span>
                <p>{t.level === 2 && <AlertTriangle size={14} className="mr-1 inline text-warning-ink" aria-label="Atención" />}{t.text}</p>
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

const FORECAST_COLORS = ["var(--primary)", "var(--skill-listening)", "var(--skill-writing)", "var(--skill-grammar)", "var(--skill-speaking)", "var(--skill-reading)"];
const WEEKDAYS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const WEEKDAYS_FULL = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/** Previsión de repasos de la semana, apilada por idioma. */
function ForecastCard({ cards, todayIdx }: { cards: LanguageCard[]; todayIdx: number }) {
  const totals = Array.from({ length: 7 }, (_, d) => cards.reduce((a, c) => a + (c.forecast[d] ?? 0), 0));
  const max = Math.max(10, ...totals);
  const sum = totals.reduce((a, b) => a + b, 0);
  const peak = totals.indexOf(Math.max(...totals));
  const minutes = (n: number) => Math.max(1, Math.round((n * 9) / 60));
  return (
    <section className="card p-5" aria-labelledby="fc-title">
      <h2 id="fc-title" className="flex items-center gap-2 font-semibold"><CalendarDays size={18} className="text-primary" aria-hidden /> Repasos que llegan esta semana</h2>
      <p className="mt-1 text-sm text-muted">
        {sum === 0
          ? "No vence nada en los próximos 7 días: buen momento para aprender material nuevo."
          : `${sum} repasos en 7 días (≈ ${minutes(sum)} min en total). El día más cargado es ${peak === 0 ? "mañana" : `el ${WEEKDAYS_FULL[(todayIdx + 1 + peak) % 7]}`}: si puedes, adelanta algo antes.`}
      </p>
      <div className="mt-4 flex h-32 items-end gap-2" role="img" aria-label={`Repasos por día: ${totals.join(", ")}`}>
        {totals.map((t, d) => (
          <div key={d} className="flex h-full flex-1 flex-col justify-end">
            <span className="mb-1 text-center text-[11px] font-semibold tabular-nums text-muted">{t || ""}</span>
            <div className="flex flex-col-reverse overflow-hidden rounded-md" style={{ height: `${(t / max) * 100}%`, minHeight: t ? 4 : 0 }}>
              {cards.map((c, i) => (c.forecast[d] ? <div key={c.code} style={{ flex: c.forecast[d], background: FORECAST_COLORS[i % FORECAST_COLORS.length] }} /> : null))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2 text-center text-[11px] text-muted" aria-hidden>
        {totals.map((_, d) => <span key={d} className="flex-1">{d === 0 ? "mañana" : WEEKDAYS[(todayIdx + 1 + d) % 7]}</span>)}
      </div>
      {cards.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
          {cards.map((c, i) => (
            <li key={c.code} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: FORECAST_COLORS[i % FORECAST_COLORS.length] }} aria-hidden />{c.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
