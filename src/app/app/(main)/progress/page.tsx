import { Award, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SKILL_META } from "@/components/app/labels";
import { LineChart, MiniBars } from "@/components/charts/bars";
import { Heatmap } from "@/components/charts/heatmap";
import { Card, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { IconBox } from "@/components/ui/icon-box";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ACHIEVEMENT_RULES } from "@/lib/engine/achievements";
import { localDay } from "@/lib/engine/progress";
import { getProgress } from "@/lib/services/insights";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Progreso" };

export default async function ProgressPage() {
  const learner = await requireLearner();
  const p = await getProgress(learner);
  const today = localDay(new Date(), learner.profile.timezone);
  const unlocked = new Map(p.achievements.map((a) => [a.achievementId, a.unlockedAt]));
  const acc = p.totals.attempts ? p.totals.correct / p.totals.attempts : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Tu progreso</h1>
        <p className="mt-1 text-muted">Cada número tiene una definición clara (<Link href="#metodologia" className="underline">cómo se calcula</Link>). Nada de porcentajes inventados. <Link href="/app/path" className="font-semibold text-primary hover:underline">Ver tu camino a C1 →</Link></p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Resumen">
        {[
          ["Palabras aprendidas", String(p.vocabulary.learned), `de ${p.vocabulary.total} disponibles`],
          ["Palabras dominadas", String(p.vocabulary.mastered), "estabilidad ≥ 21 días"],
          ["Racha", `${p.streak} días`, `récord ${p.bestStreak}`],
          ["Constancia", `${Math.round(p.consistency28 * 100)} %`, "días activos, últimas 4 semanas"],
        ].map(([l, v, h]) => (
          <div key={l} className="card p-4">
            <p className="text-sm text-muted">{l}</p>
            <p className="font-display text-2xl font-extrabold">{v}</p>
            <p className="text-xs text-muted">{h}</p>
          </div>
        ))}
      </section>

      <WeekCard week={p.week} />

      {p.insights.length > 0 && (
        <section aria-labelledby="insights-title" className="space-y-3">
          <h2 id="insights-title" className="font-display text-xl font-bold">Lo que dicen tus datos</h2>
          <ul className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {p.insights.map((i) => (
              <li key={i.id} className={`card lift flex flex-col gap-2 border-l-4 p-5 ${i.tone === "good" ? "border-l-success" : i.tone === "warn" ? "border-l-warning" : "border-l-primary"}`}>
                <p className="flex items-center gap-2 font-display font-bold"><span className="text-2xl" aria-hidden>{i.icon}</span>{i.title}</p>
                <p className="flex-1 text-sm text-muted">{i.body}</p>
                {i.href && i.cta && <Link href={i.href} className="text-sm font-semibold text-primary hover:underline">{i.cta} →</Link>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Nivel por habilidad" aside="θ → CEFR" />
          <ul className="space-y-4">
            {p.skills.map((s) => {
              const m = SKILL_META[s.skill];
              return (
                <li key={s.skill} className="flex items-center gap-3">
                  <IconBox icon={m.icon} color={m.color} size={34} />
                  <span className="w-28 text-sm font-medium">{m.label}</span>
                  <Chip tone={s.evidence ? "primary" : "muted"}>{s.evidence ? s.level : "—"}</Chip>
                  <ProgressBar value={s.evidence ? s.progress : 0} color={m.color} label={`${m.label}`} className="flex-1" />
                  <span className="w-24 text-right text-xs text-muted">{s.evidence ? `${s.evidence} observaciones` : "sin datos"}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Precisión semanal" aside="Últimas 12 semanas" />
          <LineChart label="Precisión semanal" points={p.weekly.map((w) => ({ x: w.week, y: w.total ? w.correct / w.total : null }))} />
          <p className="mt-3 text-sm text-muted">Precisión global: {acc === null ? "—" : `${Math.round(acc * 100)} %`} en {p.totals.attempts} ejercicios.</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Precisión por habilidad" aside="Últimos 30 días" />
          {p.skillAccuracy.length === 0 ? <p className="text-sm text-muted">Sin ejercicios en los últimos 30 días.</p> : (
            <MiniBars
              label="Precisión por habilidad"
              format={(v) => `${v} %`}
              data={p.skillAccuracy.map((s) => ({ label: SKILL_META[s.skill]?.label ?? s.skill, value: Math.round((s.correct / Math.max(1, s.total)) * 100), hint: `${s.correct}/${s.total}` }))}
            />
          )}
        </Card>
        <Card>
          <CardHeader title="Errores más frecuentes" aside="Últimas 4 semanas" />
          {p.weaknesses.length === 0 ? <p className="text-sm text-muted">Sin errores recurrentes detectados.</p> : (
            <MiniBars label="Errores por categoría" color="var(--danger)" data={p.weaknesses.map((w) => ({ label: w.label.split(" ")[0]!, value: w.count, hint: w.label }))} />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Actividad" aside="Minutos por día · últimos 6 meses" />
        <Heatmap days={p.activity} today={today} weeks={26} />
      </Card>

      <Card>
        <CardHeader title="Logros" icon={<Award className="text-warning" aria-hidden />} />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENT_RULES.map((a) => {
            const at = unlocked.get(a.id);
            return (
              <li key={a.id} className={`flex items-center gap-3 rounded-2xl p-3 ${at ? "bg-warning-soft" : "bg-surface-muted opacity-70"}`}>
                <span className="text-2xl" aria-hidden>{at ? a.icon : <Lock size={20} className="text-muted" />}</span>
                <span className="text-sm"><span className="block font-semibold">{a.title}</span><span className="text-muted">{a.description}</span></span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card id="metodologia">
        <CardHeader title="Cómo se calcula" />
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold">Nivel por habilidad</dt><dd className="text-muted">Estimación θ (modelo de Rasch) iniciada en el diagnóstico y actualizada tras cada ejercicio según su dificultad. Se proyecta a CEFR (A1–C2).</dd></div>
          <div><dt className="font-semibold">Palabra aprendida</dt><dd className="text-muted">Al menos 2 repasos, estabilidad de memoria ≥ 3 días y probabilidad actual de recordarla ≥ 80 % (FSRS).</dd></div>
          <div><dt className="font-semibold">Palabra dominada</dt><dd className="text-muted">Estabilidad ≥ 21 días: la recordarías con un 90 % de probabilidad tres semanas después.</dd></div>
          <div><dt className="font-semibold">Precisión</dt><dd className="text-muted">Aciertos ÷ intentos. Las respuestas con errata leve cuentan como acierto.</dd></div>
          <div><dt className="font-semibold">Racha</dt><dd className="text-muted">Días consecutivos con al menos un ejercicio, en tu zona horaria. Si hoy aún no estudiaste, cuenta desde ayer.</dd></div>
          <div><dt className="font-semibold">Debilidad recurrente</dt><dd className="text-muted">Categoría con ≥ 3 errores en 4 semanas presentes en ≥ 2 sesiones. Los errores recientes pesan más (vida media de 7 días).</dd></div>
        </dl>
      </Card>
    </div>
  );
}

function Delta({ now, before, unit = "" }: { now: number; before: number; unit?: string }) {
  if (before === 0 && now === 0) return <span className="text-xs text-muted">—</span>;
  const diff = now - before;
  const up = diff >= 0;
  // En porcentajes se comparan puntos; en cantidades, variación relativa.
  const pct = unit.trim() === "%" ? null : before > 0 ? Math.round((diff / before) * 100) : null;
  const label = unit.trim() === "%" ? `${Math.abs(diff)} pts` : pct === null ? `+${diff}` : `${Math.abs(pct)} %`;
  return (
    <span className={`text-xs font-semibold ${up ? "text-success" : "text-danger"}`}>
      {up ? "▲" : "▼"} {label}
    </span>
  );
}

function WeekCard({ week }: { week: import("@/lib/engine/insights").WeekReport }) {
  const c = week.current;
  const b = week.previous;
  const acc = (t: typeof c) => (t.exercises ? Math.round((t.correct / t.exercises) * 100) : 0);
  const max = Math.max(10, ...week.daily.map((d) => d.minutes));
  const labels = ["L", "M", "X", "J", "V", "S", "D"];
  const rows: [string, number, number, string][] = [
    ["Minutos", c.minutes, b.minutes, ""],
    ["Ejercicios", c.exercises, b.exercises, ""],
    ["Días activos", c.days, b.days, ""],
    ["Precisión", acc(c), acc(b), " %"],
  ];
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="week-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="week-title" className="font-display text-xl font-bold">Tu semana</h2>
        <p className="text-sm text-muted">Comparada con la semana pasada a estas alturas</p>
      </div>
      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_280px]">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rows.map(([label, now, before, unit]) => (
            <div key={label} className="rounded-2xl bg-surface-muted p-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-display text-2xl font-extrabold tabular-nums">{now}{unit}</dd>
              <dd><Delta now={now} before={before} unit={unit} /> <span className="text-[11px] text-muted">vs {before}{unit}</span></dd>
            </div>
          ))}
        </dl>
        <div className="flex h-32 gap-2" aria-label="Minutos por día esta semana">
          {week.daily.map((d, i) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <div className="relative w-full flex-1 overflow-hidden rounded-lg bg-surface-muted" title={`${d.minutes} min`}>
                <div className="absolute inset-x-0 bottom-0 rounded-lg bg-primary transition-[height] duration-700" style={{ height: `${(d.minutes / max) * 100}%` }} />
              </div>
              <span className="text-[11px] text-muted">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
