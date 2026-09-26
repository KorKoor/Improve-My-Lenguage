"use client";

import { ArrowRight, Check, Loader2, Snail, Volume2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { completeFirstStepsUnitAction } from "@/app/app/first-steps-actions";
import { Confetti } from "@/components/celebrate";
import { Afi } from "@/components/afi/afi";
import { useSpeech, VoiceWarning } from "@/components/speak-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";

export interface UnitPhrase {
  es: string;
  text: string;
  roman?: string;
}

type Task =
  | { kind: "listen"; i: number; options: string[] }
  | { kind: "read"; i: number; options: string[] }
  | { kind: "build"; i: number; tokens: string[] };

function shuffle<T>(xs: T[], seed: number): T[] {
  const a = [...xs];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Ejercicios de la unidad: escuchar y elegir, leer y elegir, ordenar la frase. */
function buildTasks(phrases: UnitPhrase[], spaced: boolean, seed: number): Task[] {
  const tasks: Task[] = [];
  phrases.forEach((ph, i) => {
    const others = shuffle(phrases.filter((_, j) => j !== i), seed + i).slice(0, 3);
    const words = ph.text.replace(/[.!?¿¡？。]/g, "").split(/\s+/).filter(Boolean);
    const kind = i % 3 === 0 ? "listen" : i % 3 === 1 ? "read" : spaced && words.length >= 2 ? "build" : "listen";
    if (kind === "listen") tasks.push({ kind, i, options: shuffle([ph.es, ...others.map((o) => o.es)], seed * 3 + i) });
    else if (kind === "read") tasks.push({ kind, i, options: shuffle([ph.text, ...others.map((o) => o.text)], seed * 5 + i) });
    else {
      let tokens = shuffle(words, seed * 7 + i);
      if (tokens.join(" ") === words.join(" ")) tokens = [...tokens].reverse();
      tasks.push({ kind: "build", i, tokens });
    }
  });
  return shuffle(tasks, seed * 11);
}

export function FirstStepsRunner({
  unitId,
  title,
  emoji,
  phrases,
  locale,
  language,
  rtl,
  spaced,
  nextHref,
  languageName = "",
}: {
  unitId: string;
  title: string;
  emoji: string;
  phrases: UnitPhrase[];
  locale: string;
  language: string;
  rtl: boolean;
  spaced: boolean;
  nextHref: string | null;
  languageName?: string;
}) {
  const { speak } = useSpeech(locale);
  const seed = useMemo(() => Math.floor(Math.random() * 1e6) + 1, []);
  const [phase, setPhase] = useState<"learn" | "practice" | "saving" | "done">("learn");
  const [card, setCard] = useState(0);
  const [queue, setQueue] = useState<Task[]>(() => buildTasks(phrases, spaced, seed));
  const [pos, setPos] = useState(0);
  const [answer, setAnswer] = useState<{ chosen: string; ok: boolean } | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const retried = useRef(new Set<number>());
  const started = useRef(Date.now());
  const [result, setResult] = useState<{ stars: number; newAchievements: { title: string; icon: string }[] } | null>(null);
  const dir = rtl ? "rtl" : "ltr";

  const say = useCallback((t: string, slow = true) => speak(t, slow ? 0.75 : 1), [speak]);

  // Cada tarjeta nueva y cada «escucha» se reproducen solas, despacio.
  useEffect(() => {
    if (phase === "learn") say(phrases[card]!.text);
  }, [phase, card, phrases, say]);
  const task = queue[pos];
  useEffect(() => {
    if (phase === "practice" && task?.kind === "listen") say(phrases[task.i]!.text);
  }, [phase, task, phrases, say]);

  const finish = async () => {
    setPhase("saving");
    const r = await completeFirstStepsUnitAction(unitId, score.correct, score.total, Math.round((Date.now() - started.current) / 1000));
    setResult(r.ok ? r.data : { stars: 1, newAchievements: [] });
    setPhase("done");
  };

  const check = (chosen: string) => {
    if (!task || answer) return;
    const ph = phrases[task.i]!;
    const target = task.kind === "listen" ? ph.es : ph.text;
    const norm = (s: string) => s.toLowerCase().replace(/[.!?¿¡？。,、]/g, "").replace(/\s+/g, " ").trim();
    const ok = norm(chosen) === norm(target);
    setAnswer({ chosen, ok });
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    say(ph.text, false);
    // Lo fallado vuelve al final una vez.
    if (!ok && !retried.current.has(task.i)) {
      retried.current.add(task.i);
      setQueue((q) => [...q, task]);
    }
  };

  const next = () => {
    setAnswer(null);
    setOrder([]);
    if (pos + 1 >= queue.length) void finish();
    else setPos((p) => p + 1);
  };

  const header = (value: number, label: string) => (
    <div className="flex items-center gap-4">
      <Link href="/app/first-steps" aria-label="Salir" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted"><X size={20} /></Link>
      <ProgressBar value={value} label={label} height={10} className="flex-1" />
      <span className="text-xl" aria-hidden>{emoji}</span>
    </div>
  );

  const AudioButtons = ({ text }: { text: string }) => (
    <div className="flex items-center justify-center gap-3">
      <button type="button" onClick={() => say(text, false)} className="grid size-16 place-items-center rounded-full bg-primary text-on-primary shadow-lg active:scale-95" aria-label="Escuchar">
        <Volume2 size={28} />
      </button>
      <button type="button" onClick={() => speak(text, 0.55)} className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary active:scale-95" aria-label="Escuchar muy despacio">
        <Snail size={20} />
      </button>
    </div>
  );

  if (phase === "learn") {
    const ph = phrases[card]!;
    return (
      <div className="flex flex-1 flex-col pb-10 pt-5">
        {header(card / (phrases.length * 2), `${title}: frase ${card + 1} de ${phrases.length}`)}
        {card === 0 && languageName && <VoiceWarning locale={locale} languageName={languageName} />}
        <p className="mt-6 text-sm font-semibold text-muted">Aprende · {card + 1} de {phrases.length}</p>
        <div key={card} className="card mt-3 p-7 text-center animate-rise">
          <p className="font-display text-4xl font-extrabold leading-tight" lang={language} dir={dir}>{ph.text}</p>
          {ph.roman && <p className="mt-2 text-lg text-muted">{ph.roman}</p>}
          <p className="mt-4 text-xl font-semibold text-primary">{ph.es}</p>
          <div className="mt-6"><AudioButtons text={ph.text} /></div>
          <p className="mt-4 text-xs text-muted">Escúchala y repítela en voz alta un par de veces.</p>
        </div>
        <Button size="lg" className="mt-6 w-full" autoFocus onClick={() => (card + 1 < phrases.length ? setCard((c) => c + 1) : setPhase("practice"))}>
          {card + 1 < phrases.length ? "Siguiente" : "¡A practicar!"} <ArrowRight size={18} aria-hidden />
        </Button>
      </div>
    );
  }

  if (phase === "saving" || phase === "done") {
    const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center animate-rise">
        {phase === "done" && (result?.stars ?? 0) >= 2 && <Confetti />}
        <Afi size={120} mood="celebrating" motion="hop" />
        <h1 className="font-display text-3xl font-extrabold">¡Unidad completada!</h1>
        <p className="text-4xl" aria-label={`${result?.stars ?? 0} estrellas de 3`}>
          {[1, 2, 3].map((s) => <span key={s} className={cn("inline-block", s <= (result?.stars ?? 0) ? "animate-pop-in" : "opacity-25 grayscale")} style={{ animationDelay: `${s * 150}ms` }}>⭐</span>)}
        </p>
        <p className="text-muted">{pct} % de aciertos. Ya sabes decir {phrases.length} cosas nuevas.</p>
        {result?.newAchievements.length ? <p className="text-sm font-semibold">{result.newAchievements.map((a) => `${a.icon} ${a.title}`).join(" · ")}</p> : null}
        {phase === "saving" ? <Loader2 className="animate-spin text-primary" aria-label="Guardando" /> : (
          <div className="flex flex-wrap justify-center gap-3">
            {nextHref ? <ButtonLink href={nextHref} size="lg">Siguiente unidad <ArrowRight size={18} aria-hidden /></ButtonLink> : <ButtonLink href="/app/session" size="lg">Empezar a aprender palabras <ArrowRight size={18} aria-hidden /></ButtonLink>}
            <ButtonLink href="/app/first-steps" variant="secondary" size="lg">Ver unidades</ButtonLink>
          </div>
        )}
      </div>
    );
  }

  if (!task) return null;
  const ph = phrases[task.i]!;
  const optionClass = (o: string) => {
    if (!answer) return "border-border bg-surface hover:border-primary hover:bg-primary-soft/40";
    const target = task.kind === "listen" ? ph.es : ph.text;
    if (o === target) return "border-2 border-success bg-success-soft text-success";
    if (o === answer.chosen) return "border-2 border-danger bg-danger-soft text-danger";
    return "border-border bg-surface opacity-60";
  };

  return (
    <div className="flex flex-1 flex-col pb-40 pt-5">
      {header(0.5 + (pos / queue.length) * 0.5, `${title}: ejercicio ${pos + 1} de ${queue.length}`)}
      <div key={`${pos}-${task.i}`} className="mt-6 animate-rise">
        {task.kind === "listen" && (
          <>
            <p className="text-sm font-semibold text-muted">Escucha y elige qué significa</p>
            <div className="card mt-3 p-7"><AudioButtons text={ph.text} /></div>
          </>
        )}
        {task.kind === "read" && (
          <>
            <p className="text-sm font-semibold text-muted">¿Cómo se dice…?</p>
            <div className="card mt-3 p-6"><p className="font-display text-3xl font-extrabold">{ph.es}</p></div>
          </>
        )}
        {task.kind === "build" && (
          <>
            <p className="text-sm font-semibold text-muted">Ordena la frase: «{ph.es}»</p>
            <div className="mt-3 min-h-16 rounded-2xl border-2 border-dashed border-border p-3" lang={language} dir={dir}>
              <div className="flex flex-wrap gap-2">
                {order.map((ti, k) => (
                  <button key={`${ti}-${k}`} type="button" disabled={!!answer} onClick={() => setOrder((o) => o.filter((_, x) => x !== k))} className="rounded-xl border border-primary bg-primary-soft px-3 py-2 font-medium text-primary">{task.tokens[ti]}</button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" lang={language} dir={dir}>
              {task.tokens.map((t, ti) => (
                <button key={ti} type="button" disabled={!!answer || order.includes(ti)} onClick={() => { setOrder((o) => [...o, ti]); say(t, false); }} className={cn("rounded-xl border border-border bg-surface px-3 py-2 font-medium", order.includes(ti) && "opacity-30")}>{t}</button>
              ))}
            </div>
            {!answer && <Button size="lg" className="mt-5 w-full" disabled={order.length !== task.tokens.length} onClick={() => check(order.map((i) => task.tokens[i]).join(" "))}>Comprobar</Button>}
          </>
        )}
        {task.kind !== "build" && (
          <div className="mt-5 grid gap-2.5">
            {task.options.map((o) => (
              <button key={o} type="button" disabled={!!answer} onClick={() => check(o)} className={cn("rounded-2xl border px-4 py-3.5 text-left text-base font-medium transition", optionClass(o))} lang={task.kind === "read" ? language : "es"} dir={task.kind === "read" ? dir : "ltr"}>
                {o}
              </button>
            ))}
          </div>
        )}
      </div>

      {answer && (
        <div role="status" className={cn("fixed inset-x-0 bottom-0 z-40 animate-rise rounded-t-3xl px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-5", answer.ok ? "bg-success-soft" : "bg-danger-soft")}>
          <div className="mx-auto max-w-2xl">
            <p className={cn("flex items-center gap-2 font-display text-xl font-extrabold", answer.ok ? "text-success" : "text-danger")}>
              {answer.ok ? <Check size={22} aria-hidden /> : <X size={22} aria-hidden />} {answer.ok ? "¡Muy bien!" : "Casi. Se dice:"}
            </p>
            <p className="mt-1 text-lg font-semibold" lang={language} dir={dir}>{ph.text}</p>
            {ph.roman && <p className="text-sm text-muted">{ph.roman}</p>}
            <p className="text-sm text-muted">{ph.es}</p>
            <Button size="lg" variant={answer.ok ? "success" : "danger"} className="mt-4 w-full" autoFocus onClick={next}>Continuar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
