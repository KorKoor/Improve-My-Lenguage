"use client";

import { ArrowLeft, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { savePersonalityAction } from "@/app/app/profile-actions";
import { Confetti } from "@/components/celebrate";
import { Afi } from "@/components/afi/afi";
import { Button, buttonClass } from "@/components/ui/button";
import { ARCHETYPES, LIKERT, PERSONALITY_QUESTIONS, type PersonalityResult } from "@/lib/engine/personality";
import { cn } from "@/lib/cn";
import { PersonalityCard } from "./personality-card";

const STORE = "iml:personality-draft";

export function PersonalityQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [i, setI] = useState(0);
  const [apply, setApply] = useState(true);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [achievements, setAchievements] = useState<{ id: string; title: string; icon: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Borrador local: si cierras la pestaña a mitad, retomas donde ibas.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, number>;
        setAnswers(saved);
        setI(Math.min(PERSONALITY_QUESTIONS.length - 1, Object.keys(saved).length));
      }
    } catch {}
  }, []);

  const total = PERSONALITY_QUESTIONS.length;
  const q = PERSONALITY_QUESTIONS[i]!;
  const done = Object.keys(answers).length;

  function pick(v: number) {
    const next = { ...answers, [q.id]: v };
    setAnswers(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
    if (i < total - 1) setTimeout(() => setI(i + 1), 180);
  }

  function submit() {
    setError(null);
    start(async () => {
      const r = await savePersonalityAction(answers, apply);
      if (!r.ok) return setError(r.error);
      try {
        localStorage.removeItem(STORE);
      } catch {}
      setResult(r.data.result);
      setAchievements(r.data.newAchievements);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (result) {
    const a = ARCHETYPES[result.archetype];
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade">
        <Confetti />
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <span className="animate-float text-6xl" aria-hidden>{a.icon}</span>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Tu forma de aprender</p>
          <h1 className="font-display text-3xl font-extrabold">{a.name}</h1>
          <p className="max-w-md text-muted">{a.tagline}</p>
          {achievements.map((x) => (
            <p key={x.id} className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{x.icon} Logro: {x.title}</p>
          ))}
        </div>
        <PersonalityCard result={result} />
        <div className="flex flex-wrap gap-3">
          <Link href="/app" className={buttonClass("primary", "lg")}>Empezar con mi plan</Link>
          <Link href="/app/profile" className={buttonClass("secondary", "lg")}>Ver mi perfil</Link>
        </div>
      </div>
    );
  }

  const allAnswered = done >= total;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center gap-4">
        <Afi size={72} mood="thinking" />
        <div>
          <h1 className="font-display text-2xl font-extrabold">¿Cómo aprendes mejor?</h1>
          <p className="text-sm text-muted">{total} preguntas rápidas · 2 minutos. No hay respuestas buenas ni malas: sirve para ajustar los ejercicios a ti.</p>
        </div>
      </header>

      <div className="h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Progreso del cuestionario">
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      <section key={q.id} className="card animate-fade space-y-6 p-6 sm:p-8" aria-live="polite">
        <p className="text-sm font-semibold text-muted">Pregunta {i + 1} de {total}</p>
        <h2 className="font-display text-xl font-bold leading-snug sm:text-2xl">{q.text}</h2>
        <div className="grid gap-2 sm:grid-cols-5" role="radiogroup" aria-label={q.text}>
          {LIKERT.map((label, k) => {
            const v = k + 1;
            const on = answers[q.id] === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(v)}
                className={cn(
                  "lift flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors sm:flex-col sm:justify-center sm:px-2 sm:py-4 sm:text-center",
                  on ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden
                  className={cn("grid shrink-0 place-items-center rounded-full border-2 transition-all", on ? "border-primary bg-primary text-on-primary" : "border-border")}
                  style={{ width: 18 + k * 4, height: 18 + k * 4 }}
                >
                  {on && <Check size={12} />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          {i < total - 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setI(i + 1)} disabled={!answers[q.id]}>
              Siguiente
            </Button>
          ) : null}
        </div>
      </section>

      {allAnswered && (
        <section className="card animate-fade space-y-4 p-6">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-4 accent-[var(--primary)]" checked={apply} onChange={(e) => setApply(e.target.checked)} />
            <span>
              <strong>Ajustar mi experiencia automáticamente</strong>
              <br />
              <span className="text-muted">Dificultad, profundidad de las explicaciones, motivación y el reparto del plan diario. Puedes cambiarlo cuando quieras en Configuración.</span>
            </span>
          </label>
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <Button size="lg" onClick={submit} disabled={pending} className="w-full sm:w-auto">
            <Sparkles size={18} /> {pending ? "Analizando…" : "Ver mi resultado"}
          </Button>
        </section>
      )}
    </div>
  );
}
