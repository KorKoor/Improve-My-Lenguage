"use client";

import { Check, Mic, Snail, Square, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { recordPairsAction } from "@/app/app/skills-actions";
import { useSpeech } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { PairSet } from "@/lib/content/minimal-pairs";

const ROUNDS = 10;

/**
 * Pares mínimos: se oye una de dos palabras casi iguales y se elige cuál fue.
 * Al final se puede grabar la propia voz y compararla con el modelo.
 */
export function PairsTrainer({ sets, locale, language }: { sets: PairSet[]; locale: string; language: string }) {
  const { speak } = useSpeech(locale);
  const [setIdx, setSetIdx] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<"a" | "b" | null>(null);
  const [score, setScore] = useState(0);
  const set = setIdx === null ? null : sets[setIdx]!;
  // Secuencia de rondas: par y lado al azar (fija para esta tanda).
  const seq = useMemo(() => (set ? Array.from({ length: ROUNDS }, () => ({ p: Math.floor(Math.random() * set.pairs.length), side: Math.random() < 0.5 ? ("a" as const) : ("b" as const) })) : []), [set]);
  const cur = seq[round];
  const pair = set && cur ? set.pairs[cur.p]! : null;
  const target = pair && cur ? pair[cur.side] : "";

  useEffect(() => {
    if (pair && !answer && round < ROUNDS) {
      const t = setTimeout(() => speak(target, 0.85), 250);
      return () => clearTimeout(t);
    }
  }, [pair, target, answer, round, speak]);

  const choose = (side: "a" | "b") => {
    if (answer || !cur) return;
    setAnswer(side);
    if (side === cur.side) setScore((s) => s + 1);
  };
  const next = () => {
    setAnswer(null);
    const r = round + 1;
    setRound(r);
    if (r >= ROUNDS) void recordPairsAction(score, ROUNDS);
  };

  if (!set) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {sets.map((s, i) => (
          <button key={s.id} type="button" onClick={() => { setSetIdx(i); setRound(0); setScore(0); }} className="card lift p-4 text-left hover:border-primary">
            <p className="font-display text-lg font-extrabold" lang={language}>{s.title}</p>
            <p className="mt-1 text-sm text-muted">{s.tip}</p>
            <p className="mt-2 text-xs font-semibold text-primary" lang={language}>{s.pairs.slice(0, 3).map((p) => `${p.a} / ${p.b}`).join(" · ")}</p>
          </button>
        ))}
      </div>
    );
  }

  if (round >= ROUNDS) {
    return (
      <div className="card p-6 text-center animate-rise">
        <p className="font-display text-3xl font-extrabold">{score} / {ROUNDS}</p>
        <p className="mt-1 text-muted">{score >= 9 ? "¡Oído fino! Ya distingues este sonido." : score >= 7 ? "Muy bien: casi lo tienes." : "Es normal al principio: el oído se entrena repitiendo. Prueba otra tanda."}</p>
        <RecordCompare pairs={set.pairs} locale={locale} language={language} speak={speak} />
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={() => { setRound(0); setScore(0); setSetIdx(setIdx); }}>Otra tanda</Button>
          <Button variant="secondary" onClick={() => setSetIdx(null)}>Elegir otro sonido</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold" lang={language}>{set.title}</span>
        <span className="ml-auto text-muted tabular-nums">{round + 1}/{ROUNDS} · {score} ✓</span>
      </div>
      <p className="mt-2 text-sm text-muted">{set.tip}</p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <button type="button" onClick={() => speak(target, 0.85)} className="grid size-16 place-items-center rounded-full bg-primary text-on-primary shadow-lg active:scale-95" aria-label="Escuchar otra vez"><Volume2 size={28} /></button>
        <button type="button" onClick={() => speak(target, 0.55)} className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary active:scale-95" aria-label="Escuchar despacio"><Snail size={20} /></button>
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-muted">¿Cuál has oído?</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {(["a", "b"] as const).map((side, k) => {
          const word = pair![side];
          const ok = answer && side === cur!.side;
          const bad = answer === side && side !== cur!.side;
          return (
            <button key={side} type="button" disabled={!!answer} onClick={() => choose(side)} className={cn("rounded-2xl border-2 p-4 text-center transition", ok ? "border-success bg-success-soft" : bad ? "border-danger bg-danger-soft" : "border-border bg-surface hover:border-primary")}>
              <span className="block font-display text-2xl font-extrabold" lang={language}>{word}</span>
              <span className="text-xs text-muted">{pair!.es[k]}</span>
            </button>
          );
        })}
      </div>
      {answer && (
        <div className="mt-4 flex items-center gap-3">
          <p className={cn("flex flex-1 items-center gap-1.5 font-semibold", answer === cur!.side ? "text-success-ink" : "text-danger-ink")}>
            {answer === cur!.side ? <Check size={18} aria-hidden /> : <X size={18} aria-hidden />} {answer === cur!.side ? "¡Bien!" : <>Era <span lang={language}>«{target}»</span></>}
          </p>
          <Button size="sm" variant="ghost" onClick={() => { speak(pair!.a, 0.8); setTimeout(() => speak(pair!.b, 0.8), 1300); }}>Oír los dos</Button>
          <Button size="sm" onClick={next} autoFocus>Siguiente</Button>
        </div>
      )}
    </div>
  );
}

/** Grabar tu voz diciendo una palabra y escucharla junto al modelo (nada se sube al servidor). */
function RecordCompare({ pairs, locale, language, speak }: { pairs: PairSet["pairs"]; locale: string; language: string; speak: (t: string, r?: number) => boolean }) {
  const word = pairs[0]!.a;
  const [rec, setRec] = useState<"idle" | "recording" | "done" | "unsupported">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const mr = useRef<MediaRecorder | null>(null);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  void locale;
  const start = async () => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices) return setRec("unsupported");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const m = new MediaRecorder(stream);
      m.ondataavailable = (e) => chunks.push(e.data);
      m.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setUrl(URL.createObjectURL(new Blob(chunks, { type: m.mimeType })));
        setRec("done");
      };
      mr.current = m;
      m.start();
      setRec("recording");
      setTimeout(() => m.state === "recording" && m.stop(), 3000);
    } catch {
      setRec("unsupported");
    }
  };
  return (
    <div className="mt-5 rounded-2xl bg-surface-muted p-4 text-sm">
      <p className="font-semibold">Ahora tú: di <span lang={language}>«{word}»</span></p>
      <p className="text-muted">Graba 3 segundos y compárate con el modelo. La grabación se queda en tu dispositivo.</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => speak(word, 0.8)}><Volume2 size={15} aria-hidden /> Modelo</Button>
        {rec === "recording" ? (
          <Button size="sm" variant="danger" onClick={() => mr.current?.stop()}><Square size={15} aria-hidden /> Grabando…</Button>
        ) : (
          <Button size="sm" onClick={() => void start()} disabled={rec === "unsupported"}><Mic size={15} aria-hidden /> {rec === "done" ? "Grabar otra vez" : "Grabar mi voz"}</Button>
        )}
        {url && <Button size="sm" variant="secondary" onClick={() => void new Audio(url).play()}>▶ Mi voz</Button>}
      </div>
      {rec === "unsupported" && <p className="mt-2 text-center text-xs text-muted">Tu navegador no permite grabar audio (o no diste permiso al micrófono).</p>}
    </div>
  );
}
