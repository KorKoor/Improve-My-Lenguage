"use client";
import { ArrowRight, Loader2, Mic, MicOff, RotateCcw, Snail, Trophy, Volume2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { answerSpeakingAction, finishSpeakingAction, startSpeakingAction } from "@/app/app/skills-actions";
import { Confetti } from "@/components/celebrate";
import { useSpeech } from "@/components/speak-button";
import { PitchCompare } from "./pitch-compare";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { SpeakingFeedback, SpeakingItem } from "@/lib/services/speaking";

// Tipos mínimos de la Web Speech API (no están en lib.dom de TypeScript).
interface RecognitionAlternative { transcript: string }
interface RecognitionResult { isFinal: boolean; length: number; [i: number]: RecognitionAlternative }
interface RecognitionEvent { resultIndex: number; results: { length: number; [i: number]: RecognitionResult } }
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Necesitamos permiso para usar el micrófono. Actívalo en el candado de la barra de direcciones.",
  "service-not-allowed": "Tu navegador no permite el reconocimiento de voz aquí.",
  "no-speech": "No te oímos. Pulsa el micrófono y lee la frase en voz alta.",
  "audio-capture": "No encontramos ningún micrófono.",
  network: "El reconocimiento de voz necesita conexión a internet.",
};

export function SpeakingRunner({ languageName }: { languageName: string }) {
  const [state, setState] = useState<"intro" | "loading" | "running" | "done" | "empty" | "error" | "unsupported">("intro");
  const [items, setItems] = useState<SpeakingItem[]>([]);
  const [locale, setLocale] = useState("en-US");
  const [i, setI] = useState(0);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [fb, setFb] = useState<SpeakingFeedback | null>(null);
  const [tries, setTries] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [achievements, setAchievements] = useState<{ id: string; title: string; icon: string }[]>([]);
  const rec = useRef<Recognition | null>(null);
  const started = useRef(Date.now());
  const item = items[i];
  const { speak } = useSpeech(locale);

  useEffect(() => {
    if (!recognitionCtor()) setState("unsupported");
    return () => rec.current?.abort();
  }, []);

  async function begin() {
    setState("loading");
    const r = await startSpeakingAction();
    if (!r.ok) {
      setErr(r.error);
      return setState("error");
    }
    if (r.data.items.length === 0) return setState("empty");
    setItems(r.data.items);
    setLocale(r.data.locale);
    setI(0);
    setScore(0);
    setState("running");
  }

  const grade = useCallback(
    async (alternatives: string[]) => {
      if (!item) return;
      setBusy(true);
      const r = await answerSpeakingAction(item.key, alternatives, Date.now() - started.current);
      setBusy(false);
      if (!r.ok) return setErr(r.error);
      setFb(r.data);
      setTries((t) => t + 1);
    },
    [item],
  );

  function listen() {
    const Ctor = recognitionCtor();
    if (!Ctor || !item) return;
    window.speechSynthesis?.cancel();
    setErr(null);
    setFb(null);
    setInterim("");
    const r = new Ctor();
    r.lang = locale;
    r.interimResults = true;
    r.maxAlternatives = 4;
    r.continuous = false;
    let finals: string[] = [];
    r.onresult = (e) => {
      let text = "";
      for (let k = e.resultIndex; k < e.results.length; k++) {
        const res = e.results[k]!;
        if (res.isFinal) {
          finals = Array.from({ length: res.length }, (_, a) => res[a]!.transcript);
        } else text += res[0]!.transcript;
      }
      setInterim(finals[0] ?? text);
    };
    r.onerror = (e) => {
      if (e.error !== "aborted") setErr(ERRORS[e.error] ?? "No pudimos reconocer tu voz. Inténtalo de nuevo.");
    };
    r.onend = () => {
      setListening(false);
      if (finals.length) void grade(finals);
    };
    rec.current = r;
    started.current = Date.now();
    setListening(true);
    r.start();
  }

  function stop() {
    rec.current?.stop();
  }

  async function next() {
    const ok = fb?.correct ?? false;
    const newScore = score + (ok ? 1 : 0);
    setScore(newScore);
    setFb(null);
    setTries(0);
    setInterim("");
    if (i + 1 >= items.length) {
      setState("done");
      const r = await finishSpeakingAction(newScore, items.length);
      if (r.ok) setAchievements(r.data.newAchievements);
    } else setI(i + 1);
  }

  if (state === "unsupported") {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-6 text-center">
        <MicOff className="mx-auto text-muted" size={40} aria-hidden />
        <h2 className="font-display text-xl font-bold">Tu navegador no reconoce la voz</h2>
        <p className="text-sm text-muted">La práctica de pronunciación funciona en Chrome, Edge y Safari recientes. Mientras tanto, puedes entrenar el oído en Escucha.</p>
        <Link href="/app/listen" className="font-semibold text-primary">Ir a Escucha →</Link>
      </div>
    );
  }

  if (state === "intro" || state === "loading") {
    return (
      <div className="card mx-auto max-w-xl space-y-4 p-6 text-center sm:p-8">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary-soft text-primary animate-float" aria-hidden>
          <Mic size={36} />
        </span>
        <h2 className="font-display text-2xl font-extrabold">Habla {languageName.toLowerCase()} en voz alta</h2>
        <p className="text-muted">Lee 8 frases reales de tu nivel. Escucha el modelo, pulsa el micrófono y léela: te decimos qué palabras se entendieron bien.</p>
        <p className="text-xs text-muted">No guardamos grabaciones: el reconocimiento lo hace tu navegador (en Chrome, con los servidores de Google) y a nosotros sólo nos llega el texto.</p>
        <Button size="lg" onClick={begin} disabled={state === "loading"}>
          {state === "loading" ? <Loader2 className="animate-spin" size={18} aria-hidden /> : <Mic size={18} aria-hidden />} Empezar
        </Button>
      </div>
    );
  }

  if (state === "empty" || state === "error") {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-6 text-center">
        <p className="font-semibold">{state === "empty" ? "Aún no tenemos frases adecuadas para tu nivel en este idioma." : err}</p>
        <Button variant="secondary" onClick={begin}>Reintentar</Button>
      </div>
    );
  }

  if (state === "done") {
    const pct = Math.round((score / Math.max(1, items.length)) * 100);
    return (
      <div className="card mx-auto max-w-xl space-y-4 p-8 text-center animate-rise">
        {pct >= 70 && <Confetti />}
        <Trophy className="mx-auto text-warning animate-pop-in" size={44} aria-hidden />
        <h2 className="font-display text-2xl font-extrabold">{pct >= 90 ? "¡Pronunciación de lujo!" : pct >= 70 ? "¡Muy bien dicho!" : "¡Buen entrenamiento!"}</h2>
        <p className="text-muted">Se entendieron {score} de {items.length} frases a la primera o tras repetir.</p>
        {achievements.map((a) => (
          <p key={a.id} className="font-semibold text-primary">{a.icon} Logro: {a.title}</p>
        ))}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={begin}><RotateCcw size={16} aria-hidden /> Otra ronda</Button>
          <Link href="/app/explore" className="inline-flex h-11 items-center px-4 font-semibold text-primary">Practicar otra cosa</Link>
        </div>
      </div>
    );
  }

  if (!item) return null;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <ProgressBar value={i / items.length} label={`Frase ${i + 1} de ${items.length}`} height={10} />
      <section key={item.key} className="card space-y-5 p-6 animate-rise sm:p-8">
        <div className="flex items-start gap-3">
          <p lang={locale} className="flex-1 font-display text-2xl font-bold leading-snug sm:text-3xl">{item.text}</p>
          <div className="flex shrink-0 flex-col gap-2">
            <button type="button" onClick={() => speak(item.text, 1)} aria-label="Escuchar el modelo" className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary hover:brightness-95">
              <Volume2 size={20} aria-hidden />
            </button>
            <button type="button" onClick={() => speak(item.text, 0.7)} aria-label="Escuchar despacio" className="grid size-11 place-items-center rounded-full bg-surface-muted text-muted hover:text-text">
              <Snail size={18} aria-hidden />
            </button>
          </div>
        </div>
        <p className="text-sm text-muted">{item.translation}</p>

        <div className="flex flex-col items-center gap-3 py-2">
          <button
            type="button"
            onClick={listening ? stop : listen}
            disabled={busy}
            aria-pressed={listening}
            aria-label={listening ? "Detener" : "Pulsa y lee la frase"}
            className={cn(
              "relative grid size-20 place-items-center rounded-full text-white shadow-lg transition-transform active:scale-95",
              listening ? "bg-danger" : "bg-primary hover:scale-105",
            )}
          >
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-danger opacity-40" aria-hidden />}
            {busy ? <Loader2 className="animate-spin" size={30} aria-hidden /> : <Mic size={32} aria-hidden />}
          </button>
          <p className="min-h-6 text-center text-sm text-muted" aria-live="polite">
            {listening ? (interim ? `«${interim}»` : "Te escucho…") : busy ? "Comparando…" : fb ? "" : "Pulsa el micrófono y lee la frase"}
          </p>
          {err && <p className="text-center text-sm text-danger" role="alert">{err}</p>}
        </div>

        {fb && (
          <div className={cn("space-y-3 rounded-2xl p-4 animate-sheet", fb.correct ? "bg-success-soft" : "bg-warning-soft")} role="status">
            <div className="flex items-center gap-3">
              <span className={cn("font-display text-3xl font-extrabold animate-pop-in", fb.correct ? "text-success" : "text-warning")}>{Math.round(fb.score * 100)} %</span>
              <p className="text-sm font-semibold">{fb.tip}</p>
            </div>
            <p lang={locale} className="flex flex-wrap gap-x-1.5 gap-y-1 text-lg">
              {fb.diff.filter((p) => p.kind !== "extra").map((p, k) => (
                <span
                  key={k}
                  className={cn(
                    "rounded px-1",
                    p.kind === "ok" && "text-success",
                    p.kind === "typo" && "bg-warning-soft text-warning",
                    p.kind === "missing" && "bg-danger-soft text-danger line-through decoration-2",
                  )}
                >
                  {p.text}
                </span>
              ))}
            </p>
            {fb.heard && <p className="text-xs text-muted">Entendimos: «{fb.heard}»</p>}
            <div className="flex flex-wrap gap-2">
              {!fb.correct && tries < 3 && (
                <Button variant="secondary" size="sm" onClick={listen}><RotateCcw size={14} aria-hidden /> Repetir</Button>
              )}
              <Button size="sm" onClick={next} variant={fb.correct ? "success" : "primary"}>
                {i + 1 >= items.length ? "Terminar" : "Siguiente"} <ArrowRight size={14} aria-hidden />
              </Button>
            </div>
          </div>
        )}
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-primary">Compara tu entonación con el modelo</summary>
          <PitchCompare key={item.key} text={item.text} lang={locale.slice(0, 2)} className="mt-3" />
        </details>
        {!fb && !listening && !busy && (
          <button type="button" onClick={() => { setFb({ correct: false, score: 0, heard: "", diff: [], tip: "Frase saltada." }); }} className="mx-auto block text-xs text-muted hover:text-text">
            Saltar esta frase
          </button>
        )}
      </section>
    </div>
  );
}
