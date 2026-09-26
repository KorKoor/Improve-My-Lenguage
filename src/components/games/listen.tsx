"use client";
import { Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Afi } from "@/components/afi/afi";
import { useSpeech } from "@/components/speak-button";
import { cn } from "@/lib/cn";
import { choices, distinctWords, listenPoints, rng, type GameWord } from "@/lib/engine/games";
import { GameHeader, GameOver, NotEnough, Stat, useBest, WordLabel } from "./shell";

const SECONDS = 60;

/** Oído rápido: 60 segundos para reconocer palabras sólo por cómo suenan. */
export function ListenGame({ words, lang, locale, dir }: { words: GameWord[]; lang: string; locale: string; dir: "ltr" | "rtl" }) {
  const pool = useRef(distinctWords(words));
  const rand = useRef(rng(1));
  const { speak, supported } = useSpeech(locale);
  const { best, submit } = useBest("listen", lang);
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [word, setWord] = useState<GameWord | null>(null);
  const [opts, setOpts] = useState<GameWord[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [tries, setTries] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [record, setRecord] = useState(false);
  const endsAt = useRef(0);

  const ask = () => {
    const w = pool.current[Math.floor(rand.current() * pool.current.length)]!;
    setWord(w);
    setOpts(choices(w, pool.current, 4, rand.current));
    setFlash(null);
    speak(w.speak, 0.95);
  };

  const begin = () => {
    rand.current = rng(Date.now() % 100000);
    setScore(0);
    setStreak(0);
    setHits(0);
    setTries(0);
    setLeft(SECONDS);
    setRecord(false);
    endsAt.current = Date.now() + SECONDS * 1000;
    setPhase("play");
    ask();
  };

  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) setPhase("over");
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "over") setRecord(submit(score));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const pick = (o: GameWord) => {
    if (!word || flash) return;
    const ok = o.id === word.id;
    setTries((t) => t + 1);
    setFlash({ id: o.id, ok });
    if (ok) {
      const s = streak + 1;
      setStreak(s);
      setHits((h) => h + 1);
      setScore((p) => p + listenPoints(s));
    } else setStreak(0);
    setTimeout(ask, ok ? 350 : 1100);
  };

  if (pool.current.length < 6) return <NotEnough>Hacen falta más palabras para este juego. Practica un poco y vuelve.</NotEnough>;
  if (!supported) return <NotEnough>Tu navegador no puede reproducir audio para este idioma. Prueba con otro navegador o instala una voz del idioma en tu dispositivo.</NotEnough>;

  if (phase === "over") {
    return (
      <>
        <GameHeader title="Oído rápido" />
        <GameOver score={score} best={best} record={record} detail={`${hits} de ${tries} aciertos.`} onRetry={begin} />
      </>
    );
  }

  const mult = streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
  return (
    <>
      <GameHeader title="Oído rápido">
        <Stat label="Puntos">⭐ {score}</Stat>
        <Stat label="Segundos">⏱ {left}</Stat>
      </GameHeader>
      {phase === "ready" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
          <Afi size={110} mood="listening" motion="float" />
          <p className="max-w-sm text-muted">Oirás una palabra: elige cuál es. Tienes {SECONDS} segundos. Tres aciertos seguidos valen el doble; seis, el triple.</p>
          <button type="button" onClick={begin} className="h-12 rounded-2xl bg-primary px-6 font-semibold text-on-primary" autoFocus>Empezar</button>
        </div>
      ) : (
        <>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${(left / SECONDS) * 100}%` }} />
          </div>
          <div className="flex flex-col items-center gap-3 py-8">
            <button
              type="button"
              onClick={() => word && speak(word.speak, 0.8)}
              className="grid size-24 place-items-center rounded-full bg-primary text-on-primary shadow-lg transition active:scale-95"
              aria-label="Volver a escuchar"
            >
              <Volume2 size={40} aria-hidden />
            </button>
            <p className={cn("text-sm font-bold", mult > 1 ? "text-warning-ink" : "text-muted")} aria-live="polite">
              {mult > 1 ? `🔥 Racha de ${streak}: ×${mult}` : "Toca para volver a escuchar"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="¿Qué palabra has oído?">
            {opts.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => pick(o)}
                className={cn(
                  "min-h-16 rounded-2xl border border-border bg-surface px-3 py-2 text-lg font-semibold transition hover:border-primary",
                  flash && o.id === word?.id && "border-2 border-success bg-success-soft text-success-ink",
                  flash && !flash.ok && flash.id === o.id && "border-2 border-danger bg-danger-soft text-danger-ink",
                )}
              >
                <WordLabel text={o.text} reading={o.reading} lang={lang} dir={dir} />
                {flash ? <span className="mt-0.5 block text-xs font-normal text-muted">{o.meaning}</span> : null}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
