"use client";
import { ArrowRight, BookmarkPlus, Check, ExternalLink, Eye, EyeOff, Minus, Pause, Play, Plus, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setWordStatusAction } from "@/app/app/actions";
import { completeReadingAction } from "@/app/app/skills-actions";
import { POS_ES } from "@/components/app/labels";
import { Confetti } from "@/components/celebrate";
import { speechRate } from "@/components/comfort";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import type { ReaderData } from "@/lib/services/reading";

type Phase = "reading" | "quiz" | "done";

/** Lector adaptativo: toca una palabra para verla; al final, preguntas de comprensión. */
export function Reader({ data }: { data: ReaderData }) {
  const [size, setSize] = useState(1);
  const [highlight, setHighlight] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [looked, setLooked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("reading");
  const [shownTr, setShownTr] = useState<Set<number>>(new Set());
  const started = useRef(Date.now());
  const article = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = article.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      setProgress(Math.max(0, Math.min(1, -rect.top / Math.max(1, total))));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const open = useCallback((id: string) => {
    setActive(id);
    setLooked((s) => new Set(s).add(id));
  }, []);

  const speakParagraph = (i: number) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking === i) {
      synth.cancel();
      setSpeaking(null);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(data.paragraphs[i]!.map((t) => t.t).join(""));
    u.lang = data.locale;
    u.rate = speechRate(0.95);
    u.onend = () => setSpeaking(null);
    synth.speak(u);
    setSpeaking(i);
  };

  const save = async (id: string, status: "saved" | "known") => {
    setSaved((s) => new Set(s).add(id));
    await setWordStatusAction(id, status);
  };
  const saveAllLooked = async () => {
    const ids = [...looked].filter((id) => !saved.has(id));
    setSaved((s) => new Set([...s, ...ids]));
    for (const id of ids) await setWordStatusAction(id, "saved");
  };

  const w = active ? data.words[active] : null;
  const newCount = useMemo(() => Object.values(data.words).filter((x) => !x.known).length, [data.words]);
  const coverage = Math.round(data.analysis.coverage * 100);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barra de progreso de lectura */}
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-transparent" aria-hidden>
        <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <header className="animate-rise">
        <Link href="/app/read" className="text-sm font-semibold text-muted hover:text-text">← Lecturas</Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl" lang={undefined}>{data.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Chip>{data.analysis.level}</Chip>
          <Chip tone={coverage >= 90 ? "success" : coverage >= 80 ? "warning" : "danger"}>Conoces ~{coverage} %</Chip>
          <Chip tone="muted">{data.analysis.words} palabras · {newCount} nuevas</Chip>
          <span className="text-muted">{data.sourceLabel}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-border bg-surface" role="group" aria-label="Tamaño del texto">
            <button type="button" onClick={() => setSize((s) => Math.max(0.85, s - 0.1))} className="grid size-9 place-items-center text-muted hover:text-text" aria-label="Letra más pequeña"><Minus size={16} /></button>
            <span className="w-10 text-center text-xs font-semibold text-muted">{Math.round(size * 100)}%</span>
            <button type="button" onClick={() => setSize((s) => Math.min(1.6, s + 0.1))} className="grid size-9 place-items-center text-muted hover:text-text" aria-label="Letra más grande"><Plus size={16} /></button>
          </div>
          <button type="button" onClick={() => setHighlight((h) => !h)} aria-pressed={highlight} className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium", highlight ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-muted")}>
            {highlight ? <Eye size={15} /> : <EyeOff size={15} />} Palabras nuevas
          </button>
          {data.url ? (
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-muted hover:text-text">
              Original <ExternalLink size={14} />
            </a>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-muted">Toca cualquier palabra para ver su significado. Las subrayadas probablemente son nuevas para ti.</p>
      </header>

      <article ref={article} className="card mt-6 space-y-5 p-6 sm:p-8" lang={data.locale} dir={data.rtl ? "rtl" : "ltr"} style={{ fontSize: `${1.12 * size}rem`, lineHeight: 1.75 }}>
        {data.paragraphs.map((tokens, i) => (
          <div key={i} className="group relative">
            <p>
              {tokens.map((t, j) =>
                t.w && t.id ? (
                  <button
                    key={j}
                    type="button"
                    onClick={() => open(t.id!)}
                    className={cn(
                      "rounded-[4px] px-[1px] text-left transition-colors hover:bg-primary-soft focus-visible:bg-primary-soft",
                      active === t.id && "bg-primary-soft text-primary",
                      highlight && !data.words[t.id]?.known && "underline decoration-primary/60 decoration-dotted decoration-2 underline-offset-4",
                      saved.has(t.id) && "decoration-success decoration-solid",
                    )}
                  >
                    {t.t}
                  </button>
                ) : (
                  <span key={j}>{t.t}</span>
                ),
              )}
            </p>
            {data.translations?.[i] ? (
              shownTr.has(i) ? (
                <p className="mt-1 animate-fade text-[0.8em] text-muted" lang="es" dir="ltr">{data.translations[i]}</p>
              ) : (
                <button type="button" onClick={() => setShownTr((s) => new Set(s).add(i))} className="mt-1 text-[0.72em] font-semibold text-primary/80 hover:text-primary" lang="es" dir="ltr">
                  Ver traducción
                </button>
              )
            ) : null}
            <button
              type="button"
              onClick={() => speakParagraph(i)}
              className={cn("absolute -left-11 top-0 hidden size-8 place-items-center rounded-full text-muted transition hover:bg-primary-soft hover:text-primary sm:grid", speaking === i && "bg-primary-soft text-primary")}
              aria-label={speaking === i ? "Detener lectura en voz alta" : "Escuchar este párrafo"}
            >
              {speaking === i ? <Pause size={15} /> : <Play size={15} />}
            </button>
          </div>
        ))}
        {data.license ? (
          <p className="border-t border-border pt-4 text-xs text-muted" lang="es" dir="ltr">
            Texto: «{data.title}», {data.sourceLabel}, <a href={data.licenseUrl} className="underline" target="_blank" rel="noopener noreferrer">{data.license}</a>. Adaptado a fragmentos para el aprendizaje.
          </p>
        ) : null}
      </article>

      {/* Panel de palabra */}
      {w && active ? (
        <div role="dialog" aria-label={`Palabra: ${w.lemma}`} className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 sm:px-0">
          <div className="card animate-sheet p-5 shadow-[0_20px_60px_rgb(31_27_46/0.2)]">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-extrabold" lang={data.locale}>{w.lemma}</p>
                <p className="text-sm text-muted">{[w.reading, w.ipa, POS_ES[w.pos] ?? w.pos].filter(Boolean).join(" · ")}</p>
              </div>
              <SpeakButton text={w.lemma} audioUrl={w.audioUrl} locale={data.locale} size={40} />
              <button type="button" onClick={() => setActive(null)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <p className="mt-3 text-lg font-semibold text-primary">{w.translation.join(", ")}</p>
            {w.note ? <p className="mt-1 text-sm text-muted">{w.note}</p> : null}
            <div className="mt-2 flex items-center gap-2"><Chip tone="muted">{w.cefr}</Chip>{w.known ? <Chip tone="success">Probablemente la conoces</Chip> : <Chip>Nueva para ti</Chip>}</div>
            <div className="mt-4 flex gap-2">
              {saved.has(active) ? (
                <span className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-success"><Check size={16} /> Guardada para repasar</span>
              ) : (
                <>
                  <Button size="sm" onClick={() => void save(active, "saved")}><BookmarkPlus size={16} /> Repasarla</Button>
                  <Button size="sm" variant="secondary" onClick={() => void save(active, "known")}>Ya la sé</Button>
                </>
              )}
              <Link href={`/app/vocabulary/${encodeURIComponent(active)}`} className="ml-auto self-center text-sm font-semibold text-primary hover:underline">Ficha</Link>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "reading" && (
        <div className="mt-8 flex flex-col items-center gap-3 pb-8 text-center">
          {looked.size > 0 && [...looked].some((id) => !saved.has(id)) ? (
            <Button variant="secondary" onClick={() => void saveAllLooked()}><BookmarkPlus size={16} /> Guardar las {[...looked].filter((id) => !saved.has(id)).length} palabras que consultaste</Button>
          ) : null}
          <Button size="lg" onClick={() => { setActive(null); setPhase(data.quiz.length ? "quiz" : "done"); if (!data.quiz.length) void finish(0, 0); }}>
            {data.quiz.length ? "Terminé: comprobar lo que entendí" : "Terminé de leer"} <ArrowRight size={18} />
          </Button>
        </div>
      )}

      {phase !== "reading" && <Quiz data={data} started={started.current} onDone={() => setPhase("done")} />}
    </div>
  );

  async function finish(correct: number, total: number) {
    await completeReadingAction({
      source: data.source,
      title: data.title,
      url: data.url ?? "",
      level: data.analysis.level,
      theta: data.analysis.theta,
      words: data.analysis.words,
      correct,
      total,
      seconds: Math.round((Date.now() - started.current) / 1000),
    });
  }
}

function Quiz({ data, started, onDone }: { data: ReaderData; started: number; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<{ achievements: { id: string; title: string; icon: string }[] } | null>(null);
  const q = data.quiz[i];

  const next = async () => {
    const gained = picked === q!.answer ? 1 : 0;
    const total = score + gained;
    if (i + 1 < data.quiz.length) {
      setScore(total);
      setI(i + 1);
      setPicked(null);
      return;
    }
    setScore(total);
    const res = await completeReadingAction({
      source: data.source,
      title: data.title,
      url: data.url ?? "",
      level: data.analysis.level,
      theta: data.analysis.theta,
      words: data.analysis.words,
      correct: total,
      total: data.quiz.length,
      seconds: Math.round((Date.now() - started) / 1000),
    });
    setResult({ achievements: res.ok ? res.data.newAchievements : [] });
    onDone();
  };

  if (result) {
    const pct = Math.round((score / Math.max(1, data.quiz.length)) * 100);
    return (
      <section className="card mt-8 animate-rise p-7 text-center" aria-live="polite">
        {pct >= 60 ? <Confetti /> : null}
        <Trophy className="mx-auto text-warning" size={40} />
        <h2 className="mt-3 font-display text-2xl font-extrabold">{pct >= 80 ? "¡Excelente comprensión!" : pct >= 50 ? "¡Buen trabajo!" : "Texto retador, ¡bien por intentarlo!"}</h2>
        <p className="mt-1 text-muted">{score} de {data.quiz.length} respuestas correctas · tu nivel de lectura se actualizó.</p>
        {result.achievements.length ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">{result.achievements.map((a) => <Chip key={a.id} tone="warning">{a.icon} {a.title}</Chip>)}</div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/app/read" className="inline-flex h-11 items-center rounded-[14px] bg-primary px-5 font-semibold text-on-primary">Otra lectura</Link>
          <Link href="/app/review" className="inline-flex h-11 items-center rounded-[14px] border border-border bg-surface px-5 font-semibold text-primary">Repasar palabras</Link>
        </div>
      </section>
    );
  }
  if (!q) return null;
  return (
    <section className="card mt-8 animate-rise p-6 sm:p-7" aria-labelledby="quiz-title">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Pregunta {i + 1} de {data.quiz.length}</p>
      <h2 id="quiz-title" className="mt-2 font-display text-xl font-extrabold">{q.prompt}</h2>
      {q.kind === "cloze" && q.context ? <p className="mt-3 rounded-2xl bg-surface-muted p-4 text-lg" lang={data.locale}>{q.context}</p> : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          const state = picked ? (o === q.answer ? "ok" : o === picked ? "bad" : null) : null;
          return (
            <button
              key={o}
              type="button"
              disabled={!!picked}
              onClick={() => setPicked(o)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left font-medium transition",
                !picked && "border-border bg-surface hover:border-primary",
                state === "ok" && "animate-pop border-success bg-success-soft text-success",
                state === "bad" && "animate-shake border-danger bg-danger-soft text-danger",
                picked && !state && "border-border opacity-60",
              )}
              lang={q.kind === "cloze" ? data.locale : undefined}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked ? (
        <div className="mt-5 flex items-center gap-3">
          <p className={cn("flex-1 font-semibold", picked === q.answer ? "text-success" : "text-danger")}>{picked === q.answer ? "¡Correcto!" : `Era: ${q.answer}`}</p>
          <Button onClick={() => void next()}>{i + 1 < data.quiz.length ? "Siguiente" : "Ver resultado"} <ArrowRight size={16} /></Button>
        </div>
      ) : null}
    </section>
  );
}
