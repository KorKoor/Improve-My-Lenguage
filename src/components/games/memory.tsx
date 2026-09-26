"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSpeech } from "@/components/speak-button";
import { cn } from "@/lib/cn";
import { memoryDeck, memoryStars, rng, type GameWord } from "@/lib/engine/games";
import { GameHeader, GameOver, NotEnough, Stat, useBest, WordLabel } from "./shell";

const PAIRS = 6;

/** Memorama: parejas palabra–significado. La palabra suena al darle la vuelta. */
export function MemoryGame({ words, lang, locale, dir }: { words: GameWord[]; lang: string; locale: string; dir: "ltr" | "rtl" }) {
  const [round, setRound] = useState(0);
  const [seed, setSeed] = useState(1);
  useEffect(() => setSeed(Date.now() % 100000), [round]);
  const deck = useMemo(() => memoryDeck(words, PAIRS, rng(seed + round)), [words, seed, round]);
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [msg, setMsg] = useState("");
  const [start, setStart] = useState(0);
  const [secs, setSecs] = useState(0);
  const lock = useRef(false);
  const { speak } = useSpeech(locale);
  const { best, submit } = useBest("memory", lang);
  const [result, setResult] = useState<{ score: number; record: boolean } | null>(null);

  useEffect(() => {
    if (!start || result) return;
    const id = setInterval(() => setSecs(Math.round((Date.now() - start) / 1000)), 500);
    return () => clearInterval(id);
  }, [start, result]);

  if (words.length < PAIRS) return <NotEnough>Hacen falta al menos {PAIRS} palabras con traducción. Practica un poco y vuelve.</NotEnough>;

  const reset = () => {
    setOpen([]);
    setFound(new Set());
    setMoves(0);
    setStart(0);
    setSecs(0);
    setResult(null);
    setMsg("");
    setRound((r) => r + 1);
  };

  const flip = (key: string) => {
    if (lock.current || open.includes(key)) return;
    const card = deck.find((c) => c.key === key)!;
    if (found.has(card.pair)) return;
    if (!start) setStart(Date.now());
    if (card.face === "word") speak(card.word.speak, 0.9);
    const next = [...open, key];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((k) => deck.find((c) => c.key === k)!);
    if (a!.pair === b!.pair) {
      const done = new Set(found).add(a!.pair);
      setFound(done);
      setOpen([]);
      setMsg(`Pareja: ${a!.word.text} = ${a!.word.meaning}`);
      if (done.size === PAIRS) {
        const m = moves + 1;
        const t = Math.round((Date.now() - start) / 1000);
        // Menos intentos y menos tiempo = más puntos.
        const score = Math.max(10, 600 - m * 20 - t * 2);
        setSecs(t);
        setResult({ score, record: submit(score) });
      }
    } else {
      lock.current = true;
      setMsg("No son pareja.");
      setTimeout(() => {
        setOpen([]);
        lock.current = false;
      }, 900);
    }
  };

  if (result) {
    return (
      <>
        <GameHeader title="Memorama" />
        <GameOver score={result.score} best={best} record={result.record} stars={memoryStars(PAIRS, moves)} detail={`${moves} intentos en ${secs} s.`} onRetry={reset} />
      </>
    );
  }

  return (
    <>
      <GameHeader title="Memorama">
        <Stat label="Parejas">{found.size}/{PAIRS}</Stat>
        <Stat label="Intentos">🔁 {moves}</Stat>
        <Stat label="Tiempo">⏱ {secs}s</Stat>
      </GameHeader>
      <p className="mb-3 text-sm text-muted">Da la vuelta a dos cartas: una palabra y su significado.</p>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" aria-label="Cartas">
        {deck.map((c) => {
          const up = open.includes(c.key) || found.has(c.pair);
          const done = found.has(c.pair);
          return (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => flip(c.key)}
                aria-label={up ? (c.face === "word" ? c.word.text : c.word.meaning) : "Carta boca abajo"}
                aria-pressed={up}
                className={cn("game-card relative aspect-[4/5] w-full", up && "is-up")}
              >
                <span className="game-card-face game-card-back" aria-hidden>
                  <span className="text-2xl">⭐</span>
                </span>
                <span
                  className={cn(
                    "game-card-face game-card-front p-2 text-center font-semibold",
                    done ? "border-2 border-success bg-success-soft text-success-ink" : c.face === "word" ? "bg-surface" : "bg-primary-soft",
                  )}
                  aria-hidden
                >
                  {c.face === "word" ? (
                    <WordLabel text={c.word.text} reading={c.word.reading} lang={lang} dir={dir} className="text-lg leading-tight" />
                  ) : (
                    <span className="text-sm leading-tight">{c.word.meaning}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">{msg}</p>
    </>
  );
}
