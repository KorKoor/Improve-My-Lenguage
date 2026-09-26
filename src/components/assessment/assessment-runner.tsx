"use client";
import { ArrowRight, Gauge, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { answerAssessmentAction, startAssessmentAction, startFromZeroAction } from "@/app/app/actions";
import { DONT_KNOW } from "@/lib/engine/assessment";
import { useRouter } from "next/navigation";
import { SKILL_META } from "@/components/app/labels";
import { Afi } from "@/components/afi/afi";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import { useSpeech } from "@/components/speak-button";
import { Snail, Volume2 } from "lucide-react";
import type { AssessmentStep } from "@/lib/services/assessment";

const SKILL_ES = { vocabulary: "Vocabulario", grammar: "Gramática", reading: "Lectura", listening: "Escucha" } as const;

export function AssessmentRunner({ languageName, language, rtl, restart, alreadyAssessed, locale }: { languageName: string; language: string; rtl: boolean; restart: boolean; alreadyAssessed: boolean; locale: string }) {
  const { speak } = useSpeech(locale);
  const [phase, setPhase] = useState<"intro" | "loading" | "question" | "result" | "error">(alreadyAssessed && !restart ? "intro" : "intro");
  const [step, setStep] = useState<AssessmentStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shownAt = useRef(Date.now());
  const router = useRouter();

  async function fromZero() {
    setPhase("loading");
    const res = await startFromZeroAction();
    if (!res.ok) { setError(res.error); setPhase("error"); return; }
    router.push("/app/course");
  }

  async function begin() {
    setPhase("loading");
    const res = await startAssessmentAction(restart);
    if (!res.ok) { setError(res.error); setPhase("error"); return; }
    setStep(res.data);
    shownAt.current = Date.now();
    setPhase(res.data.done ? "result" : "question");
  }

  async function answer(choice: string) {
    if (!step || step.done || busy) return;
    setBusy(true);
    const res = await answerAssessmentAction(step.assessmentId, step.item.id, choice, Date.now() - shownAt.current);
    setBusy(false);
    if (!res.ok) { setError(res.error); setPhase("error"); return; }
    setStep(res.data);
    shownAt.current = Date.now();
    setPhase(res.data.done ? "result" : "question");
  }

  useEffect(() => {
    if (phase !== "question" || !step || step.done) return;
    const onKey = (e: KeyboardEvent) => {
      const opt = step.item.options[Number(e.key) - 1];
      if (opt) void answer(opt);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step]);

  if (phase === "intro") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center animate-rise">
        <Afi size={130} mood="curious" motion="float" />
        <Chip><Gauge size={13} aria-hidden /> Diagnóstico adaptativo</Chip>
        <h1 className="font-display text-3xl font-extrabold">Encontremos tu nivel real de {languageName.toLowerCase()}</h1>
        <ul className="max-w-md space-y-2 text-left text-muted">
          <li>• Entre 8 y 18 preguntas. Tarda unos 5 minutos.</li>
          <li>• Si aciertas, sube la dificultad; si fallas, baja. Es normal fallar varias: así encontramos tu techo.</li>
          <li>• Si no sabes una respuesta, pulsa <strong>«No lo sé»</strong>. Adivinar hace que luego te pongamos ejercicios demasiado difíciles.</li>
        </ul>
        <Button size="lg" onClick={() => void begin()}>{alreadyAssessed ? "Repetir diagnóstico" : "Empezar"} <ArrowRight size={18} aria-hidden /></Button>
        <button type="button" onClick={() => void fromZero()} className="card lift max-w-md p-4 text-left">
          <span className="block font-semibold">🌱 No sé nada todavía: empiezo desde cero</span>
          <span className="text-sm text-muted">Sin test. Empezamos por lo más básico, con ejercicios de elegir y mucha ayuda; subimos en cuanto vayas acertando.</span>
        </button>
        <Link href="/app" className="text-sm text-muted hover:text-text">Ahora no</Link>
      </div>
    );
  }
  if (phase === "loading") return <div className="grid flex-1 place-items-center"><Loader2 className="animate-spin text-primary" aria-label="Cargando" /></div>;
  if (phase === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <Afi size={100} mood="supportive" />
        <p className="font-display text-xl font-extrabold">No pudimos continuar el diagnóstico</p>
        <p className="text-sm text-muted">{error}</p>
        <Button onClick={() => void begin()}>Reintentar</Button>
      </div>
    );
  }
  if (phase === "result" && step?.done) {
    const r = step.result;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-14 text-center animate-rise">
        <Afi size={120} mood="proud" motion="hop" />
        <p className="text-sm font-semibold text-muted">Tu nivel estimado de {languageName.toLowerCase()}</p>
        <p className="font-display text-6xl font-extrabold text-primary">{r.level}</p>
        <p className="max-w-md text-muted">Respondiste {r.answered} preguntas ({r.correct} correctas). Es una estimación inicial: se afinará con cada ejercicio que hagas.</p>
        <div className="card w-full max-w-md p-5 text-left">
          <p className="mb-3 text-sm font-semibold">Por habilidad</p>
          <ul className="space-y-3">
            {r.perSkill.map((s) => (
              <li key={s.skill} className="flex items-center gap-3 text-sm">
                <span className="w-24 font-medium">{SKILL_ES[s.skill as keyof typeof SKILL_ES] ?? s.skill}</span>
                <Chip>{s.level}</Chip>
                <ProgressBar value={(s.theta + 3.5) / 7} color={SKILL_META[s.skill].color} label={`${s.skill}: ${s.level}`} className="flex-1" />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Listening y speaking se estimarán con tus primeras sesiones y conversaciones.</p>
        </div>
        {r.level === "A1" ? (
          <>
            <ButtonLink href="/app/course" size="lg">Empezar el Camino guiado <ArrowRight size={18} aria-hidden /></ButtonLink>
            <Link href="/app" className="text-sm text-muted hover:text-text">Ir a mi plan</Link>
          </>
        ) : (
          <ButtonLink href="/app" size="lg">Ver mi plan personalizado <ArrowRight size={18} aria-hidden /></ButtonLink>
        )}
        <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
          <Link href="/app/profile/test" className="card lift flex items-center gap-3 p-3 text-left text-sm">
            <span className="text-2xl" aria-hidden>🪞</span>
            <span><strong className="block">¿Cómo aprendes mejor?</strong><span className="text-muted">Test de 2 min</span></span>
          </Link>
          <Link href="/app/path" className="card lift flex items-center gap-3 p-3 text-left text-sm">
            <span className="text-2xl" aria-hidden>🗺️</span>
            <span><strong className="block">Tu camino a C1</strong><span className="text-muted">Qué te falta en cada nivel</span></span>
          </Link>
        </div>
      </div>
    );
  }
  if (!step || step.done) return null;
  const item = step.item;
  return (
    <div className="flex flex-1 flex-col pb-16 pt-5">
      <div className="flex items-center gap-4">
        <Link href="/app" aria-label="Salir del diagnóstico" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted"><X size={20} /></Link>
        <ProgressBar value={step.answered / step.maxItems} label={`Pregunta ${step.answered + 1}`} height={10} className="flex-1" />
        <span className="text-xs font-semibold text-muted">{step.answered + 1}</span>
      </div>
      <div key={item.id} className="mt-6 animate-rise">
        <Chip tone="muted">{SKILL_ES[item.skill]}</Chip>
        {item.passage && <p className="card mt-4 p-5 leading-relaxed" lang={language} dir={rtl ? "rtl" : "ltr"}>{item.passage}</p>}
        {item.audio && <AudioPrompt key={item.id} text={item.audio} speak={speak} />}
        <p className="mt-5 font-display text-2xl font-extrabold leading-snug" lang={language}>{item.prompt}</p>
        <div className="mt-6 grid gap-2.5">
          {item.options.map((o, i) => (
            <button key={o} type="button" disabled={busy} onClick={() => void answer(o)} className={cn("flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-left font-medium transition hover:border-primary hover:bg-primary-soft/40", busy && "opacity-60")}>
              <kbd className="hidden size-6 place-items-center rounded-md border border-border text-[11px] text-muted sm:grid">{i + 1}</kbd>
              <span lang={language}>{o}</span>
            </button>
          ))}
        </div>
        <button type="button" disabled={busy} onClick={() => void answer(DONT_KNOW)} className="mt-3 w-full rounded-2xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-muted hover:border-primary hover:text-primary">
          🤷 No lo sé
        </button>
        <p className="mt-6 text-center text-xs text-muted">No mostramos si acertaste para no condicionar las siguientes respuestas.</p>
      </div>
    </div>
  );
}

/** Ítem de escucha: se reproduce solo al aparecer; se puede repetir (también despacio). */
function AudioPrompt({ text, speak }: { text: string; speak: (t: string, rate?: number) => boolean }) {
  useEffect(() => {
    const t = setTimeout(() => speak(text, 0.9), 300);
    return () => clearTimeout(t);
  }, [text, speak]);
  return (
    <div className="card mt-4 flex items-center justify-center gap-4 p-6">
      <button type="button" onClick={() => speak(text, 0.9)} className="grid size-16 place-items-center rounded-full bg-primary text-on-primary shadow-lg active:scale-95" aria-label="Escuchar">
        <Volume2 size={28} />
      </button>
      <button type="button" onClick={() => speak(text, 0.6)} className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary active:scale-95" aria-label="Escuchar despacio">
        <Snail size={20} />
      </button>
    </div>
  );
}
