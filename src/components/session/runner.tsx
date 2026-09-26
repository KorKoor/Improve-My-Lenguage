"use client";
import { ArrowRight, Check, Headphones, Keyboard, Lightbulb, Loader2, MessageCircle, Mic, Snail, Trophy, Volume2, X } from "lucide-react";
import { POS_ES } from "@/components/app/labels";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { explainMistakeAction, tooHardAction, finishSessionAction, reviseConfidenceAction, startSessionAction, submitAnswerAction } from "@/app/app/actions";
import { BLOCK_META } from "@/components/app/labels";
import { Confetti, CountUp } from "@/components/celebrate";
import { Afi } from "@/components/afi/afi";
import { afiAnswerLine, afiSessionLine } from "@/lib/engine/afi-voice";
import { SpeakButton, useSpeech, VoiceWarning } from "@/components/speak-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { Exercise } from "@/lib/engine/exercises";
import { fatigueOnset, planBreak, readFocus, type BreakPlan, type FocusEvent, type FocusReading } from "@/lib/engine/focus";
import { BreakCoach, formatClock } from "@/components/focus/break-coach";
import { PlanNext } from "@/components/focus/plan-next";
import { ReportButton } from "@/components/report-button";
import { ScriptKeyboard } from "@/components/script-keyboard";
import { charBreakdown } from "@/lib/content/alphabets";
import { LetterStep, RuleStep } from "@/components/session/reading-steps";
import { Stressed } from "@/components/stressed";
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
  /** El alumno quiere sugerencias de pausa. */
  smartBreaks?: boolean;
  /** Principiante: el audio suena más despacio por defecto. */
  gentle?: boolean;
  /** Nombre del idioma (para el aviso de voz ausente). */
  languageName?: string;
  /** Repaso intercalado: datos de cada idioma para cambiar voz y dirección por ejercicio. */
  languages?: Record<string, { locale: string; rtl: boolean; name: string }>;
  /** Cómo se muestra la transcripción latina: se va ocultando a medida que dominas las letras. */
  romanLevel?: RomanLevel;
  /** Modo accesible (lector de pantalla o poca vista): atajos visibles desde el principio. */
  audioFirst?: boolean;
}

export type RomanLevel = "show" | "dim" | "tap";


export function SessionRunner({ minutes, focus, surprise, locale, language, rtl, title, aiEnabled = false, span = 15, smartBreaks = true, gentle = false, languageName = "", languages, romanLevel = "show", audioFirst = false }: Props) {
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
  const [lightened, setLightened] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  /**
   * Con fatiga alta, las palabras nuevas se retienen peor: si el alumno
   * decide seguir, quitamos las que quedaban (intro + ejercicios) y la
   * sesión continúa con repaso y práctica de lo ya conocido.
   */
  const lighten = (reading: FocusReading) => {
    if (reading.fatigue < 0.6) return;
    setQueue((q) => {
      const future = q.slice(index + 1);
      const kept = future.filter((s) => s.block !== "new_words" || ("retry" in s && s.retry));
      const removed = future.length - kept.length;
      if (removed === 0 || kept.length < 3) return q;
      setLightened(removed);
      return [...q.slice(0, index + 1), ...kept];
    });
  };
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
  // Fallos seguidos: con 2 o más, menos opciones, audio más lento y una pista.
  const [fails, setFails] = useState(0);
  const struggling = fails >= 2;
  // Atajos de teclado: «?» los muestra (en modo accesible, abiertos al empezar).
  const [shortcuts, setShortcuts] = useState(audioFirst);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) setShortcuts((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // Con 5 aciertos seguidos, menos ayudas (la transcripción se esconde un nivel más).
  const challenge = combo.now >= 5;
  const roman: RomanLevel = challenge ? (romanLevel === "show" ? "dim" : "tap") : romanLevel;
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

  // Muchos fallos al principio: ofrecer bajar el nivel (una vez por sesión).
  const [easier, setEasier] = useState<"hidden" | "offer" | "done">("hidden");
  useEffect(() => {
    if (easier === "hidden" && results.total >= 6 && results.correct / results.total < 0.4) setEasier("offer");
  }, [results, easier]);
  const makeEasier = async () => {
    const r = await tooHardAction();
    if (!r.ok) return;
    setEasier("done");
    setSuggestion(null);
    lastBreakAt.current = Date.now();
    setCombo({ now: 0, best: 0 });
    setResults({ total: 0, correct: 0 });
    focusEvents.current = [];
    await load();
  };

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
    async (ex: Exercise, response: string, pairs?: Record<string, string>, attempts = 1) => {
      if (submitting || feedback) return;
      setSubmitting(true);
      setGaveUp(!response.trim() && ex.input !== "match");
      setLastAnswer({ key: ex.key, response });
      const res = await submitAnswerAction({
        sessionId,
        key: ex.key,
        response,
        pairs,
        timeMs: Date.now() - stepStartedAt.current,
        attempts,
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
      setFails((f) => (res.data.correct ? 0 : f + 1));
      // Lectura de foco tras cada respuesta: ¿toca una pausa?
      const nowMs = Date.now();
      // «No lo sé» no es cansancio: no entra en la lectura de foco.
      if (response.trim() || ex.input === "match") focusEvents.current.push({ correct: res.data.correct, timeMs: nowMs - stepStartedAt.current, atMin: (nowMs - startedAt.current - breakMs.current) / 60000 });
      const reading = readFocus(focusEvents.current, { span, sinceBreakMin: (nowMs - lastBreakAt.current) / 60000 });
      if (smartBreaks && reading.advice !== "continue" && nowMs >= snoozeUntil.current) {
        setSuggestion({ reading, plan: planBreak(reading, (nowMs - startedAt.current - breakMs.current) / 60000, focusEvents.current.length) });
      }
      // Lo fallado vuelve a salir al final (una vez): recuperación inmediata.
      const current = queue[index];
      if (!res.data.correct && current && !current.retry && ex.type !== "match") {
        setQueue((q) => [...q, { ...current, uid: current.uid + "-r", retry: true }]);
      }
    },
    [submitting, feedback, sessionId, queue, index, span, smartBreaks],
  );

  if (status === "loading") {
    return (
      <div className="grid flex-1 place-items-center py-20 text-center" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <Afi size={100} mood="thinking" motion="breathe" />
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
          <Afi size={100} mood="supportive" />
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
          <Afi size={110} mood="happy" />
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
        <Afi size={130} mood={afiSessionLine(acc).mood} motion="hop" />
        <h1 className="font-display text-3xl font-extrabold">{acc !== null && acc >= 90 ? "Sesión brillante" : "Sesión completada"}</h1>
        <p className="-mt-2 max-w-sm text-sm text-muted"><span className="sr-only">Afi: </span>{afiSessionLine(acc).text}</p>
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
        {summary?.lesson && (
          <div className={`w-full max-w-md rounded-2xl p-4 text-left animate-pop-in ${summary.lesson.passed ? "bg-success-soft" : "bg-warning-soft"}`} role="status">
            {summary.lesson.passed ? (
              <>
                <p className="font-display text-xl font-extrabold">¡Lección {summary.lesson.n} aprobada! {"⭐".repeat(summary.lesson.stars)}</p>
                {summary.lesson.next ? <p className="mt-1 text-sm">Siguiente: <strong>{summary.lesson.title}</strong></p> : <p className="mt-1 text-sm">¡Has terminado el Camino guiado! Ya tienes una base A1 sólida.</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.lesson.next && <ButtonLink href={`/app/session?lesson=${summary.lesson.next}`}>Lección {summary.lesson.next} <ArrowRight size={16} aria-hidden /></ButtonLink>}
                  {summary.lesson.storyId && <ButtonLink href={`/app/stories/${summary.lesson.storyId}`} variant="secondary">📚 Leer una historia</ButtonLink>}
                </div>
              </>
            ) : (
              <>
                <p className="font-display text-xl font-extrabold">Casi: repítela una vez más</p>
                <p className="mt-1 text-sm">Para aprobar hace falta acertar el 60 %. La segunda vez va mucho mejor: ya conoces las palabras.</p>
                <ButtonLink href={`/app/session?lesson=${summary.lesson.n}&again=${Date.now() % 100000}`} className="mt-3">Repetir la lección {summary.lesson.n}</ButtonLink>
              </>
            )}
          </div>
        )}
        {summary?.phase && (
          <div className={`w-full max-w-md rounded-2xl p-4 text-left animate-pop-in ${summary.phase.passed ? "bg-success-soft" : "bg-warning-soft"}`} role="status">
            {summary.phase.milestone && <p className="mb-2 font-display text-2xl font-extrabold text-primary">🎉 {summary.phase.milestone}</p>}
            {summary.phase.passed ? (
              <>
                <p className="font-display text-xl font-extrabold">¡Superado! {"⭐".repeat(summary.phase.stars)}</p>
                {summary.phase.next ? <p className="mt-1 text-sm">Siguiente: <strong>{summary.phase.next.title}</strong></p> : <p className="mt-1 text-sm">Ya sabes leer lo básico. ¡A por el Camino guiado!</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.phase.next ? (
                    <ButtonLink href={summary.phase.next.kind === "strokes" ? "/app/start/strokes" : `/app/session?phase=${encodeURIComponent(summary.phase.next.id)}`}>Seguir <ArrowRight size={16} aria-hidden /></ButtonLink>
                  ) : (
                    <ButtonLink href="/app/session?lesson=1">Lección 1 <ArrowRight size={16} aria-hidden /></ButtonLink>
                  )}
                  <ButtonLink href="/app/start" variant="secondary">Ver la Fase 0</ButtonLink>
                </div>
              </>
            ) : (
              <>
                <p className="font-display text-xl font-extrabold">Casi: repítela una vez más</p>
                <p className="mt-1 text-sm">Hace falta acertar el 60 %. La segunda vez sale mucho mejor: ya las has visto.</p>
                <ButtonLink href={`/app/session?phase=${encodeURIComponent(summary.phase.unitId)}&again=${Date.now() % 100000}`} className="mt-3">Repetir</ButtonLink>
              </>
            )}
          </div>
        )}
        {summary?.writing && (
          <div className={`w-full max-w-md rounded-2xl p-4 text-left animate-pop-in ${summary.writing.passed ? "bg-success-soft" : "bg-warning-soft"}`} role="status">
            <p className="font-display text-xl font-extrabold">{summary.writing.passed ? `¡${summary.writing.title}: hecho! ${"⭐".repeat(summary.writing.stars)}` : "Casi: repítela una vez más"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!summary.writing.passed && <ButtonLink href={`/app/session?writing=${encodeURIComponent(summary.writing.unitId)}&again=${Date.now() % 100000}`}>Repetir</ButtonLink>}
              <ButtonLink href="/app/writing-system" variant="secondary">Escritura y ortografía</ButtonLink>
            </div>
          </div>
        )}
        {summary?.levelAdjusted && (
          <p className="max-w-md rounded-2xl bg-primary-soft px-4 py-3 text-sm animate-pop-in" role="status">
            {summary.levelAdjusted.direction === "down" ? "🌱" : "🚀"} <strong>Hemos ajustado tu nivel a {summary.levelAdjusted.level}</strong> porque {summary.levelAdjusted.reason}.{" "}
            {summary.levelAdjusted.direction === "down" ? "Tus próximas sesiones empezarán con ejercicios más sencillos." : "Tus próximas sesiones serán un poco más exigentes."}
          </p>
        )}
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
      <h1 className="sr-only">{title}</h1>
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        <Link href="/app" aria-label="Salir de la sesión" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted hover:text-text">
          <X size={20} />
        </Link>
        <ProgressBar value={progress} label={`${title}: paso ${index + 1} de ${queue.length}`} height={10} className="flex-1" />
        <span className="text-xs font-semibold text-muted tabular-nums" aria-hidden>{index + 1}/{queue.length}</span>
        <SessionClock seconds={clock} target={minutes * 60} />
        <button type="button" onClick={() => setShortcuts((v) => !v)} aria-expanded={shortcuts} aria-controls="shortcuts" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted hover:text-text" aria-label="Atajos de teclado" title="Atajos de teclado (?)">
          <Keyboard size={18} aria-hidden />
        </button>
      </div>
      {shortcuts && (
        <section id="shortcuts" aria-label="Atajos de teclado" className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm animate-rise">
          <p className="font-semibold">Atajos de teclado</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            <li><kbd className="rounded border border-border px-1.5">1</kbd>–<kbd className="rounded border border-border px-1.5">4</kbd> elegir una opción</li>
            <li><kbd className="rounded border border-border px-1.5">R</kbd> repetir el audio</li>
            <li><kbd className="rounded border border-border px-1.5">L</kbd> audio lento</li>
            <li><kbd className="rounded border border-border px-1.5">N</kbd> no lo sé</li>
            <li><kbd className="rounded border border-border px-1.5">Intro</kbd> continuar</li>
            <li><kbd className="rounded border border-border px-1.5">?</kbd> mostrar u ocultar esta ayuda</li>
          </ul>
          <button type="button" onClick={() => setShortcuts(false)} className="mt-2 text-xs font-semibold text-primary hover:underline">Ocultar</button>
        </section>
      )}
      {languageName && <VoiceWarning locale={locale} languageName={languageName} />}
      {index >= 1 && !feedback && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("¿Hacemos la sesión más fácil? Bajaremos tu nivel en este idioma y empezaremos con ejercicios de elegir y escuchar.")) void makeEasier();
            }}
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-muted hover:bg-surface-muted hover:text-text"
          >
            😵 Esto es muy difícil
          </button>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-[#14121c]" style={{ background: meta.color }}>
          <meta.icon size={13} aria-hidden /> {meta.label}
        </span>
        {"retry" in step && step.retry ? <Chip tone="warning">Otra oportunidad</Chip> : null}
        {lightened > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success animate-pop-in" title="Con cansancio las palabras nuevas se fijan peor: volverán en otra sesión.">
            🪶 Sesión aligerada: sin palabras nuevas
          </span>
        ) : null}
        {struggling ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary animate-pop-in">
            🐢 Vamos más despacio: menos opciones y una pista
          </span>
        ) : challenge ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success animate-pop-in">
            🚀 Vas genial: menos ayudas
          </span>
        ) : null}
        {combo.now >= 3 ? (
          <span key={combo.now} className="ml-auto inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-warning animate-pop-in" aria-label={`${combo.now} aciertos seguidos`}>
            <span className="animate-flame" aria-hidden>🔥</span> {combo.now} seguidas
          </span>
        ) : null}
      </div>

      {easier === "offer" && !feedback && (
        <div role="status" className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-4 text-sm animate-sheet sm:flex-row sm:items-center">
          <span className="text-2xl" aria-hidden>🌱</span>
          <p className="flex-1"><strong>Parece que esto está por encima de tu nivel.</strong> ¿Bajamos la dificultad? Empezarás con ejercicios de elegir y escuchar, y subiremos en cuanto aciertes.</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void makeEasier()}>Sí, más fácil</Button>
            <Button size="sm" variant="ghost" onClick={() => setEasier("done")}>Seguir así</Button>
          </div>
        </div>
      )}
      {suggestion && !feedback && !onBreak && easier !== "offer" && (
        <BreakSuggestion
          reading={suggestion.reading}
          plan={suggestion.plan}
          onTake={() => {
            lighten(suggestion.reading);
            setOnBreak({ plan: suggestion.plan, startedAt: Date.now() });
            setSuggestion(null);
          }}
          onFinish={() => {
            setSuggestion(null);
            void finish();
          }}
          onDismiss={() => {
            // No insistir durante unos minutos.
            lighten(suggestion.reading);
            snoozeUntil.current = Date.now() + 6 * 60_000;
            setSuggestion(null);
          }}
        />
      )}
      <div key={step.uid} className={cn("mt-4", feedback && !feedback.correct && !gaveUp ? "animate-shake" : "animate-rise")} lang={step.kind === "tip" || step.kind === "tutor" ? "es" : undefined}>
        {step.kind === "intro" && <IntroStep step={step} locale={locale} language={language} rtl={rtl} onNext={next} gentle={gentle} roman={roman} />}
        {step.kind === "letter" && <LetterStep letter={step.letter} locale={locale} language={language} rtl={rtl} onNext={next} gentle={gentle || struggling} />}
        {step.kind === "rule" && <RuleStep rule={step.rule} locale={locale} language={language} rtl={rtl} onNext={next} />}
        {step.kind === "tip" && <TipStep step={step} language={language} onNext={next} />}
        {step.kind === "tutor" && <TutorStep minutes={step.minutes} onSkip={next} onGo={() => void finish()} />}
        {step.kind === "exercise" && (
          <>
          {languages && languages[step.exercise.language] && (
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-muted">🌍 {languages[step.exercise.language]!.name}</p>
          )}
          <ExerciseStep
            key={step.uid}
            gentle={gentle || struggling}
            struggling={struggling}
            roman={roman}
            position={`Paso ${index + 1} de ${queue.length}.`}
            exercise={step.exercise}
            locale={languages?.[step.exercise.language]?.locale ?? locale}
            language={step.exercise.language ?? language}
            rtl={languages?.[step.exercise.language]?.rtl ?? rtl}
            disabled={submitting || !!feedback}
            submitting={submitting}
            feedback={feedback}
            onSubmit={submit}
            onSkip={next}
          />
          </>
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
      {feedback && <FeedbackSheet feedback={feedback} gaveUp={gaveUp} explainKey={lastAnswer?.key} onNext={next} combo={combo.now} explain={aiEnabled && !feedback.correct && lastAnswer ? lastAnswer : null} />}
    </div>
  );
}

function IntroStep({ step, locale, language, rtl, onNext, gentle = false, roman = "show" }: { step: Extract<SessionStep, { kind: "intro" }>; locale: string; language: string; rtl: boolean; onNext: () => void; gentle?: boolean; roman?: RomanLevel }) {
  const w = step.word;
  const { speak } = useSpeech(locale);
  useEffect(() => {
    speak(w.lemma, gentle ? 0.8 : 1, w.audioUrl);
  }, [speak, w.lemma, w.audioUrl, gentle]);
  return (
    <div>
      <p className="text-sm font-semibold text-muted">{step.block === "review" ? "Vuelve a mirarla con calma" : w.pos === "phrase" ? "Frase útil" : "Palabra nueva"}</p>
      <div className="card mt-3 p-6">
        <div className="flex items-start gap-3">
          <div className="flex-1" lang={language} dir={rtl ? "rtl" : "ltr"}>
            <p className="font-display text-4xl font-extrabold">{w.lemma}</p>
            <p className="mt-1 text-sm text-muted">
              {w.reading && <><RomanText text={w.reading} level={roman} />{" · "}</>}
              {[w.ipa, POS_ES[w.pos] ?? w.pos].filter(Boolean).join(" · ")}
            </p>
          </div>
          <SpeakButton text={w.lemma} audioUrl={w.audioUrl} locale={locale} size={48} />
        </div>
        <LetterTiles text={w.lemma} language={language} rtl={rtl} onSay={(t) => speak(t, 0.8)} />
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
            {w.example.reading && <p className="mt-1 text-sm text-muted"><RomanText text={w.example.reading} level={roman} /></p>}
            {w.example.translation && <p className="mt-1 text-sm text-muted">{w.example.translation}</p>}
          </div>
        )}
        {w.usageNote && (
          <p className="mt-4 flex gap-2 rounded-2xl bg-warning-soft p-4 text-sm"><Lightbulb size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden /> {w.usageNote}</p>
        )}
        <div className="mt-3 flex justify-end"><ReportButton itemId={w.id} /></div>
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={onNext} autoFocus>Entendido <ArrowRight size={18} aria-hidden /></Button>
    </div>
  );
}

/**
 * Transcripción latina que se va retirando a medida que dominas las letras:
 * visible, atenuada o sólo al tocar (siempre alcanzable con lector de pantalla).
 */
function RomanText({ text, level }: { text: string; level: RomanLevel }) {
  const [open, setOpen] = useState(false);
  if (level === "show") return <span>{text}</span>;
  if (level === "dim") return <span className="opacity-50">{text}</span>;
  return open ? (
    <span>{text}</span>
  ) : (
    <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-dashed border-border px-2 text-xs font-semibold text-muted hover:border-primary hover:text-primary">
      Ver cómo se lee
    </button>
  );
}

/** La palabra letra a letra (escrituras no latinas): cada ficha suena al tocarla. */
function LetterTiles({ text, language, rtl, onSay }: { text: string; language: string; rtl: boolean; onSay: (t: string) => void }) {
  const pieces = useMemo(() => charBreakdown(language, text), [language, text]);
  if (pieces.length < 2 || pieces.length > 14) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-muted">Letra a letra · toca para escuchar</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5" dir={rtl ? "rtl" : "ltr"}>
        {pieces.map((p, i) => (
          <button key={i} type="button" onClick={() => onSay(p.say)} className="flex min-w-11 flex-col items-center rounded-xl border border-border bg-surface px-2 py-1 transition hover:border-primary active:scale-95">
            <span className="text-xl font-bold" lang={language}>{p.ch}</span>
            <span className="text-[11px] text-muted" lang="es" dir="ltr">{p.r ?? "·"}</span>
          </button>
        ))}
      </div>
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
  gentle = false,
  struggling = false,
  roman = "show",
  position = "",
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
  gentle?: boolean;
  struggling?: boolean;
  roman?: RomanLevel;
  /** «Paso 3 de 12.» para el lector de pantalla. */
  position?: string;
  exercise: Exercise;
  locale: string;
  language: string;
  rtl: boolean;
  disabled: boolean;
  submitting: boolean;
  feedback: AnswerFeedback | null;
  onSubmit: (ex: Exercise, response: string, pairs?: Record<string, string>, attempts?: number) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const dir = rtl ? "rtl" : "ltr";
  const optionsInSpanish = ex.optionsLang ? ex.optionsLang === "es" : ex.type === "meaning_mc" || ex.type === "listen_mc" || ex.type === "phrase_listen";
  const promptInSpanish = ex.type === "reverse_mc" || ex.type === "recall" || ex.type === "phrase_pick" || ex.type === "rule_mc";
  // Ejercicios de leer: oír el enunciado antes de responder regalaría la respuesta.
  const readingTest = ex.type === "letter_see" || ex.type === "read_word";
  const listening = !ex.prompt && Boolean(ex.audioText) && ex.input !== "speech";
  const [chosen, setChosen] = useState<string | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const { supported, speak: speakOne, speakSeq } = useSpeech(locale);
  // El deletreo suena letra a letra (varios audios seguidos); lo demás, de una vez.
  const speak = useCallback(
    (text: string, rate = 1, url?: string) => (ex.audioSeq && text === ex.audioText ? speakSeq(ex.audioSeq, rate) : speakOne(text, rate, url)),
    [ex.audioSeq, ex.audioText, speakSeq, speakOne],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listening && ex.audioText) speak(ex.audioText, gentle ? 0.8 : 1, ex.audioUrl);
    if (ex.input === "text") inputRef.current?.focus();
  }, [ex, speak, listening]);
  // Ver la letra → oírla al responder (sin regalar la respuesta antes).
  const answered = Boolean(feedback);
  useEffect(() => {
    if (answered && ex.afterAudio) speak(ex.afterAudio, 0.85, ex.type === "read_word" ? ex.audioUrl : undefined);
  }, [answered, ex, speak]);
  // Atascado: dos opciones en vez de cuatro (si el ejercicio las trae).
  const options = struggling && ex.easy && !answered ? ex.easy : ex.options;

  // Cada ejercicio nuevo: el foco va al enunciado (el lector de pantalla lo lee entero).
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (ex.input !== "text") heading.current?.focus({ preventScroll: true });
  }, [ex]);

  // Atajos: R repetir audio, L lento, N «No lo sé».
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const audio = ex.audioText ?? (answered || !readingTest ? ex.afterAudio : undefined);
      if ((k === "r" || k === "l") && audio) {
        e.preventDefault();
        speak(audio, k === "l" ? 0.6 : gentle ? 0.8 : 1, ex.audioUrl);
      } else if (k === "n" && !disabled && ex.input !== "match" && ex.input !== "speech") {
        e.preventDefault();
        onSubmit(ex, "");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ex, speak, gentle, answered, readingTest, disabled, onSubmit]);

  // Atajos 1–4 para opción múltiple
  useEffect(() => {
    if (ex.input !== "choice" || disabled) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      const opt = options?.[n - 1];
      if (opt && !(e.target instanceof HTMLInputElement)) {
        setChosen(opt);
        if (!optionsInSpanish) speak(opt, gentle ? 0.8 : 1);
        onSubmit(ex, opt);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ex, disabled, onSubmit, speak, gentle, options, optionsInSpanish]);

  return (
    <div>
      <h2 ref={heading} tabIndex={-1} className="text-sm font-semibold text-muted outline-none">
        <span className="sr-only">{position} </span>
        {ex.instruction}
        {listening ? <span className="sr-only">. El audio suena solo; pulsa R para repetirlo.</span> : null}
        {ex.prompt && promptInSpanish ? <span className="sr-only">: {ex.prompt}</span> : null}
      </h2>

      {listening ? (
        supported ? (
          <div className="card mt-3 flex flex-wrap items-center justify-center gap-4 p-8">
            <button type="button" onClick={() => speak(ex.audioText!, gentle ? 0.8 : 1, ex.audioUrl)} className="grid size-20 place-items-center rounded-full bg-primary text-on-primary shadow-lg transition active:scale-95" aria-label="Reproducir audio">
              <Volume2 size={34} />
            </button>
            <button type="button" onClick={() => speak(ex.audioText!, gentle ? 0.55 : 0.7, ex.audioUrl)} className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary transition active:scale-95" aria-label="Reproducir más despacio">
              <Snail size={22} />
            </button>
            {ex.context && ex.type === "dictation_word" && <p className="basis-full text-center text-sm text-muted">Significa «{ex.context}»</p>}
            {ex.context && ex.type === "tone_pick" && <p className="basis-full text-center font-display text-4xl font-extrabold" lang={language}>{ex.context}</p>}
            {ex.context && ex.type === "spell_word" && <p className="basis-full text-center text-sm text-muted">Significa «{ex.context}»</p>}
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
            {promptInSpanish || ex.type === "cloze" || ex.type === "conjugate" || ex.type === "grammar" || ex.type === "rearrange" || (readingTest && !answered) ? (
              <p className={cn("flex-1 font-display font-extrabold", ex.prompt.length > 40 ? "text-xl leading-snug" : readingTest ? "text-6xl" : "text-3xl sm:text-4xl")} lang={promptInSpanish || ex.type === "rearrange" ? "es" : language} dir={promptInSpanish || ex.type === "rearrange" ? "ltr" : dir}>
                {ex.prompt}
              </p>
            ) : (
              // En el idioma que aprendes: tocar el texto también lo lee en voz alta.
              <button type="button" onClick={() => speak(ex.audioText ?? ex.afterAudio ?? ex.prompt, gentle ? 0.8 : 1, ex.audioText || ex.type === "read_word" ? ex.audioUrl : undefined)} className={cn("flex-1 text-start font-display font-extrabold hover:text-primary", ex.prompt.length > 40 ? "text-xl leading-snug" : readingTest ? "text-6xl" : "text-3xl sm:text-4xl")} lang={language} dir={dir} title="Toca para escucharlo">
                {ex.prompt}
              </button>
            )}
            {ex.audioText && !promptInSpanish ? <SpeakButton text={ex.audioText} audioUrl={ex.audioUrl} locale={locale} size={46} /> : null}
          </div>
          {ex.context && ex.type === "rule_mc" ? (
            <button type="button" onClick={() => speak(ex.audioText ?? ex.context!, 0.8)} className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3 text-start transition hover:brightness-95">
              <Volume2 size={18} className="shrink-0 text-primary" aria-hidden />
              <span className="font-display text-3xl font-extrabold" lang={language} dir={dir}><Stressed text={ex.context} /></span>
              <span className="sr-only">. Toca para escucharlo.</span>
            </button>
          ) : ex.context ? (
            <p className="mt-2 text-sm text-muted" lang={ex.type === "cloze" || ex.type === "conjugate" ? "es" : language}>
              {ex.type === "meaning_mc" ? <RomanText text={ex.context} level={roman} /> : ex.context}
            </p>
          ) : null}
        </div>
      ) : null}

      {struggling && ex.clue && !answered && (
        <p className="mt-4 flex gap-2 rounded-2xl bg-warning-soft p-3 text-sm animate-pop-in" role="note">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden /> <span><strong>Pista:</strong> <span lang={ex.type === "read_word" || ex.type === "letter_pair" ? language : "es"}>{ex.clue}</span></span>
        </p>
      )}

      {/* Entrada */}
      {ex.input === "choice" && (
        <div className="mt-5 grid gap-2.5" role="group" aria-label="Opciones">
          {options!.map((o, i) => {
            const isChosen = chosen === o;
            const right = feedback?.answer ?? feedback?.expected;
            const state = feedback && isChosen ? (feedback.correct ? "ok" : "bad") : feedback && !feedback.correct && o === right ? "ok" : null;
            return (
              <button
                key={o}
                type="button"
                disabled={disabled}
                aria-keyshortcuts={String(i + 1)}
                onClick={() => {
                  setChosen(o);
                  if (!optionsInSpanish) speak(o, gentle ? 0.8 : 1);
                  onSubmit(ex, o);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-base font-medium transition",
                  state === "ok" && "border-2 border-success bg-success-soft text-success",
                  state === "bad" && "border-2 border-danger bg-danger-soft text-danger",
                  !state && "border-border bg-surface hover:border-primary hover:bg-primary-soft/40",
                  feedback && !state && "opacity-60",
                )}
              >
                <kbd className="hidden size-6 place-items-center rounded-md border border-border text-[11px] text-muted sm:grid" aria-hidden>{i + 1}</kbd>
                <span className="flex-1" lang={optionsInSpanish ? "es" : language} dir={optionsInSpanish ? "ltr" : dir}>{o}</span>
                {state === "ok" && <Check size={18} aria-hidden />}
                {state === "bad" && <X size={18} aria-hidden />}
              </button>
            );
          })}
        </div>
      )}

      {ex.input === "text" && (!listening || supported) && (
        <form className="mt-5" onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit(ex, text, undefined, showHint ? 2 : 1); }}>
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
          <ScriptKeyboard lang={language} locale={locale} value={text} onChange={setText} disabled={disabled} romanOk={ex.type === "recall" || ex.type === "cloze" || ex.type === "dictation_word"} defaultOpen={ex.type === "spell_word" ? true : undefined} />
          {showHint && ex.hint && !feedback && (
            <p className="mt-2 font-mono text-lg tracking-wider text-primary animate-pop-in" lang={language} aria-label="Pista">{ex.hint}</p>
          )}
          {!feedback && (
            <Button type="submit" size="lg" className="mt-4 w-full" disabled={!text.trim() || submitting}>
              {submitting ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} Comprobar
            </Button>
          )}
        </form>
      )}

      {/* Ayudas: pista (en respuestas escritas) y «No lo sé» (siempre). */}
      {!feedback && ex.input !== "match" && ex.input !== "speech" && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {ex.input === "text" && ex.hint && !showHint && (
            <button type="button" onClick={() => setShowHint(true)} className="rounded-full bg-warning-soft px-3.5 py-2 text-sm font-semibold text-warning hover:brightness-95">
              💡 Pista
            </button>
          )}
          <button type="button" disabled={disabled} onClick={() => onSubmit(ex, "")} className="rounded-full border border-dashed border-border px-3.5 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary">
            🤷 No lo sé
          </button>
        </div>
      )}

      {ex.input === "order" && ex.tokens && (
        <div className="mt-5">
          <div className="min-h-16 rounded-2xl border-2 border-dashed border-border p-3" aria-label="Tu frase" aria-live="polite" lang={language} dir={dir}>
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
              <button key={ti} type="button" disabled={disabled || order.includes(ti)} onClick={() => { setOrder((o) => [...o, ti]); speak(t, gentle ? 0.8 : 1); }} className={cn("rounded-xl border border-border bg-surface px-3 py-2 font-medium transition", order.includes(ti) && "opacity-30")}>
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

      {ex.input === "match" && ex.pairs && <MatchInput ex={ex} language={language} disabled={disabled} onSay={(t) => speak(t, gentle ? 0.8 : 1)} onDone={(pairs) => onSubmit(ex, "", pairs)} />}

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

function MatchInput({ ex, language, disabled, onDone, onSay }: { ex: Exercise; language: string; disabled: boolean; onDone: (pairs: Record<string, string>) => void; onSay: (text: string) => void }) {
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
      <p className="sr-only col-span-2">Elige una palabra de la izquierda y después su significado a la derecha. {Object.keys(pairs).length} de {total} parejas hechas.</p>
      <div className="space-y-2" lang={language}>
        {ex.pairs!.left.map((l) => (
          <button key={l} type="button" disabled={disabled || l in pairs} aria-pressed={left === l} onClick={() => { setLeft(l); onSay(l); }} className={cn("w-full rounded-2xl border px-3 py-3 text-left font-medium transition", left === l ? "border-2 border-primary bg-primary-soft" : "border-border bg-surface", l in pairs && "opacity-40")}>
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

function FeedbackSheet({ feedback: f, gaveUp = false, onNext, combo, explain, explainKey }: { feedback: AnswerFeedback; gaveUp?: boolean; onNext: () => void; combo: number; explain: { key: string; response: string } | null; explainKey?: string }) {
  const ok = f.correct;
  const [why, setWhy] = useState<{ state: "idle" | "loading" | "done" | "error"; text?: string }>({ state: "idle" });
  const askWhy = async () => {
    if (!explain) return;
    setWhy({ state: "loading" });
    const r = await explainMistakeAction(explain.key, explain.response);
    setWhy(r.ok ? { state: "done", text: r.data } : { state: "error", text: r.error });
  };
  // Ítem del ejercicio (palabra o frase) para «Reportar un error»; no en gramática ni emparejar.
  const reportId = explainKey && /^(meaning_mc|reverse_mc|recall|cloze|listen_mc|listen_pick|dictation_word|phrase_listen|phrase_pick)\|/.test(explainKey) ? explainKey.split("|")[1]! : null;
  // Afi reacciona: acompaña en los aciertos y nunca castiga en los fallos.
  const seed = combo + (f.attemptId?.length ?? 0) + (f.expected?.length ?? 0);
  const afi = afiAnswerLine(ok, combo, seed);
  const praise = combo >= 3 ? `${combo} seguidas. ${afi.text}` : afi.text;
  return (
    <div role="status" aria-live="assertive" className={cn("fixed inset-x-0 bottom-0 z-40 animate-rise rounded-t-3xl px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-5 shadow-[0_-8px_30px_rgb(0_0_0/0.08)]", ok ? "bg-success-soft" : gaveUp ? "bg-primary-soft" : "bg-danger-soft")}>
      <div className="mx-auto max-w-2xl">
        {gaveUp ? (
          <>
            <p className="flex items-center gap-2 font-display text-xl font-extrabold text-primary">🌱 Sin problema, así se aprende</p>
            {f.expected && <p className="mt-1 text-lg font-semibold">{f.expected}</p>}
            {f.explanation && <p className="mt-2 text-sm leading-relaxed">{f.explanation}</p>}
            <p className="mt-2 text-sm text-muted">Volverá pronto, primero con opciones para que la reconozcas.</p>
            {reportId && <div className="mt-1"><ReportButton itemId={reportId} /></div>}
            <Button size="lg" className="mt-4 w-full" onClick={onNext} autoFocus>Continuar</Button>
          </>
        ) : (<>
        <p className={cn("flex items-center gap-2 font-display text-xl font-extrabold", ok ? "text-success" : "text-danger")}>
          <span className={cn("grid size-8 place-items-center rounded-full text-white animate-pop-in", ok ? "bg-success" : "bg-danger")} aria-hidden>
            {ok ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
          </span>
          {ok ? (f.nearMiss ? "Casi perfecto." : praise) : f.expected ? "Respuesta correcta:" : "Todavía no"}
          <Afi size={40} mood={ok ? afi.mood : "supportive"} motion={ok ? "hop" : "sway"} className="ml-auto" />
        </p>
        {!ok && f.expected && <p className="mt-1 text-lg font-semibold">{f.expected}</p>}
        {ok && f.nearMiss && (
          <p className="mt-1 text-sm">{f.note === "accent" ? "Ojo con los acentos: " : f.note === "caps" ? "Ojo: en alemán los sustantivos van con mayúscula: " : f.note === "roman" ? "Bien, lo escribiste en letras latinas. En su escritura es: " : "Pequeña errata. Se escribe: "}<strong>{f.expected}</strong></p>
        )}
        {f.explanation && <p className="mt-2 text-sm leading-relaxed">{f.explanation}</p>}
        {f.milestone && <p className="mt-3 rounded-xl bg-surface px-3 py-2 font-display text-lg font-extrabold text-primary animate-pop-in">🎉 {f.milestone}</p>}
        {!ok && <p className="mt-2 text-sm"><span className="sr-only">Afi: </span>{afi.text}</p>}
        {!ok && f.errorLabel && <p className="mt-1 text-xs text-muted">Registrado como: {f.errorLabel}. Lo tendremos en cuenta en tus próximas sesiones.</p>}
        {explain && why.state === "idle" && (
          <button type="button" onClick={() => void askWhy()} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-primary shadow-sm hover:brightness-95">
            <Lightbulb size={15} aria-hidden /> ¿Por qué? Explícamelo
          </button>
        )}
        {why.state === "loading" && <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Loader2 size={14} className="animate-spin" aria-hidden /> Tu tutor lo está pensando…</p>}
        {why.state === "done" && <p className="mt-3 rounded-xl bg-surface p-3 text-sm leading-relaxed animate-fade">💡 {why.text}</p>}
        {why.state === "error" && <p className="mt-3 text-sm text-danger">{why.text}</p>}
        {ok && f.attemptId && <ConfidenceCheck attemptId={f.attemptId} />}
        {reportId && <div className="mt-2"><ReportButton itemId={reportId} /></div>}
        <Button size="lg" variant={ok ? "success" : "danger"} className="mt-4 w-full" onClick={onNext} autoFocus>
          Continuar
        </Button>
        </>)}
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
