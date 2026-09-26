"use client";
import { useEffect, useMemo, useState } from "react";
import { useSpeech } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { isOrdered, rng, scramble, shuffle, solutionIndexes, type GameSentence } from "@/lib/engine/games";
import { GameHeader, GameOver, NotEnough, Stat, useBest } from "./shell";

const ROUND = 5;

/** Ordena la frase: frases reales desordenadas, con la traducción como pista. */
export function OrderGame({ sentences, lang, locale, dir }: { sentences: GameSentence[]; lang: string; locale: string; dir: "ltr" | "rtl" }) {
  const [seed, setSeed] = useState(1);
  const [round, setRound] = useState(0);
  useEffect(() => setSeed(Date.now() % 100000), [round]);
  const picked = useMemo(() => shuffle(sentences, rng(seed + round)).slice(0, ROUND), [sentences, seed, round]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<number[]>([]);
  const [state, setState] = useState<"playing" | "ok" | "bad">("playing");
  const [firstTry, setFirstTry] = useState(0);
  const [failedThis, setFailedThis] = useState(false);
  const [done, setDone] = useState<{ record: boolean } | null>(null);
  const { speak } = useSpeech(locale);
  const { best, submit } = useBest("order", lang);
  const s = picked[i];
  const bank = useMemo(() => (s ? scramble(s.tiles, rng(seed + round * 31 + i)) : []), [s, seed, round, i]);

  if (sentences.length < ROUND) return <NotEnough>Aún no hay bastantes frases de ejemplo con traducción para este juego en tu idioma.</NotEnough>;

  const reset = () => {
    setI(0);
    setAnswer([]);
    setState("playing");
    setFirstTry(0);
    setFailedThis(false);
    setDone(null);
    setRound((r) => r + 1);
  };

  if (done) {
    return (
      <>
        <GameHeader title="Ordena la frase" />
        <GameOver score={firstTry} unit={`de ${ROUND}`} best={best} record={done.record} stars={firstTry >= 5 ? 3 : firstTry >= 3 ? 2 : 1} detail="Frases ordenadas a la primera." onRetry={reset} />
      </>
    );
  }
  if (!s) return null;

  const check = () => {
    const words = answer.map((k) => bank[k]!);
    if (isOrdered(words, s.tiles)) {
      setState("ok");
      speak(s.speak, 0.9);
      if (!failedThis) setFirstTry((f) => f + 1);
    } else {
      setState("bad");
      setFailedThis(true);
    }
  };
  const nextSentence = () => {
    if (i + 1 >= picked.length) {
      setDone({ record: submit(firstTry) });
      return;
    }
    setI(i + 1);
    setAnswer([]);
    setState("playing");
    setFailedThis(false);
  };

  return (
    <>
      <GameHeader title="Ordena la frase">
        <Stat label="Frase">{i + 1}/{picked.length}</Stat>
        <Stat label="A la primera">✅ {firstTry}</Stat>
      </GameHeader>
      <p className="text-sm text-muted">Significa:</p>
      <p className="mt-1 font-display text-xl font-extrabold">«{s.translation}»</p>

      <div
        className={cn(
          "mt-5 flex min-h-20 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3",
          state === "ok" ? "border-success bg-success-soft" : state === "bad" ? "border-danger bg-danger-soft" : "border-border",
        )}
        role="group"
        aria-label="Tu frase"
        lang={lang}
        dir={dir}
      >
        {answer.map((k, pos) => (
          <button
            key={`${k}-${pos}`}
            type="button"
            disabled={state === "ok"}
            onClick={() => {
              setAnswer(answer.filter((_, p) => p !== pos));
              setState("playing");
            }}
            className="rounded-xl border border-primary bg-primary-soft px-3 py-2 font-semibold text-primary"
          >
            {bank[k]}
          </button>
        ))}
        {!answer.length && <span className="self-center text-sm text-muted" lang="es" dir="ltr">Toca las fichas en orden…</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" lang={lang} dir={dir} role="group" aria-label="Fichas">
        {bank.map((t, k) => (
          <button
            key={k}
            type="button"
            disabled={answer.includes(k) || state === "ok"}
            onClick={() => {
              setAnswer([...answer, k]);
              setState("playing");
            }}
            className="rounded-xl border border-border bg-surface px-3 py-2 font-semibold shadow-sm transition hover:border-primary disabled:opacity-30"
          >
            {t}
          </button>
        ))}
      </div>

      <p className="mt-3 min-h-6 text-sm font-semibold" aria-live="polite">
        {state === "ok" ? <span className="text-success-ink">¡Eso es! <span lang={lang} dir={dir}>{s.tiles.join(" ")}</span></span> : state === "bad" ? <span className="text-danger-ink">Casi. Toca una ficha de arriba para quitarla y prueba otra vez.</span> : ""}
      </p>

      <div className="mt-auto flex gap-3 pb-6 pt-4">
        {state === "ok" ? (
          <Button size="lg" className="w-full" onClick={nextSentence} autoFocus>
            {i + 1 >= picked.length ? "Ver resultado" : "Siguiente"}
          </Button>
        ) : (
          <>
            {failedThis && (
              <Button variant="secondary" size="lg" onClick={() => { setAnswer(solutionIndexes(bank, s.tiles)); setState("ok"); speak(s.speak, 0.9); }}>
                Ver solución
              </Button>
            )}
            <Button size="lg" className="flex-1" onClick={check} disabled={answer.length !== bank.length}>
              Comprobar
            </Button>
          </>
        )}
      </div>
    </>
  );
}
