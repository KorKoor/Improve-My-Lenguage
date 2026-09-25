"use client";
import { ArrowRight, Check, Headphones, Lightbulb, Loader2, MessageCircle, Mic, Snail, Trophy, Volume2, X } from "lucide-react";
import { POS_ES } from "@/components/app/labels";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { explainMistakeAction, finishSessionAction, reviseConfidenceAction, startSessionAction, submitAnswerAction } from "@/app/app/actions";
import { BLOCK_META } from "@/components/app/labels";
import { Confetti, CountUp } from "@/components/celebrate";
import { Mascot } from "@/components/mascot";
import { SpeakButton, useSpeech } from "@/components/speak-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { Exercise } from "@/lib/engine/exercises";
import { fatigueOnset, planBreak, readFocus, type BreakPlan, type FocusEvent, type FocusReading } from "@/lib/engine/focus";
import { BreakCoach, formatClock } from "@/components/focus/break-coach";
import { PlanNext } from "@/components/focus/plan-next";
import type { SessionStep } from "@/lib/engine/session-builder";
import type { AnswerFeedback, SessionSummary } from "@/lib/services/learning";

type Queued = SessionStep & { uid: string; retry?: boolean };

interface Props {
  minutes: number;
  focus: string | null;
  surprise: boolean;
  locale: string;
  language: string;
  rtl: boolean;
  title: string;
  /** Tutor de IA disponible y con consentimiento: habilita «¿Por qué?». */
  aiEnabled?: boolean;
  /** Capacidad de atención aprendida (min): guía las pausas inteligentes. */
  span?: number;
}


export function SessionRunner({ minutes, focus, surprise, locale, language, rtl, title, aiEnabled = false, span = 15 }: Props) {
  // ── Temporizador inteligente ──
  const focusEvents = useRef<FocusEvent[]>([]);
  const lastBreakAt = useRef(0);
  const breakMs = useRef(0);
  const breaksTaken = useRef(0);
  const snoozeUntil = useRef(0);
  const [suggestion, setSuggestion] = useState<{ reading: FocusReading; plan: BreakPlan } | null>(null);
  const [onBreak, setOnBreak] = useState<{ plan: BreakPlan; startedAt: number } | null>(null);
  const [clock, setClock] = useState(0);
  const [onset, setOnset] = useState<number | null>(null);
  const [lastAnswer, setLastAnswer] = useState<{ key: string; response: string } | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "running" | "finishing" | "done" | "empty">("loading");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState({ total: 0, correct: 0 });
  // Racha de aciertos seguidos dentro de la sesión (motivación inmediata).
  const [combo, setCombo] = useState({ now: 0, best: 0 });
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const startedAt = useRef(Date.now());
  const stepStartedAt = useRef(Date.now());
  const started = useRef(false);

  const load = useCallback(async () => {
    setStatus("loading");
    const res = await startSessionAction({ minutes, focus, surprise });
    if (!res.ok) {
      setError(res.error);
      setStatus("error");
      return;
    }
    const steps = res.data.steps.map((s, i) => ({ ...s, uid: String(i) }));
    setSessionId(res.data.sessionId);
    setQueue(steps);
    setIndex(0);
    startedAt.current = Date.now();
    stepStartedAt.current = Date.now();
    lastBreakAt.current = Date.now();
    setStatus(steps.length ? "running" : "empty");
  }, [minutes, focus, surprise]);

  useEffect(() => {
    if (started.current) return; // evita doble sesión en StrictMode
    started.current = true;
    void load();
  }, [load]);

  useEffect(() => {
    if (status !== "running" || onBreak) return;
    const t = setInterval(() => setClock(Math.round((Date.now() - startedAt.current - breakMs.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [status, onBreak]);

  const step = queue[index];
  const progress = queue.length ? index / queue.length : 0;

  const finish = useCallback(async () => {
    setStatus("finishing");
    if (sessionId) {
      const o = fatigueOnset(focusEvents.current);
      setOnset(o);
      const res = await finishSessionAction(sessionId, Math.round((Date.now() - startedAt.current - breakMs.current) / 1000), { onsetMin: o, breaks: breaksTaken.current });
      if (res.ok) setSummary(res.data);
    }
    setStatus("done");
  }, [sessionId]);

  const next = useCallback(() => {
    setFeedback(null);
    stepStartedAt.current = Date.now();
    if (index + 1 >= queue.length) void finish();
    else setIndex((i) => i + 1);
  }, [index, queue.length, finish]);

  const submit = useCallback(
    async (ex: Exercise, response: string, pairs?: Record<string, string>) => {
      if (submitting || feedback) return;
      setSubmitting(true);
      setLastAnswer({ key: ex.key, response });
      const res = await submitAnswerAction({
        sessionId,
        key: ex.key,
        response,
        pairs,
        timeMs: Date.now() - stepStartedAt.current,
        attempts: 1,
      });
      setSubmitting(false);
      if (!res.ok) {
        setFeedback({ correct: false, nearMiss: false, expected: "", explanation: res.error });
        return;
      }
      setFeedback(res.data);
      setResults((r) => ({ total: r.total + 1, correct: r.correct + (res.data.correct ? 1 : 0) }));
      setCombo((c) => {
        const now = res.data.correct ? c.now + 1 : 0;
        return { now, best: Math.max(c.best, now) };
      });
      // Lectura de foco tras cada respuesta: ¿toca una pausa?
      const nowMs = Date.now();
      focusEvents.current.push({ correct: res.data.correct, timeMs: nowMs - stepStartedAt.current, atMin: (nowMs - startedAt.current - breakMs.current) / 60000 });
      const reading = readFocus(focusEvents.current, { span, sinceBreakMin: (nowMs - lastBreakAt.current) / 60000 });
      if (reading.advice !== "continue" && nowMs >= snoozeUntil.current) {
        setSuggestion({ reading, plan: planBreak(reading, (nowMs - startedAt.current - breakMs.current) / 60000, focusEvents.current.length) });
      }
      // Lo fallado vuelve a salir al final (una vez): recuperación inmediata.
      const current = queue[index];
      if (!res.data.correct && current && !current.retry && ex.type !== "match") {
        setQueue((q) => [...q, { ...current, uid: current.uid + "-r", retry: true }]);
      }
    },
    [submitting, feedback, sessionId, queue, index, span],
  );

  if (status === "loading") {
    return (
      <div className="grid flex-1 place-items-center py-20 text-center" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <Mascot size={100} />
          <p className="font-display text-xl font-extrabold">Preparando tu sesión…</p>
          <p className="text-sm text-muted">Revisando qué estás a punto de olvidar y qué te conviene practicar.</p>
          <Loader2 className="animate-spin text-primary" aria-hidden />
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="grid flex-1 place-items-center py-20 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4">
          <Mascot size={100} mood="calm" />
          <p className="font-display text-xl font-extrabold">No pudimos preparar tu sesión</p>
          <p className="text-sm text-muted">{error}</p>
          <div className="flex gap-2">
            <Button onClick={() => void load()}>Intentar de nuevo</Button>
            <ButtonLink href="/app" variant="secondary">Volver</ButtonLink>
          </div>
        </div>
      </div>
    );
  }
  if (status === "empty") {
    return (
      <div className="grid flex-1 place-items-center py-20 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4">
          <Mascot size={110} mood="cheer" />
          <p className="font-display text-2xl font-extrabold">¡Estás al día!</p>
          <p className="text-sm text-muted">No hay nada pendiente aquí ahora mismo. Tu memoria lo agradece.</p>
          <ButtonLink href="/app/session">Hacer una sesión normal</ButtonLink>
        </div>
      </div>
    );
  }
  if (status === "finishing" || status === "done") {
    const acc = results.total ? Math.round((results.correct / results.total) * 100) : null;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center animate-rise" aria-live="polite">
        {status === "done" && acc !== null && acc >= 70 && <Confetti />}
        <Mascot size={130} mood="cheer" className="animate-float" />
        <h1 className="font-display text-3xl font-extrabold">{acc === null ? "¡Sesión completada!" : acc >= 90 ? "¡Sesión brillante!" : acc >= 70 ? "¡Muy bien hecho!" : "¡Sesión completada!"}</h1>
        {acc !== null && acc < 70 && <p className="-mt-2 max-w-sm text-sm text-muted">Los errores de hoy son los repasos de mañana: volverán en el momento justo para fijarlos.</p>}
        <div className="stagger grid w-full max-w-md grid-cols-3 gap-3">
          <div className="card p-4"><p className="font-display text-2xl font-extrabold"><CountUp value={results.total} /></p><p className="text-xs text-muted">ejercicios</p></div>
          <div className="card p-4"><p className="font-display text-2xl font-extrabold">{acc === null ? "—" : <CountUp value={acc} suffix=" %" />}</p><p className="text-xs text-muted">precisión</p></div>
          <div className="card p-4"><p className="font-display text-2xl font-extrabold">{combo.best >= 3 ? <>🔥 <CountUp value={combo.best} /></> : Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))}</p><p className="text-xs text-muted">{combo.best >= 3 ? "mejor racha" : "minutos"}</p></div>
        </div>
        {summary?.newAchievements.length ? (
          <div className="card w-full max-w-md p-4 text-left">
            <p className="flex items-center gap-2 font-semibold"><Trophy size={18} className="text-warning" aria-hidden /> Nuevos logros</p>
            <ul className="mt-2 space-y-1 text-sm">{summary.newAchievements.map((a) => <li key={a.id}>{a.icon} {a.title}</li>)}</ul>
          </div>
        ) : null}
        {status === "done" && focusEvents.current.length >= 8 && (
          <p className="max-w-md rounded-2xl bg-surface px-4 py-3 text-sm shadow-sm">
            {onset !== null
              ? <>🧠 Tu precisión empezó a bajar hacia el <strong>minuto {onset}</strong>. El temporizador ya lo tiene en cuenta para proponerte pausas a tiempo.</>
              : <>🎯 Mantuviste la concentración toda la sesión{breaksTaken.current ? ` (con ${breaksTaken.current} ${breaksTaken.current === 1 ? "pausa" : "pausas"})` : ""}. ¡Así se hace!</>}
          </p>
        )}
        <p className="max-w-md text-sm text-muted">Tu perfil ya se actualizó con esta sesión: los repasos, tu nivel por habilidad y tus debilidades se recalculan en cada respuesta.</p>
        {status === "finishing" ? <Loader2 className="animate-spin text-primary" aria-label="Guardando" /> : (
          <>
            <PlanNext />
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/app" size="lg">Volver al inicio</ButtonLink>
              <ButtonLink href="/app/progress" variant="secondary" size="lg">Ver mi progreso</ButtonLink>
            </div>
            <nav aria-label="Seguir practicando" className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
              <span className="w-full text-muted">¿Te quedan ganas? Pon en práctica lo de hoy:</span>
              <Link href="/app/read" className="lift rounded-full bg-surface px-3.5 py-1.5 font-semibold shadow-sm">📖 Leer</Link>
              <Link href="/app/listen" className="lift rounded-full bg-surface px-3.5 py-1.5 font-semibold shadow-sm">🎧 Escuchar</Link>
              <Link href="/app/write" className="lift rounded-full bg-surface px-3.5 py-1.5 font-semibold shadow-sm">🖋️ Escribir</Link>
            </nav>
          </>
        )}
      </div>
    );
  }

  if (!step) return null;
  const meta = BLOCK_META[step.block];

  return (
    <div className="flex flex-1 flex-col pb-40 pt-5">
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        <Link href="/app" aria-label="Salir de la sesión" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted hover:text-text">
          <X size={20} />
        </Link>
        <ProgressBar value={progress} label={`${title}: paso ${index + 1} de ${queue.length}`} height={10} className="flex-1" />
        <span className="text-xs font-semibold text-muted tabular-nums">{index + 1}/{queue.length}</span>
        <SessionClock seconds={clock} target={minutes * 60} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: meta.color }}>
          <meta.icon size={13} aria-hidden /> {meta.label}
        </span>
        {"retry" in step && step.retry ? <Chip tone="warning">Otra oportunidad</Chip> : null}
        {combo.now >= 3 ? (
          <span key={combo.now} className="ml-auto inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-warning animate-pop-in" aria-label={`${combo.now} aciertos seguidos`}>
            <span className="animate-flame" aria-hidden>🔥</span> {combo.now} seguidas
          </span>
        ) : null}
      </div>

      {suggestion && !feedback && !onBreak && (
        <BreakSuggestion
          reading={suggestion.reading}
          plan={suggestion.plan}
          onTake={() => {
            setOnBreak({ plan: suggestion.plan, startedAt: Date.now() });
            setSuggestion(null);
          }}
          onFinish={() => {
            setSuggestion(null);
            void finish();
          }}
          onDismiss={() => {
            // No insistir durante unos minutos.
            snoozeUntil.current = Date.now() + 6 * 60_000;
            setSuggestion(null);
          }}
        />
      )}
      <div key={step.uid} className={cn("mt-4", feedback && !feedback.correct ? "animate-shake" : "animate-rise")} lang={step.kind === "exercise" || step.kind === "intro" ? undefined : "es"}>
        {step.kind === "intro" && <IntroStep step={step} locale={locale} language={language} rtl={rtl} onNext={next} />}
        {step.kind === "tip" && <TipStep step={step} language={language} onNext={next} />}
        {step.kind === "tutor" && <TutorStep minutes={step.minutes} onSkip={next} onGo={() => void finish()} />}
        {step.kind === "exercise" && (
          <ExerciseStep
            exercise={step.exercise}
            locale={locale}
            language={language}
            rtl={rtl}
            disabled={submitting || !!feedback}
            submitting={submitting}
            feedback={feedback}
            onSubmit={submit}
            onSkip={next}
          />
        )}
      </div>

      {onBreak && (
        <BreakCoach
          seconds={onBreak.plan.seconds}
          activity={onBreak.plan.activity}
          why={onBreak.plan.why}
          onDone={(completed) => {
            const now = Date.now();
            breakMs.current += now - onBreak.startedAt;
            lastBreakAt.current = now;
            snoozeUntil.current = now + 5 * 60_000;
            if (completed) breaksTaken.current += 1;
            stepStartedAt.current = now;
            setOnBreak(null);
          }}
        />
      )}
      {feedback && <FeedbackSheet feedback={feedback} onNext={next} combo={combo.now} explain={aiEnabled && !feedback.correct && lastAnswer ? lastAnswer : null} />}
    </div>
  );
}

function IntroStep({ step, locale, language, rtl, onNext }: { step: Extract<SessionStep, { kind: "intro" }>; locale: string; language: string; rtl: boolean; onNext: () => void }) {
  const w = step.word;
  const { speak } = useSpeech(locale);
  useEffect(() => {
    speak(w.lemma);
  }, [speak, w.lemma]);
  return (
    <div>
      <p className="text-sm font-semibold text-muted">{step.block === "review" ? "Vuelve a mirarla con calma" : "Palabra nueva"}</p>
      <div className="card mt-3 p-6">
        <div className="flex items-start gap-3">
          <div className="flex-1" lang={language} dir={rtl ? "rtl" : "ltr"}>
            <p className="font-display text-4xl font-extrabold">{w.lemma}</p>
            <p className="mt-1 text-sm text-muted">{[w.reading, w.ipa, POS_ES[w.pos] ?? w.pos].filter(Boolean).join(" · ")}</p>
          </div>
          <SpeakButton text={w.lemma} audioUrl={w.audioUrl} locale={locale} size={48} />
        </div>
        <p className="mt-4 text-xl font-semibold text-primary">{w.translation.join(", ")}</p>
        {w.friend?.kind === "cognate" && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success animate-pop-in">
            🤝 Se parece al español: «{w.friend.looksLike}». ¡Palabra regalo!
          </p>
        )}
        {w.friend?.kind === "false_friend" && (
          <p className="mt-3 rounded-2xl bg-danger-soft p-3 text-sm animate-pop-in">
            <strong className="text-danger">⚠️ Falso amigo.</strong> Parece «{w.friend.looksLike}», pero significa <strong>{w.friend.means}</strong>.
          </p>
        )}
        {w.example && (
          <div className="mt-5 rounded-2xl bg-surface-muted p-4">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-lg" lang={language} dir={rtl ? "rtl" : "ltr"}>{w.example.text}</p>
              <SpeakButton text={w.example.text} locale={locale} size={34} label="Escuchar el ejemplo" />
            </div>
            {w.example.reading && <p className="mt-1 text-sm text-muted">{w.example.reading}</p>}
            {w.example.translation && <p className="mt-1 text-sm text-muted">{w.example.translation}</p>}
          </div>
        )}
        {w.usageNote && (
          <p className="mt-4 flex gap-2 rounded-2xl bg-warning-soft p-4 text-sm"><Lightbulb size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden /> {w.usageNote}</p>
        )}
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={onNext} autoFocus>Entendido <ArrowRight size={18} aria-hidden /></Button>
    </div>
  );
}

function TipStep({ step, language, onNext }: { step: Extract<SessionStep, { kind: "tip" }>; language: string; onNext: () => void }) {
  const g = step.grammar;
  return (
    <div>
      <p className="text-sm font-semibold text-muted">Antes de practicar</p>
      <div className="card mt-3 p-6">
        <h2 className="font-display text-2xl font-extrabold">{g.title}</h2>
        <p className="mt-3 leading-relaxed text-muted">{g.summary}</p>
        {g.example && <p className="mt-4 rounded-2xl bg-surface-muted p-4 text-lg" lang={language}>{g.example}</p>}
        {g.mistake && (
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <p className="rounded-xl bg-danger-soft p-3"><span className="font-semibold text-danger">✗ </span><span lang={language}>{g.mistake.wrong}</span></p>
            <p className="rounded-xl bg-success-soft p-3"><span className="font-semibold text-success">✓ </span><span lang={language}>{g.mistake.right}</span></p>
            <p className="text-muted sm:col-span-2">{g.mistake.why}</p>
          </div>
        )}
        <Link href={`/app/grammar/${encodeURIComponent(g.id)}`} target="_blank" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Ver explicación completa</Link>
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={onNext} autoFocus>A practicar <ArrowRight size={18} aria-hidden /></Button>
    </div>
  );
}

function TutorStep({ minutes, onSkip, onGo }: { minutes: number; onSkip: () => void; onGo: () => void }) {
  return (
    <div className="card p-6 text-center">
      <MessageCircle size={36} className="mx-auto text-skill-speaking" aria-hidden />
      <h2 className="mt-3 font-display text-2xl font-extrabold">Cierra con una conversación</h2>
      <p className="mt-2 text-muted">{minutes} minutos con tu tutor para usar lo que acabas de practicar. Al final recibirás feedback de tus errores.</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={() => { onGo(); window.location.assign("/app/tutor"); }}>Hablar con el tutor</Button>
        <Button size="lg" variant="secondary" onClick={onSkip}>Terminar sin conversación</Button>
      </div>
    </div>
  );
}

function ExerciseStep({
  exercise: ex,
  locale,
  language,
  rtl,
  disabled,
  submitting,
  feedback,
  onSubmit,
  onSkip,
}: {
  exercise: Exercise;
  locale: string;
  language: string;
  rtl: boolean;
  disabled: boolean;
  submitting: boolean;
  feedback: AnswerFeedback | null;
  onSubmit: (ex: Exercise, response: string, pairs?: Record<string, string>) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState("");
  const [chosen, setChosen] = useState<string | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const { supported, speak } = useSpeech(locale);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ex.type === "dictation" && ex.audioText) speak(ex.audioText);
    if (ex.input === "text") inputRef.current?.focus();
  }, [ex, speak]);

  // Atajos 1–4 para opción múltiple
  useEffect(() => {
    if (ex.input !== "choice" || disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      const opt = ex.options?.[n - 1];
      if (opt && !(e.target instanceof HTMLInputElement)) {
        setChosen(opt);
        onSubmit(ex, opt);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ex, disabled, onSubmit]);

  const dir = rtl ? "rtl" : "ltr";

  return (
    <div>
      <p className="text-sm font-semibold text-muted">{ex.instruction}</p>

      {ex.type === "dictation" ? (
        supported ? (
          <div className="card mt-3 flex items-center justify-center gap-4 p-8">
            <button type="button" onClick={() => speak(ex.audioText!)} className="grid size-20 place-items-center rounded-full bg-primary text-on-primary shadow-lg transition active:scale-95" aria-label="Reproducir audio">
              <Volume2 size={34} />
            </button>
            <button type="button" onClick={() => speak(ex.audioText!, 0.7)} className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary transition active:scale-95" aria-label="Reproducir más despacio">
              <Snail size={22} />
            </button>
          </div>
        ) : (
          <div className="card mt-3 p-6 text-center">
            <Headphones className="mx-auto text-muted" aria-hidden />
            <p className="mt-2 text-sm text-muted">Tu navegador no puede reproducir audio. Saltamos este ejercicio sin penalizarte.</p>
            <Button className="mt-4" onClick={onSkip}>Saltar</Button>
          </div>
        )
      ) : ex.prompt ? (
        <div className="card mt-3 p-6">
          <div className="flex items-start gap-3">
            <p className={cn("flex-1 font-display font-extrabold", ex.prompt.length > 40 ? "text-xl leading-snug" : "text-3xl sm:text-4xl")} lang={ex.type === "reverse_mc" || ex.type === "recall" ? "es" : language} dir={ex.type === "reverse_mc" || ex.type === "recall" ? "ltr" : dir}>
              {ex.prompt}
            </p>
            {ex.audioText ? <SpeakButton text={ex.audioText} locale={locale} size={46} /> : null}
          </div>
          {ex.context && <p className="mt-2 text-sm text-muted" lang={ex.type === "cloze" || ex.type === "conjugate" ? "es" : language}>{ex.context}</p>}
        </div>
      ) : null}

      {/* Entrada */}
      {ex.input === "choice" && (
        <div className="mt-5 grid gap-2.5" role="group" aria-label="Opciones">
          {ex.options!.map((o, i) => {
            const isChosen = chosen === o;
            const state = feedback && isChosen ? (feedback.correct ? "ok" : "bad") : feedback && !feedback.correct && o === feedback.expected ? "ok" : null;
            return (
              <button
                key={o}
                type="button"
                disabled={disabled}
                onClick={() => { setChosen(o); onSubmit(ex, o); }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-base font-medium transition",
                  state === "ok" && "border-2 border-success bg-success-soft text-success",
                  state === "bad" && "border-2 border-danger bg-danger-soft text-danger",
                  !state && "border-border bg-surface hover:border-primary hover:bg-primary-soft/40",
                  feedback && !state && "opacity-60",
                )}
              >
                <kbd className="hidden size-6 place-items-center rounded-md border border-border text-[11px] text-muted sm:grid">{i + 1}</kbd>
                <span className="flex-1" lang={ex.type === "meaning_mc" ? "es" : language}>{o}</span>
                {state === "ok" && <Check size={18} aria-hidden />}
                {state === "bad" && <X size={18} aria-hidden />}
              </button>
            );
          })}
        </div>
      )}

      {ex.input === "text" && (ex.type !== "dictation" || supported) && (
        <form className="mt-5" onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit(ex, text); }}>
          <label className="sr-only" htmlFor="answer">Tu respuesta</label>
          <input
            id="answer"
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            lang={language}
            dir={dir}
            placeholder="Escribe tu respuesta…"
            className={cn(
              "h-14 w-full rounded-2xl border-2 bg-surface px-4 text-lg outline-none transition focus:border-primary",
              feedback ? (feedback.correct ? "border-success" : "border-danger") : "border-border",
            )}
          />
          {!feedback && (
            <Button type="submit" size="lg" className="mt-4 w-full" disabled={!text.trim() || submitting}>
              {submitting ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} Comprobar
            </Button>
          )}
        </form>
      )}

      {ex.input === "order" && ex.tokens && (
        <div className="mt-5">
          <div className="min-h-16 rounded-2xl border-2 border-dashed border-border p-3" aria-label="Tu frase" lang={language} dir={dir}>
            <div className="flex flex-wrap gap-2">
              {order.map((ti, pos) => (
                <button key={`${ti}-${pos}`} type="button" disabled={disabled} onClick={() => setOrder((o) => o.filter((_, p) => p !== pos))} className="rounded-xl border border-primary bg-primary-soft px-3 py-2 font-medium text-primary">
                  {ex.tokens![ti]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" lang={language} dir={dir}>
            {ex.tokens.map((t, ti) => (
              <button key={ti} type="button" disabled={disabled || order.includes(ti)} onClick={() => setOrder((o) => [...o, ti])} className={cn("rounded-xl border border-border bg-surface px-3 py-2 font-medium transition", order.includes(ti) && "opacity-30")}>
                {t}
              </button>
            ))}
          </div>
          {!feedback && (
            <Button size="lg" className="mt-5 w-full" disabled={order.length !== ex.tokens.length || submitting} onClick={() => onSubmit(ex, order.map((i) => ex.tokens![i]).join(" "))}>
              Comprobar
            </Button>
          )}
        </div>
      )}

      {ex.input === "match" && ex.pairs && <MatchInput ex={ex} language={language} disabled={disabled} onDone={(pairs) => onSubmit(ex, "", pairs)} />}

      {ex.input === "speech" && <SpeechInput locale={locale} disabled={disabled} onResult={(t) => onSubmit(ex, t)} onSkip={onSkip} />}
    </div>
  );
}

type Rec = { lang: string; interimResults: boolean; maxAlternatives: number; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null };

/** Micrófono: el navegador transcribe y el servidor compara palabra por palabra. */
function SpeechInput({ locale, disabled, onResult, onSkip }: { locale: string; disabled: boolean; onResult: (t: string) => void; onSkip: () => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const rec = useRef<Rec | null>(null);
  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    setSupported(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition));
    return () => rec.current?.stop();
  }, []);
  if (supported === false) {
    return (
      <div className="card mt-5 p-5 text-center">
        <p className="text-sm text-muted">Tu navegador no reconoce la voz. Saltamos este ejercicio sin penalizarte.</p>
        <Button className="mt-3" onClick={onSkip}>Saltar</Button>
      </div>
    );
  }
  const start = () => {
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    window.speechSynthesis?.cancel();
    setErr(null);
    const r = new Ctor();
    r.lang = locale;
    r.interimResults = false;
    r.maxAlternatives = 1;
    let said = "";
    r.onresult = (e) => {
      said = Array.from(e.results).map((x) => x[0]?.transcript ?? "").join(" ").trim();
    };
    r.onerror = (e) => {
      if (e.error !== "aborted") setErr(e.error === "not-allowed" ? "Permite el micrófono para practicar la pronunciación." : "No te oímos bien. Inténtalo otra vez.");
    };
    r.onend = () => {
      setListening(false);
      if (said) onResult(said);
    };
    rec.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  };
  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={listening ? () => rec.current?.stop() : start}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Detener" : "Pulsa y lee la frase"}
        className={cn("relative grid size-20 place-items-center rounded-full text-white shadow-lg transition active:scale-95 disabled:opacity-50", listening ? "bg-danger" : "bg-primary hover:scale-105")}
      >
        {listening && <span className="absolute inset-0 animate-ping rounded-full bg-danger opacity-40" aria-hidden />}
        <Mic size={32} aria-hidden />
      </button>
      <p className="text-sm text-muted" aria-live="polite">{listening ? "Te escucho…" : "Pulsa el micrófono y lee la frase"}</p>
      {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      {!disabled && !listening && (
        <button type="button" onClick={onSkip} className="text-xs text-muted hover:text-text">Ahora no puedo hablar</button>
      )}
    </div>
  );
}

function MatchInput({ ex, language, disabled, onDone }: { ex: Exercise; language: string; disabled: boolean; onDone: (pairs: Record<string, string>) => void }) {
  const [left, setLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const used = useMemo(() => new Set(Object.values(pairs)), [pairs]);
  const total = ex.pairs!.left.length;

  const pick = (r: string) => {
    if (!left) return;
    const nextPairs = { ...pairs, [left]: r };
    setPairs(nextPairs);
    setLeft(null);
    if (Object.keys(nextPairs).length === total) onDone(nextPairs);
  };

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <div className="space-y-2" lang={language}>
        {ex.pairs!.left.map((l) => (
          <button key={l} type="button" disabled={disabled || l in pairs} aria-pressed={left === l} onClick={() => setLeft(l)} className={cn("w-full rounded-2xl border px-3 py-3 text-left font-medium transition", left === l ? "border-2 border-primary bg-primary-soft" : "border-border bg-surface", l in pairs && "opacity-40")}>
            {l}
          </button>
        ))}
      </div>
      <div className="space-y-2" lang="es">
        {ex.pairs!.right.map((r) => (
          <button key={r} type="button" disabled={disabled || used.has(r) || !left} onClick={() => pick(r)} className={cn("w-full rounded-2xl border border-border bg-surface px-3 py-3 text-left font-medium transition", used.has(r) && "opacity-40", left && !used.has(r) && "hover:border-primary")}>
            {r}
          </button>
        ))}
      </div>
      {Object.keys(pairs).length > 0 && !disabled && (
        <button type="button" onClick={() => setPairs({})} className="col-span-2 text-sm font-semibold text-muted hover:text-text">Reiniciar parejas</button>
      )}
    </div>
  );
}

/** "¿Lo sabías con seguridad?": si adivinó, la palabra se repasará antes. */
function ConfidenceCheck({ attemptId }: { attemptId: string }) {
  const [answer, setAnswer] = useState<"sure" | "guessed" | null>(null);
  const choose = (guessed: boolean) => {
    setAnswer(guessed ? "guessed" : "sure");
    void reviseConfidenceAction(attemptId, guessed);
  };
  if (answer) {
    return (
      <p className="mt-3 text-sm text-muted" role="status">
        {answer === "guessed" ? "Anotado: la repasarás antes para fijarla." : "¡Bien! La espaciaremos más."}
      </p>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-muted">
      <span className="flex-1">¿Lo sabías con seguridad?</span>
      <button type="button" onClick={() => choose(false)} className="rounded-full bg-surface px-3 py-1 font-semibold text-success hover:brightness-95">Sí</button>
      <button type="button" onClick={() => choose(true)} className="rounded-full bg-surface px-3 py-1 font-semibold text-text hover:brightness-95">Adiviné</button>
    </div>
  );
}

const PRAISE = ["¡Correcto!", "¡Eso es!", "¡Genial!", "¡Muy bien!", "¡Perfecto!", "¡Exacto!"];

function FeedbackSheet({ feedback: f, onNext, combo, explain }: { feedback: AnswerFeedback; onNext: () => void; combo: number; explain: { key: string; response: string } | null }) {
  const ok = f.correct;
  const [why, setWhy] = useState<{ state: "idle" | "loading" | "done" | "error"; text?: string }>({ state: "idle" });
  const askWhy = async () => {
    if (!explain) return;
    setWhy({ state: "loading" });
    const r = await explainMistakeAction(explain.key, explain.response);
    setWhy(r.ok ? { state: "done", text: r.data } : { state: "error", text: r.error });
  };
  const praise = combo >= 5 ? `¡Imparable! ${combo} seguidas` : combo >= 3 ? `¡En racha! ${combo} seguidas` : PRAISE[(combo + (f.attemptId?.length ?? 0)) % PRAISE.length]!;
  return (
    <div role="status" aria-live="assertive" className={cn("fixed inset-x-0 bottom-0 z-40 animate-rise rounded-t-3xl px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-5 shadow-[0_-8px_30px_rgb(0_0_0/0.08)]", ok ? "bg-success-soft" : "bg-danger-soft")}>
      <div className="mx-auto max-w-2xl">
        <p className={cn("flex items-center gap-2 font-display text-xl font-extrabold", ok ? "text-success" : "text-danger")}>
          <span className={cn("grid size-8 place-items-center rounded-full text-white animate-pop-in", ok ? "bg-success" : "bg-danger")} aria-hidden>
            {ok ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
          </span>
          {ok ? (f.nearMiss ? "¡Casi perfecto!" : praise) : f.expected ? "Respuesta correcta:" : "Ups"}
        </p>
        {!ok && f.expected && <p className="mt-1 text-lg font-semibold">{f.expected}</p>}
        {ok && f.nearMiss && (
          <p className="mt-1 text-sm">{f.note === "accent" ? "Ojo con los acentos: " : "Pequeña errata. Se escribe: "}<strong>{f.expected}</strong></p>
        )}
        {f.explanation && <p className="mt-2 text-sm leading-relaxed">{f.explanation}</p>}
        {!ok && f.errorLabel && <p className="mt-2 text-xs text-muted">Registrado como: {f.errorLabel}. Lo tendremos en cuenta en tus próximas sesiones.</p>}
        {explain && why.state === "idle" && (
          <button type="button" onClick={() => void askWhy()} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-primary shadow-sm hover:brightness-95">
            <Lightbulb size={15} aria-hidden /> ¿Por qué? Explícamelo
          </button>
        )}
        {why.state === "loading" && <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Loader2 size={14} className="animate-spin" aria-hidden /> Tu tutor lo está pensando…</p>}
        {why.state === "done" && <p className="mt-3 rounded-xl bg-surface p-3 text-sm leading-relaxed animate-fade">💡 {why.text}</p>}
        {why.state === "error" && <p className="mt-3 text-sm text-danger">{why.text}</p>}
        {ok && f.attemptId && <ConfidenceCheck attemptId={f.attemptId} />}
        <Button size="lg" variant={ok ? "success" : "danger"} className="mt-4 w-full" onClick={onNext} autoFocus>
          Continuar
        </Button>
      </div>
    </div>
  );
}

/** Reloj de la sesión: tiempo real frente al objetivo, con anillo de progreso. */
function SessionClock({ seconds, target }: { seconds: number; target: number }) {
  const pct = Math.min(1, seconds / Math.max(60, target));
  const over = seconds >= target;
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold tabular-nums", over ? "bg-success-soft text-success" : "bg-surface-muted text-muted")} title={`Objetivo: ${Math.round(target / 60)} min`}>
      <svg width={22} height={22} viewBox="0 0 22 22" className="-rotate-90" aria-hidden>
        <circle cx={11} cy={11} r={r} fill="none" stroke="var(--border)" strokeWidth={3} />
        <circle cx={11} cy={11} r={r} fill="none" stroke={over ? "var(--success)" : "var(--primary)"} strokeWidth={3} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <span aria-label={`Tiempo de estudio ${formatClock(seconds)} de ${Math.round(target / 60)} minutos`}>{formatClock(seconds)}</span>
    </span>
  );
}

/** Aviso no intrusivo: el temporizador cree que te vendría bien una pausa. */
function BreakSuggestion({ reading, plan, onTake, onFinish, onDismiss }: { reading: FocusReading; plan: BreakPlan; onTake: () => void; onFinish: () => void; onDismiss: () => void }) {
  const stop = reading.advice === "stop";
  const mins = Math.round(plan.seconds / 60);
  return (
    <div role="status" className="mt-4 flex flex-col gap-3 rounded-2xl border border-success/40 bg-success-soft p-4 text-sm animate-sheet sm:flex-row sm:items-center">
      <span className="text-2xl" aria-hidden>{stop ? "🌙" : "☕"}</span>
      <div className="flex-1">
        <p className="font-semibold">{stop ? "Buen momento para terminar" : `¿Una pausa de ${mins === 1 ? "1 minuto" : `${mins} minutos`}?`}</p>
        <p className="text-muted">{stop ? "Tu atención está bajando: lo practicado se consolida mejor si descansas ahora. " : ""}{plan.why}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {stop ? <Button size="sm" variant="success" onClick={onFinish}>Terminar sesión</Button> : <Button size="sm" variant="success" onClick={onTake}>Tomar pausa</Button>}
        {stop && <Button size="sm" variant="secondary" onClick={onTake}>Pausa y seguir</Button>}
        <Button size="sm" variant="ghost" onClick={onDismiss}>Seguir</Button>
      </div>
    </div>
  );
}
