import { ArrowRight, BookOpen, Clock, Flame, Gauge, Headphones, MessageCircle, Newspaper, PenLine, Repeat, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BLOCK_META, SKILL_META, formatMinutes, greeting } from "@/components/app/labels";
import { QuickSearch } from "@/components/app/quick-search";
import { Heatmap } from "@/components/charts/heatmap";
import { SimpleHome } from "@/components/dashboard/simple-home";
import { WelcomeTour } from "@/components/tutorial/welcome-tour";
import { Mascot } from "@/components/mascot";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { IconBox } from "@/components/ui/icon-box";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cefrToTheta, thetaToCefr } from "@/lib/engine/levels";
import { ARCHETYPES } from "@/lib/engine/personality";
import { localDay } from "@/lib/engine/progress";
import { getDashboard } from "@/lib/services/insights";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Inicio" };

const MINUTE_OPTIONS = [5, 10, 20, 30, 45];

const PRACTICE_META = {
  read: { icon: Newspaper, color: "var(--skill-reading)" },
  listen: { icon: Headphones, color: "var(--skill-listening)" },
  write: { icon: PenLine, color: "var(--skill-writing)" },
  tutor: { icon: MessageCircle, color: "var(--skill-speaking)" },
} as const;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tutorial?: string }> }) {
  const learner = await requireLearner();
  const [d, sp] = await Promise.all([getDashboard(learner), searchParams]);
  const lang = learner.language;
  // Tutorial: la primera vez que llega al inicio (o bajo demanda con ?tutorial=1).
  const tour = (
    <WelcomeTour
      key={sp.tutorial ?? "auto"}
      name={d.greetingName}
      language={lang.name}
      simple={learner.profile.simpleMode}
      open={sp.tutorial === "1" || !learner.profile.tutorialDoneAt}
    />
  );
  if (learner.profile.simpleMode) {
    return (
      <>
        {tour}
        <SimpleHome d={d} languageName={lang.name} dailyMinutes={learner.profile.dailyMinutes} greeting={greeting(learner.profile.timezone)} />
      </>
    );
  }
  const today = localDay(new Date(), learner.profile.timezone);
  const personality = learner.profile.personality;
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
  const goalMonths = d.goal?.deadline ? Math.max(0, Math.round((new Date(d.goal.deadline).getTime() - Date.now()) / (30 * 86_400_000))) : null;
  // Distancia recorrida en la escala θ desde el inicio (A1 bajo) hasta el umbral del nivel objetivo.
  const goalProgress =
    d.goal && d.overall ? Math.max(0, Math.min(1, (d.overall.theta + 3.5) / (cefrToTheta(d.goal.targetLevel) - 0.5 + 3.5))) : 0;

  return (
    <div className="space-y-6">
      {tour}
      {/* Saludo */}
      <header className="flex items-start gap-4 animate-rise sm:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-[32px]">
            {greeting(learner.profile.timezone)}{d.greetingName ? `, ${d.greetingName}` : ""}
          </h1>
          {d.overall ? (
            <>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted sm:hidden">
                {lang.name}
                <Chip>{d.overall.level}{d.overall.next ? ` · ${Math.round(d.overall.progress * 100)} % → ${d.overall.next}` : ""}</Chip>
              </p>
              <p className="mt-1 hidden flex-wrap items-center gap-2 text-muted sm:flex">
                Tu {lang.name.toLowerCase()} está en <Chip>{d.overall.level}</Chip>
                {d.overall.next ? <span>· {Math.round(d.overall.progress * 100)} % del camino hacia {d.overall.next}</span> : null}
              </p>
            </>
          ) : (
            <p className="mt-1 text-muted">Empecemos por conocer tu nivel de {lang.name.toLowerCase()}.</p>
          )}
        </div>
        <div className="hidden lg:block"><QuickSearch /></div>
        {d.streak > 0 && (
          <Chip tone="warning" className="shrink-0 px-3 py-1 text-sm">
            <Flame size={15} aria-hidden className="animate-flame" /> {d.streak}<span className="hidden sm:inline"> {d.streak === 1 ? "día" : "días"}</span>
          </Chip>
        )}
        <Link href="/app/profile" aria-label="Mi perfil" className={`hidden size-11 shrink-0 place-items-center rounded-full font-display font-extrabold transition-transform hover:scale-105 lg:grid ${learner.profile.avatar ? "bg-primary-soft text-2xl" : "bg-primary text-base text-on-primary"}`}>
          {learner.profile.avatar ?? (learner.profile.displayName ?? learner.email ?? "?").slice(0, 1).toUpperCase()}
        </Link>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Sesión de hoy — acción principal */}
        {d.assessed ? (
          <Card className="relative p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="hidden flex-wrap gap-2 sm:flex">
                  <Chip tone="muted">{lang.name}{d.overall ? ` · ${d.overall.level}` : ""}</Chip>
                  <Chip tone="success">Adaptada a ti</Chip>
                </div>
                <h2 className="font-display text-xl font-extrabold sm:mt-3 sm:text-[26px]">Tu sesión de hoy</h2>
                <p className="mt-1 hidden text-muted sm:block">{d.plan.totalMinutes} minutos repartidos según lo que más te ayuda ahora mismo.</p>
              </div>
              <Mascot size={104} className="hidden shrink-0 sm:block" />
              <Chip tone="muted" className="px-3 py-1 text-sm sm:hidden">{d.plan.totalMinutes} min</Chip>
            </div>

            <div className="mt-4 flex gap-1 sm:mt-6" aria-hidden>
              {d.plan.blocks.map((b, i) => (
                <span key={i} className="h-2.5 rounded-full" style={{ flex: b.minutes, background: BLOCK_META[b.kind].color }} />
              ))}
            </div>
            <ul className="mt-2 sm:mt-3 sm:divide-y sm:divide-border/70">
              {d.plan.blocks.map((b, i) => (
                <li key={i} className="flex items-start gap-3.5 py-2 sm:py-3">
                  <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: BLOCK_META[b.kind].color }} aria-hidden />
                  <div className="flex-1">
                    <p className="font-medium sm:font-semibold">{BLOCK_META[b.kind].label}</p>
                    <p className="hidden text-sm text-muted sm:block">{b.reason}</p>
                  </div>
                  <span className="text-sm font-semibold text-muted">{b.minutes} min</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ButtonLink href={`/app/session?minutes=${d.plan.totalMinutes}`} size="lg" className="w-full sm:w-auto">
                Empezar sesión <ArrowRight size={18} aria-hidden />
              </ButtonLink>
              <nav aria-label="Duración de la sesión" className="flex flex-wrap gap-1.5">
                {MINUTE_OPTIONS.map((m) => (
                  <Link key={m} href={`/app/session?minutes=${m}`} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${m === learner.profile.dailyMinutes ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted hover:text-text"}`}>
                    {m}<span className="hidden sm:inline"> min</span>
                  </Link>
                ))}
              </nav>
              <ButtonLink href={`/app/session?minutes=${learner.profile.dailyMinutes}&surprise=1`} variant="ghost" size="sm" className="sm:ml-auto">
                <Sparkles size={16} aria-hidden /> Sorpréndeme
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center">
            <Mascot size={110} mood="cheer" />
            <div className="flex-1">
              <Chip tone="primary"><Gauge size={13} aria-hidden /> Paso 1</Chip>
              <h2 className="mt-2 font-display text-2xl font-extrabold">Descubre tu nivel real de {lang.name.toLowerCase()}</h2>
              <p className="mt-1 text-muted">Un diagnóstico adaptativo de ~5 minutos. Las preguntas se ajustan a tus respuestas y miden vocabulario, gramática y lectura por separado.</p>
              <ButtonLink href="/app/assessment" size="lg" className="mt-4">Empezar diagnóstico <ArrowRight size={18} aria-hidden /></ButtonLink>
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-6">
          {/* Recomendación explicada */}
          <section className="rounded-[22px] bg-primary-soft p-6" aria-labelledby="rec-title">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary"><Sparkles size={13} aria-hidden /> Recomendado para ti</p>
            <h2 id="rec-title" className="mt-2 font-display text-xl font-extrabold">{d.recommendation.title}</h2>
            <p className="mt-1.5 text-sm text-muted">{d.recommendation.reason}</p>
            <ButtonLink href={d.recommendation.href} size="sm" className="mt-4">Ir ahora <ArrowRight size={16} aria-hidden /></ButtonLink>
          </section>

          {/* Repaso */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <IconBox icon={Repeat} color="var(--skill-reading)" size={42} />
              <div className="min-w-0 flex-1">
                <p className="hidden text-sm font-semibold text-muted sm:block">Repaso pendiente</p>
                <p className="font-display text-lg font-extrabold sm:text-2xl">{d.dueCount} {d.dueCount === 1 ? "elemento" : "elementos"}</p>
                <p className="text-xs text-muted sm:hidden">{d.dueCount > 0 ? "listos para repasar" : "estás al día"}</p>
              </div>
              {d.dueCount > 0 && (
                <ButtonLink href="/app/review" variant="secondary" size="sm" className="sm:hidden">Repasar</ButtonLink>
              )}
            </div>
            <p className="mt-3 hidden text-sm text-muted sm:block">
              {d.dueCount > 0
                ? "Están en su punto óptimo: repasarlos hoy fija el recuerdo durante más tiempo."
                : "Estás al día. Los próximos repasos aparecerán cuando empiecen a olvidarse."}
            </p>
            {d.dueCount > 0 && (
              <ButtonLink href="/app/review" variant="secondary" className="mt-4 hidden w-full sm:flex">Repasar ahora (≈{Math.max(1, Math.round(d.dueCount * 0.3))} min)</ButtonLink>
            )}
          </Card>
        </div>
      </div>

      {/* Prácticas sugeridas: lectura, escucha, escritura, tutor */}
      {d.assessed && (
        <section aria-labelledby="practice-title" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="practice-title" className="font-display text-xl font-extrabold">Para ti hoy</h2>
            {personality ? (
              <Link href="/app/profile" className="text-sm text-muted hover:text-primary">{ARCHETYPES[personality.archetype].icon} Según tu perfil «{ARCHETYPES[personality.archetype].name}»</Link>
            ) : (
              <Link href="/app/explore" className="text-sm font-semibold text-primary">Ver todo</Link>
            )}
          </div>
          <ul className="stagger grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {d.practice.map((p) => {
              const m = PRACTICE_META[p.kind];
              return (
                <li key={p.kind}>
                  <Link href={p.href} className="card lift group flex h-full items-start gap-3 p-4 sm:flex-col sm:gap-2">
                    <IconBox icon={m.icon} color={m.color} size={40} />
                    <span>
                      <span className="block font-semibold group-hover:text-primary">{p.title}</span>
                      <span className="mt-0.5 block text-sm text-muted">{p.reason}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {!personality && (
              <li>
                <Link href="/app/profile/test" className="lift flex h-full items-start gap-3 rounded-[22px] border-2 border-dashed border-primary/40 bg-primary-soft/50 p-4 sm:flex-col sm:gap-2">
                  <span className="text-3xl" aria-hidden>🪞</span>
                  <span>
                    <span className="block font-semibold text-primary">¿Cómo aprendes mejor?</span>
                    <span className="mt-0.5 block text-sm text-muted">Test de 2 minutos para ajustar los ejercicios a tu forma de ser.</span>
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      {/* KPIs */}
      <section aria-label="Resumen" className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Flame, color: "var(--skill-listening)", value: `${d.streak} ${d.streak === 1 ? "día" : "días"}`, label: "Racha actual", hint: `Récord: ${d.bestStreak}` },
          { icon: Clock, color: "var(--skill-reading)", value: formatMinutes(d.minutesTotal), label: "Tiempo estudiado", hint: `${formatMinutes(d.minutesThisMonth)} este mes` },
          { icon: BookOpen, color: "var(--skill-vocabulary)", value: String(d.wordsLearned), label: "Palabras aprendidas", hint: "≥ 2 repasos y recuerdo ≥ 80 %" },
          { icon: Target, color: "var(--skill-grammar)", value: d.accuracy30 === null ? "—" : `${Math.round(d.accuracy30 * 100)} %`, label: "Precisión", hint: "Últimos 30 días" },
        ].map((k) => (
          <div key={k.label} className="card lift flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center">
            <IconBox icon={k.icon} color={k.color} size={42} />
            <div className="min-w-0">
              <p className="font-display text-xl font-extrabold leading-tight">{k.value}</p>
              <p className="text-sm text-muted sm:font-semibold sm:text-text">{k.label}</p>
              <p className="hidden truncate text-[11px] text-muted sm:block">{k.hint}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Nivel por habilidad */}
        <Card>
          <CardHeader title="Tu nivel por habilidad" aside="Escala CEFR · se actualiza con cada ejercicio" />
          <ul className="space-y-3.5">
            {d.skills.map((s) => {
              const meta = SKILL_META[s.skill];
              const unknown = s.evidence === 0;
              return (
                <li key={s.skill} className="flex items-center gap-3">
                  <span className="hidden sm:contents"><IconBox icon={meta.icon} color={meta.color} size={34} /></span>
                  <span className="w-24 shrink-0 text-sm font-medium sm:w-28">{meta.label}</span>
                  <Chip tone={unknown ? "muted" : "primary"} className="w-10 justify-center">{unknown ? "—" : s.level}</Chip>
                  <ProgressBar value={unknown ? 0 : s.progress} color={meta.color} label={`${meta.label}: progreso dentro de ${s.level}`} className="flex-1" />
                  <span className="hidden w-32 shrink-0 text-right text-xs text-muted sm:block">
                    {unknown ? "Sin datos aún" : s.lowEvidence ? "Estimación inicial" : `${Math.round(s.progress * 100)} % → ${thetaToCefr(s.theta + 1)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Objetivo */}
        <Card>
          <div className="flex items-center gap-3">
            <IconBox icon={Target} color="var(--primary)" size={40} />
            <div>
              <p className="text-xs font-semibold text-muted">Tu objetivo</p>
              <p className="font-display text-xl font-extrabold">{d.goal ? `${d.goal.targetLevel}${goalMonths !== null ? ` en ${goalMonths} ${goalMonths === 1 ? "mes" : "meses"}` : ""}` : "Sin objetivo"}</p>
            </div>
          </div>
          {d.goal && <ProgressBar value={goalProgress} label="Progreso hacia el objetivo" className="mt-4" height={10} />}
          <div className="mt-5 flex items-center text-sm">
            <span className="font-semibold">Esta semana</span>
            <span className="ml-auto font-semibold text-primary">{d.weekMinutes} / {(d.goal?.minutesPerDay ?? learner.profile.dailyMinutes) * 7} min</span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {d.week.map((w, i) => {
              const target = d.goal?.minutesPerDay ?? learner.profile.dailyMinutes;
              const pct = Math.min(1, w.minutes / Math.max(1, target));
              return (
                <div key={w.day} className="flex flex-col items-center gap-1">
                  <div className="relative h-12 w-full overflow-hidden rounded-lg bg-surface-muted" title={`${w.minutes} min`}>
                    <div className="absolute inset-x-0 bottom-0 rounded-lg bg-primary" style={{ height: `${pct * 100}%` }} />
                  </div>
                  <span className={`text-[11px] font-medium ${w.day === today ? "text-primary" : "text-muted"}`}>{weekDays[i]}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tus principales dificultades" aside="Últimas 4 semanas" />
          {d.weaknesses.length === 0 ? (
            <p className="text-sm text-muted">Aún no detectamos errores recurrentes. Aparecerán aquí a medida que practiques, con un acceso directo para trabajarlos.</p>
          ) : (
            <ul className="space-y-3">
              {d.weaknesses.map((w) => (
                <li key={w.category} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                  <span className="flex-1 font-medium first-letter:uppercase sm:w-40 sm:flex-none">{w.label}</span>
                  <ProgressBar value={w.count / Math.max(...d.weaknesses.map((x) => x.count))} color="var(--danger)" label={`${w.label}: ${w.count} errores`} className="order-last basis-full sm:order-none sm:basis-auto sm:flex-1" />
                  <span className="w-16 shrink-0 text-xs text-muted">{w.count} {w.count === 1 ? "error" : "errores"}</span>
                  {w.grammarId ? (
                    <Link href={`/app/session?focus=grammar:${encodeURIComponent(w.grammarId)}&minutes=5`} className="shrink-0 font-semibold text-primary hover:underline">Practicar</Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title="Actividad" aside="Últimas 20 semanas" />
          <Heatmap days={d.activity} today={today} weeks={20} />
        </Card>
      </div>
    </div>
  );
}
