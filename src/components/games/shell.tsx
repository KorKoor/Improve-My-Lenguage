"use client";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Afi, type AfiMood } from "@/components/afi/afi";
import { Confetti } from "@/components/celebrate";
import { Button } from "@/components/ui/button";
import { bestKey, type GameId } from "@/lib/engine/games";

/** Récord por juego e idioma (sólo en este dispositivo). */
export function useBest(game: GameId, lang: string) {
  const [best, setBest] = useState(0);
  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(bestKey(game, lang))) || 0);
    } catch {
      /* sin almacenamiento: sin récord */
    }
  }, [game, lang]);
  /** Guarda la puntuación; devuelve true si es un récord nuevo. */
  const submit = (score: number) => {
    if (score <= best) return false;
    setBest(score);
    try {
      localStorage.setItem(bestKey(game, lang), String(score));
    } catch {
      /* ignorar */
    }
    return true;
  };
  return { best, submit };
}

/** Cabecera de un juego: volver, título y marcadores. */
export function GameHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-1 py-4">
      <Link href="/app/games" className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-muted hover:text-text" aria-label="Volver a los juegos">
        <ArrowLeft size={20} aria-hidden />
      </Link>
      <h1 className="min-w-0 flex-1 font-display text-lg font-extrabold leading-tight sm:text-xl">{title}</h1>
      <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold tabular-nums sm:gap-2 sm:text-sm">{children}</div>
    </header>
  );
}

export function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="rounded-full bg-surface-muted px-2.5 py-1">
      <span className="sr-only">{label}: </span>
      {children}
    </span>
  );
}

/** Pantalla final común: puntuación, récord y volver a jugar. */
export function GameOver({
  score,
  unit = "puntos",
  best,
  record,
  stars,
  detail,
  onRetry,
}: {
  score: number;
  unit?: string;
  best: number;
  record: boolean;
  stars?: 1 | 2 | 3;
  detail?: ReactNode;
  onRetry: () => void;
}) {
  const mood: AfiMood = record ? "celebrating" : stars === 3 ? "proud" : score > 0 ? "happy" : "encouraging";
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center animate-rise" role="status">
      {(record || stars === 3) && <Confetti />}
      <Afi size={120} mood={mood} motion="hop" />
      <h2 className="font-display text-3xl font-extrabold">{record ? "¡Nuevo récord!" : "Partida terminada"}</h2>
      <p className="font-display text-5xl font-extrabold text-primary tabular-nums">
        {score} <span className="text-lg text-muted">{unit}</span>
      </p>
      {stars ? (
        <p className="text-3xl" role="img" aria-label={`${stars} estrellas de 3`}>
          {[1, 2, 3].map((s) => <span key={s} className={s <= stars ? "" : "opacity-25 grayscale"}>⭐</span>)}
        </p>
      ) : null}
      {detail ? <div className="max-w-sm text-sm text-muted">{detail}</div> : null}
      <p className="inline-flex items-center gap-1.5 text-sm text-muted">
        <Trophy size={16} aria-hidden /> Tu récord: <strong className="text-text tabular-nums">{Math.max(best, score)}</strong>
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={onRetry} autoFocus>
          <RotateCcw size={18} aria-hidden /> Jugar otra vez
        </Button>
        <Link href="/app/games" className="inline-flex h-12 items-center rounded-2xl border border-border px-5 font-semibold hover:bg-surface-muted">
          Otros juegos
        </Link>
      </div>
    </div>
  );
}

/** Cuando no hay suficiente material para un juego. */
export function NotEnough({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <Afi size={110} mood="thinking" />
      <p className="max-w-sm text-muted">{children}</p>
      <Link href="/app/games" className="font-semibold text-primary underline underline-offset-4">Volver a los juegos</Link>
    </div>
  );
}

/** Texto de una palabra con su lectura debajo (si la tiene). */
export function WordLabel({ text, reading, lang, dir, className }: { text: string; reading?: string; lang: string; dir: "ltr" | "rtl"; className?: string }) {
  return (
    <span className={className}>
      <span lang={lang} dir={dir} className="block">{text}</span>
      {reading ? <span className="block text-xs font-normal text-muted">{reading}</span> : null}
    </span>
  );
}
