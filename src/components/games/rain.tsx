"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Afi, type AfiMood } from "@/components/afi/afi";
import { useSpeech } from "@/components/speak-button";
import { cn } from "@/lib/cn";
import { choices, distinctWords, rainFallSeconds, rng, type GameWord } from "@/lib/engine/games";
import { GameHeader, GameOver, NotEnough, Stat, useBest, WordLabel } from "./shell";

const LIVES = 3;

/**
 * Lluvia de palabras: a Afi le llueven palabras de los audífonos. Cada una cae
 * despacio; elige su significado antes de que toque el suelo. Cada acierto
 * acelera un poco la lluvia. Con «reducir movimiento» la palabra no cae: una
 * barra muestra el tiempo que queda.
 */
export function RainGame({ words, lang, locale, dir }: { words: GameWord[]; lang: string; locale: string; dir: "ltr" | "rtl" }) {
  const pool = useRef(distinctWords(words));
  const rand = useRef(rng(1));
  const [word, setWord] = useState<GameWord | null>(null);
  const [opts, setOpts] = useState<GameWord[]>([]);
  const [caught, setCaught] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState<{ id: string; ok: boolean; answer: string } | null>(null);
  const [mood, setMood] = useState<AfiMood>("listening");
  const [over, setOver] = useState<{ record: boolean } | null>(null);
  const [calm, setCalm] = useState(false);
  const [started, setStarted] = useState(false);
  const deadline = useRef({ start: 0, dur: 1 });
  const { speak } = useSpeech(locale);
  const { best, submit } = useBest("rain", lang);
  const recent = useRef<string[]>([]);
  const [missed, setMissed] = useState<GameWord[]>([]);

  const next = useCallback(
    (caughtSoFar: number) => {
      const candidates = pool.current.filter((w) => !recent.current.includes(w.id));
      const w = candidates[Math.floor(rand.current() * candidates.length)] ?? pool.current[0]!;
      recent.current = [...recent.current.slice(-6), w.id];
      setWord(w);
      setOpts(choices(w, pool.current, 4, rand.current));
      setProgress(0);
      deadline.current = { start: performance.now(), dur: rainFallSeconds(caughtSoFar) * 1000 };
      speak(w.speak, 0.9);
    },
    [speak],
  );

  const begin = () => {
    rand.current = rng(Date.now() % 100000);
    setCaught(0);
    setLives(LIVES);
    setOver(null);
    setFlash(null);
    setMissed([]);
    setMood("listening");
    setStarted(true);
    next(0);
  };

  useEffect(() => setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  const lose = useCallback(
    (w: GameWord) => {
      setFlash({ id: w.id, ok: false, answer: `${w.text} = ${w.meaning}` });
      setMissed((m) => (m.some((x) => x.id === w.id) ? m : [...m, w]));
      setMood("supportive");
      setWord(null);
      const left = lives - 1;
      setLives(left);
      if (left <= 0) setOver({ record: submit(caught) });
      else setTimeout(() => { setMood("listening"); next(caught); }, 1100);
    },
    [lives, caught, next, submit],
  );

  // La caída: un solo reloj con requestAnimationFrame.
  useEffect(() => {
    if (!word || over) return;
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - deadline.current.start) / deadline.current.dur);
      setProgress(p);
      if (p >= 1) return lose(word);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [word, over, lose]);

  const pick = (o: GameWord) => {
    if (!word) return;
    if (o.id === word.id) {
      const c = caught + 1;
      setCaught(c);
      setFlash({ id: word.id, ok: true, answer: `${word.text} = ${word.meaning}` });
      setMood(c % 5 === 0 ? "celebrating" : "happy");
      setWord(null);
      setTimeout(() => { setMood("listening"); next(c); }, 450);
    } else lose(word);
  };

  if (pool.current.length < 6) return <NotEnough>Hacen falta más palabras con traducción para que llueva. Practica un poco y vuelve.</NotEnough>;

  if (over) {
    return (
      <>
        <GameHeader title="Lluvia de palabras" />
        <GameOver score={caught} unit={caught === 1 ? "palabra" : "palabras"} best={best} record={over.record} detail={missed.length ? <>Se escaparon: {missed.map((w, i) => <span key={w.id}>{i ? " · " : ""}<span lang={lang} dir={dir}>{w.text}</span> ({w.meaning})</span>)}</> : null} onRetry={begin} />
      </>
    );
  }

  return (
    <>
      <GameHeader title="Lluvia de palabras">
        <Stat label="Atrapadas">💧 {caught}</Stat>
        <Stat label="Vidas">{"💜".repeat(Math.max(0, lives))}{"🤍".repeat(Math.max(0, LIVES - lives))}</Stat>
      </GameHeader>

      <div className="game-sky relative flex h-[46vh] min-h-72 flex-col items-center overflow-hidden rounded-3xl border border-border">
        <Afi size={84} mood={mood} motion={flash?.ok ? "hop" : flash ? "sway" : "float"} className="relative z-10 mt-2" key={`${caught}-${lives}`} />
        {word && (
          <div
            className="absolute left-1/2 z-0 -translate-x-1/2 rounded-2xl bg-surface px-4 py-2 text-center text-xl font-bold shadow-[var(--shadow)]"
            style={{ top: calm ? "45%" : `calc(22% + ${progress * 62}%)` }}
          >
            <span aria-hidden className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm">💧</span>
            <WordLabel text={word.text} reading={word.reading} lang={lang} dir={dir} />
          </div>
        )}
        {calm && word && (
          <div className="absolute inset-x-6 bottom-4 h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
            <div className="h-full bg-primary" style={{ width: `${(1 - progress) * 100}%` }} />
          </div>
        )}
        {!started && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end gap-3 bg-surface/70 p-6 text-center backdrop-blur-[2px]">
            <p className="max-w-xs text-sm text-muted">Las palabras caen de los audífonos de Afi. Toca su significado antes de que lleguen al suelo. Tienes 3 vidas.</p>
            <button type="button" onClick={begin} className="h-12 rounded-2xl bg-primary px-6 font-semibold text-on-primary" autoFocus>Empezar</button>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-3 bg-[var(--skill-grammar)] opacity-30" aria-hidden />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5" role="group" aria-label="Significados">
        {opts.map((o, i) => (
          <button
            key={o.id}
            type="button"
            disabled={!word}
            onClick={() => pick(o)}
            aria-keyshortcuts={String(i + 1)}
            className={cn(
              "min-h-14 rounded-2xl border border-border bg-surface px-3 py-2 text-base font-semibold transition hover:border-primary hover:bg-primary-soft/40 disabled:opacity-60",
              flash && !flash.ok && flash.id === o.id && "border-2 border-success bg-success-soft text-success-ink",
            )}
          >
            {o.meaning}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {word ? `Cae: ${word.text}` : flash ? (flash.ok ? `Atrapada. ${flash.answer}` : `Se escapó. ${flash.answer}`) : ""}
      </p>
      <KeyPicker opts={opts} onPick={pick} active={Boolean(word)} />
    </>
  );
}

/** Teclas 1–4 para elegir. */
function KeyPicker({ opts, onPick, active }: { opts: GameWord[]; onPick: (o: GameWord) => void; active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= opts.length) onPick(opts[n - 1]!);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts, onPick, active]);
  return null;
}
