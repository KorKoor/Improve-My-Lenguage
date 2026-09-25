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
        <p className="mt-1 text-muted">Cada número tiene una definición clara (<Link href="#metodologia" className="underline">cómo se calcula</Link>). Nada de porcentajes inventados.</p>
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
