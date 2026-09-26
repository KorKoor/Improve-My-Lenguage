"use client";

import { ArrowRight, Check, Loader2, Play, Snail, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { completeAlphabetGroupAction } from "@/app/app/first-steps-actions";
import { Confetti } from "@/components/celebrate";
import { useSpeech, VoiceWarning } from "@/components/speak-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { arabicForms, type Alphabet, type Letter, type LetterGroup } from "@/lib/content/alphabets";
import { cn } from "@/lib/cn";

type Question = { kind: "see" | "hear"; letter: Letter; options: string[] };

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Ejercicios del grupo: ver la letra → elegir su sonido; oír el sonido → elegir la letra. */
function buildQuiz(group: LetterGroup, pool: Letter[]): Question[] {
  const qs: Question[] = [];
  for (const letter of group.letters) {
    // Distractores: primero del mismo grupo (lo que de verdad se confunde), luego del resto.
    const others = [...shuffle(group.letters), ...shuffle(pool)].filter((l, i, a) => l.r !== letter.r && a.findIndex((x) => x.r === l.r) === i).slice(0, 3);
    qs.push({ kind: "see", letter, options: shuffle([letter.r, ...others.map((o) => o.r)]) });
    qs.push({ kind: "hear", letter, options: shuffle([letter.g, ...others.map((o) => o.g)]) });
  }
  return shuffle(qs).slice(0, Math.max(8, Math.min(16, group.letters.length * 2)));
}

export function AlphabetTrainer({ alphabet, locale, rtl, languageName, initialProgress }: { alphabet: Alphabet; locale: string; rtl: boolean; languageName: string; initialProgress: Record<string, number> }) {
  const { speak } = useSpeech(locale);
  const [progress, setProgress] = useState(initialProgress);
  const firstPending = alphabet.groups.findIndex((g) => !progress[g.id]);
  const [gi, setGi] = useState(firstPending < 0 ? 0 : firstPending);
  const group = alphabet.groups[gi]!;
  const [selected, setSelected] = useState<Letter | null>(null);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const done = alphabet.groups.filter((g) => progress[g.id]).length;
  const dir = rtl ? "rtl" : "ltr";
  const lang = alphabet.lang;

  const say = useCallback((l: Letter, slow = false) => speak(l.say ?? l.g, slow ? 0.6 : 0.85), [speak]);
  const pool = useMemo(() => alphabet.groups.filter((g) => g.set === group.set).flatMap((g) => g.letters), [alphabet, group.set]);

  const openGroup = (i: number) => {
    setGi(i);
    setSelected(null);
    setQuiz(null);
    document.getElementById("letters")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (quiz) {
    return (
      <Quiz
        key={`${group.id}-${quiz.length}`}
        group={group}
        questions={quiz}
        lang={lang}
        dir={dir}
        say={say}
        onExit={() => setQuiz(null)}
        onSaved={(stars) => setProgress((p) => ({ ...p, [group.id]: Math.max(p[group.id] ?? 0, stars) }))}
        onNext={gi + 1 < alphabet.groups.length ? () => openGroup(gi + 1) : null}
        onRetry={() => setQuiz(buildQuiz(group, pool))}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">{alphabet.name}</h1>
        <p className="mt-1 max-w-2xl text-muted">{alphabet.intro}</p>
        <VoiceWarning locale={locale} languageName={languageName} />
      </header>

      <section className="card p-5">
        <p className="text-sm font-semibold text-muted">{done} de {alphabet.groups.length} grupos practicados</p>
        <ProgressBar value={done / alphabet.groups.length} label={`${done} de ${alphabet.groups.length} grupos`} height={10} className="mt-2" />
        <div className="mt-4 flex flex-wrap gap-2">
          {alphabet.groups.map((g, i) => (
            <button key={g.id} type="button" onClick={() => openGroup(i)} aria-pressed={i === gi} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition", i === gi ? "border-primary bg-primary text-on-primary" : progress[g.id] ? "border-success/40 bg-success-soft text-success" : "border-border bg-surface text-muted hover:border-primary")}>
              {progress[g.id] ? <Check size={14} aria-label="Practicado" /> : <span className="text-xs">{i + 1}</span>} {g.title}
            </button>
          ))}
        </div>
      </section>

      <section id="letters" className="scroll-mt-20">
        <h2 className="font-display text-2xl font-extrabold">{group.title}</h2>
        <p className="mt-1 max-w-2xl text-muted">{group.intro}</p>
        <p className="mt-3 text-sm font-semibold text-primary">Toca cada letra para oírla y ver cómo suena.</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7" dir={dir}>
          {group.letters.map((l) => (
            <button
              key={l.g}
              type="button"
              onClick={() => { setSelected(l); say(l); }}
              aria-pressed={selected?.g === l.g}
              className={cn("card lift flex flex-col items-center gap-0.5 px-2 py-3 transition active:scale-95", selected?.g === l.g && "border-2 border-primary bg-primary-soft/50")}
            >
              <span className="font-display text-3xl font-extrabold" lang={lang}>{l.upper ? `${l.upper} ${l.g}` : l.g}</span>
              <span className="text-sm font-semibold text-muted" dir="ltr">{l.r}</span>
            </button>
          ))}
        </div>

        {selected && <LetterDetail letter={selected} lang={lang} dir={dir} say={say} speakText={(t) => speak(t, 0.8)} />}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => setQuiz(buildQuiz(group, pool))}>
            <Play size={18} aria-hidden /> Practicar estas letras
          </Button>
          {done === alphabet.groups.length && <ButtonLink href="/app/course" size="lg" variant="secondary">Ir al Camino guiado <ArrowRight size={18} aria-hidden /></ButtonLink>}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg font-extrabold">Trucos para leer</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted">
          {alphabet.tips.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>
    </div>
  );
}

function LetterDetail({ letter: l, lang, dir, say, speakText }: { letter: Letter; lang: string; dir: string; say: (l: Letter, slow?: boolean) => void; speakText: (t: string) => void }) {
  const forms = lang === "ar" && [...l.g].length === 1 ? arabicForms(l.g) : null;
  return (
    <div className="card mt-4 p-5 animate-rise" role="region" aria-label={`Letra ${l.g}`}>
      <div className="flex items-start gap-4">
        <span className="font-display text-6xl font-extrabold" lang={lang} dir={dir}>{l.upper ? `${l.upper} ${l.g}` : l.g}</span>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-extrabold text-primary">{l.r}</p>
          {l.hint && <p className="mt-1 text-muted">{l.hint}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => say(l)} className="grid size-11 place-items-center rounded-full bg-primary text-on-primary active:scale-95" aria-label="Escuchar"><Volume2 size={20} /></button>
          <button type="button" onClick={() => say(l, true)} className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary active:scale-95" aria-label="Escuchar despacio"><Snail size={20} /></button>
        </div>
      </div>
      {forms && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted">Cómo cambia al unirse</p>
          <div className="mt-1.5 grid grid-cols-4 gap-2 text-center" dir="rtl">
            {forms.map((f, i) => (
              <div key={i} className="rounded-xl bg-surface-muted p-2">
                <p className="text-3xl" lang="ar">{f}</p>
                <p className="text-[11px] text-muted" dir="ltr">{["sola", "al principio", "en medio", "al final"][i]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {l.ex && (
        <button type="button" onClick={() => speakText(l.ex!.w)} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-surface-muted p-4 text-start transition hover:brightness-95">
          <Volume2 size={18} className="shrink-0 text-primary" aria-hidden />
          <span className="text-2xl font-bold" lang={lang} dir={dir}>{l.ex.w}</span>
          <span className="text-sm text-muted">{l.ex.r} · «{l.ex.es}»</span>
        </button>
      )}
    </div>
  );
}

function Quiz({ group, questions, lang, dir, say, onExit, onSaved, onNext, onRetry }: { group: LetterGroup; questions: Question[]; lang: string; dir: string; say: (l: Letter, slow?: boolean) => void; onExit: () => void; onSaved: (stars: number) => void; onNext: (() => void) | null; onRetry: () => void }) {
  const [queue, setQueue] = useState(questions);
  const [pos, setPos] = useState(0);
  const [answer, setAnswer] = useState<{ chosen: string; ok: boolean } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [result, setResult] = useState<{ state: "saving" | "done"; stars: number } | null>(null);
  const retried = useRef(new Set<string>());
  const started = useRef(Date.now());
  const q = queue[pos];

  useEffect(() => {
    if (q?.kind === "hear" && !result) say(q.letter);
  }, [q, say, result]);

  if (result) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center animate-rise">
        {result.state === "done" && result.stars >= 2 && <Confetti />}
        <h1 className="font-display text-3xl font-extrabold">¡Grupo practicado!</h1>
        <p className="text-4xl" aria-label={`${result.stars} estrellas de 3`}>
          {[1, 2, 3].map((s) => <span key={s} className={cn("inline-block", s <= result.stars ? "animate-pop-in" : "opacity-25 grayscale")}>⭐</span>)}
        </p>
        <p className="text-muted">{score.correct} de {score.total} a la primera. {result.stars < 3 ? "Repetir un par de veces ayuda mucho a fijarlas." : "¡Ya las reconoces!"}</p>
        {result.state === "saving" ? <Loader2 className="animate-spin text-primary" aria-label="Guardando" /> : (
          <div className="flex flex-wrap justify-center gap-3">
            {onNext ? <Button size="lg" onClick={onNext}>Siguiente grupo <ArrowRight size={18} aria-hidden /></Button> : <ButtonLink href="/app/course" size="lg">Ir al Camino guiado <ArrowRight size={18} aria-hidden /></ButtonLink>}
            <Button size="lg" variant="secondary" onClick={onRetry}>Repetir</Button>
            <Button size="lg" variant="ghost" onClick={onExit}>Ver las letras</Button>
          </div>
        )}
      </div>
    );
  }
  if (!q) return null;

  const target = q.kind === "see" ? q.letter.r : q.letter.g;
  const check = (o: string) => {
    if (answer) return;
    const ok = o === target;
    setAnswer({ chosen: o, ok });
    say(q.letter);
    const first = !retried.current.has(q.letter.g + q.kind);
    if (first) setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    // Lo fallado vuelve al final una vez.
    if (!ok && first) {
      retried.current.add(q.letter.g + q.kind);
      setQueue((qq) => [...qq, q]);
    }
  };
  const next = async () => {
    setAnswer(null);
    if (pos + 1 < queue.length) return setPos((p) => p + 1);
    setResult({ state: "saving", stars: 0 });
    const r = await completeAlphabetGroupAction(group.id, score.correct, score.total, Math.round((Date.now() - started.current) / 1000));
    const stars = r.ok ? r.data.stars : score.total && score.correct / score.total >= 0.9 ? 3 : score.correct / Math.max(1, score.total) >= 0.7 ? 2 : 1;
    onSaved(stars);
    setResult({ state: "done", stars });
  };
  const optionClass = (o: string) => {
    if (!answer) return "border-border bg-surface hover:border-primary hover:bg-primary-soft/40";
    if (o === target) return "border-2 border-success bg-success-soft text-success";
    if (o === answer.chosen) return "border-2 border-danger bg-danger-soft text-danger";
    return "border-border bg-surface opacity-60";
  };

  return (
    <div className="pb-40">
      <div className="flex items-center gap-4">
        <button type="button" onClick={onExit} aria-label="Salir" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted"><X size={20} /></button>
        <ProgressBar value={pos / queue.length} label={`Ejercicio ${pos + 1} de ${queue.length}`} height={10} className="flex-1" />
      </div>
      <div key={pos} className="mt-6 animate-rise">
        <p className="text-sm font-semibold text-muted">{q.kind === "see" ? "¿Cómo suena esta letra?" : "Escucha y elige la letra"}</p>
        <div className="card mt-3 flex items-center justify-center gap-4 p-8">
          {q.kind === "see" ? (
            <span className="font-display text-7xl font-extrabold" lang={lang} dir={dir}>{q.letter.upper ? `${q.letter.upper} ${q.letter.g}` : q.letter.g}</span>
          ) : (
            <>
              <button type="button" onClick={() => say(q.letter)} className="grid size-20 place-items-center rounded-full bg-primary text-on-primary shadow-lg active:scale-95" aria-label="Reproducir"><Volume2 size={34} /></button>
              <button type="button" onClick={() => say(q.letter, true)} className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary active:scale-95" aria-label="Reproducir más despacio"><Snail size={22} /></button>
            </>
          )}
        </div>
        <div className={cn("mt-5 grid gap-2.5", q.kind === "hear" && "grid-cols-2")}>
          {q.options.map((o) => (
            <button key={o} type="button" disabled={!!answer} onClick={() => check(o)} className={cn("rounded-2xl border px-4 py-3.5 font-medium transition", q.kind === "hear" ? "text-center text-4xl" : "text-left text-lg", optionClass(o))} lang={q.kind === "hear" ? lang : "es"}>
              {o}
            </button>
          ))}
        </div>
      </div>
      {answer && (
        <div role="status" className={cn("fixed inset-x-0 bottom-0 z-40 animate-rise rounded-t-3xl px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-5", answer.ok ? "bg-success-soft" : "bg-danger-soft")}>
          <div className="mx-auto max-w-2xl">
            <p className={cn("flex items-center gap-2 font-display text-xl font-extrabold", answer.ok ? "text-success" : "text-danger")}>
              {answer.ok ? <Check size={22} aria-hidden /> : <X size={22} aria-hidden />} {answer.ok ? "¡Muy bien!" : "Casi. Es:"}
            </p>
            <p className="mt-1 text-lg font-semibold"><span className="text-2xl" lang={lang}>{q.letter.g}</span> = {q.letter.r}</p>
            {q.letter.hint && <p className="text-sm text-muted">{q.letter.hint}</p>}
            <Button size="lg" variant={answer.ok ? "success" : "danger"} className="mt-4 w-full" autoFocus onClick={() => void next()}>Continuar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
