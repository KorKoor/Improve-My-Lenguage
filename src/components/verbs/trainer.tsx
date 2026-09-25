"use client";

import { ArrowRight, Check, Loader2, RotateCcw, Search, Shuffle, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { answerVerbAction, finishVerbDrillAction, startVerbDrillAction } from "@/app/app/skills-actions";
import { Confetti } from "@/components/celebrate";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { VerbFeedback, VerbQuestion, VerbSummary } from "@/lib/services/verbs";

export function VerbTrainer({ verbs, level, language, languageName, initialVerb }: { verbs: VerbSummary[]; level: string; language: string; languageName: string; initialVerb: string | null }) {
  const [state, setState] = useState<"pick" | "loading" | "run" | "done">("pick");
  const [questions, setQuestions] = useState<VerbQuestion[]>([]);
  const [locale, setLocale] = useState("en-US");
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const [fb, setFb] = useState<VerbFeedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [achievements, setAchievements] = useState<{ id: string; title: string; icon: string }[]>([]);
  const [focusVerb, setFocusVerb] = useState<string | null>(initialVerb);
  const started = useRef(Date.now());
  const input = useRef<HTMLInputElement>(null);
  const cur = questions[i];

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? verbs.filter((v) => v.lemma.toLowerCase().includes(n) || v.translation.toLowerCase().includes(n)) : verbs;
  }, [q, verbs]);

  async function begin(verbId: string | null) {
    setErr(null);
    setFocusVerb(verbId);
    setState("loading");
    const r = await startVerbDrillAction(verbId);
    if (!r.ok) {
      setErr(r.error);
      return setState("pick");
    }
    if (r.data.questions.length === 0) {
      setErr("No hay formas para practicar con ese verbo todavía.");
      return setState("pick");
    }
    setQuestions(r.data.questions);
    setLocale(r.data.locale);
    setI(0);
    setScore(0);
    setStreak(0);
    setFb(null);
    setAnswer("");
    setState("run");
    started.current = Date.now();
    setTimeout(() => input.current?.focus(), 50);
  }

  async function check(e?: React.FormEvent) {
    e?.preventDefault();
    if (!cur || busy || fb || !answer.trim()) return;
    setBusy(true);
    const r = await answerVerbAction(cur.key, answer, Date.now() - started.current);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setFb(r.data);
    if (r.data.correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else setStreak(0);
  }

  async function next() {
    setFb(null);
    setAnswer("");
    if (i + 1 >= questions.length) {
      setState("done");
      const r = await finishVerbDrillAction(score, questions.length);
      if (r.ok) setAchievements(r.data.newAchievements);
      return;
    }
    setI(i + 1);
    started.current = Date.now();
    setTimeout(() => input.current?.focus(), 30);
  }

  if (state === "pick" || state === "loading") {
    return (
      <div className="space-y-6">
        <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-3xl animate-float" aria-hidden>🔤</span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-extrabold">Mezcla de tu nivel ({level})</h2>
            <p className="text-sm text-muted">12 formas de los verbos más útiles, con los tiempos que te tocan ahora. Puedes escribir el pronombre o no.</p>
          </div>
          <Button size="lg" onClick={() => begin(null)} disabled={state === "loading"}>
            {state === "loading" && !focusVerb ? <Loader2 className="animate-spin" size={18} aria-hidden /> : <Shuffle size={18} aria-hidden />} Empezar
          </Button>
        </section>
        {err && <p className="text-sm text-danger" role="alert">{err}</p>}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">O elige un verbo</h2>
            <label className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <span className="sr-only">Buscar verbo</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Busca en ${languageName.toLowerCase()} o español`} className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3" />
            </label>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((v) => (
              <li key={v.id}>
                <button type="button" disabled={state === "loading"} onClick={() => begin(v.id)} className="card lift flex w-full items-center gap-2 p-3 text-left hover:border-primary">
                  <span className="min-w-0 flex-1">
                    <span lang={language} className="block truncate font-semibold">{v.lemma}</span>
                    <span className="block truncate text-xs text-muted">{v.translation}</span>
                  </span>
                  {state === "loading" && focusVerb === v.id ? <Loader2 size={16} className="animate-spin text-primary" aria-hidden /> : <Chip tone="muted">{v.cefr}</Chip>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  if (state === "done") {
    const pct = Math.round((score / Math.max(1, questions.length)) * 100);
    return (
      <div className="card mx-auto max-w-xl space-y-4 p-8 text-center animate-rise">
        {pct >= 70 && <Confetti />}
        <Trophy className="mx-auto text-warning animate-pop-in" size={44} aria-hidden />
        <h2 className="font-display text-2xl font-extrabold">{pct >= 90 ? "¡Dominas estos verbos!" : pct >= 70 ? "¡Muy bien conjugado!" : "¡Buen entrenamiento!"}</h2>
        <p className="text-muted">{score} de {questions.length} formas correctas. Los fallos vuelven en tus próximas sesiones.</p>
        {achievements.map((a) => <p key={a.id} className="font-semibold text-primary">{a.icon} Logro: {a.title}</p>)}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => begin(focusVerb)}><RotateCcw size={16} aria-hidden /> Otra ronda</Button>
          <Button variant="secondary" onClick={() => setState("pick")}>Elegir otro verbo</Button>
          <Link href="/app/explore" className="inline-flex h-11 items-center px-3 font-semibold text-primary">Practicar otra cosa</Link>
        </div>
      </div>
    );
  }

  if (!cur) return null;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={i / questions.length} label={`Forma ${i + 1} de ${questions.length}`} height={10} className="flex-1" />
        {streak >= 3 && <span key={streak} className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-warning animate-pop-in">🔥 {streak}</span>}
      </div>
      <section key={cur.key} className={cn("card space-y-5 p-6 sm:p-8", fb && !fb.correct ? "animate-shake" : "animate-rise")}>
        <div className="flex flex-wrap items-center gap-2">
          <Chip>{cur.tenseLabel}</Chip>
          <span className="text-sm text-muted">«{cur.translation}»</span>
        </div>
        <p className="font-display text-2xl font-bold sm:text-3xl">
          <span lang={language}>{cur.lemma}</span> <span className="text-muted">→</span> <span lang={language} className="text-primary">{cur.pronoun}</span> …
        </p>
        <form onSubmit={check} className="flex gap-2">
          <label htmlFor="verb-answer" className="sr-only">Forma conjugada</label>
          <input
            id="verb-answer"
            ref={input}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!!fb}
            lang={language}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Escribe la forma…"
            className={cn("h-14 flex-1 rounded-2xl border-2 bg-surface px-4 text-lg outline-none focus:border-primary", fb ? (fb.correct ? "border-success" : "border-danger") : "border-border")}
          />
          {!fb && (
            <Button type="submit" size="lg" disabled={!answer.trim() || busy}>
              {busy ? <Loader2 className="animate-spin" size={18} aria-hidden /> : "Comprobar"}
            </Button>
          )}
        </form>
        {err && <p className="text-sm text-danger" role="alert">{err}</p>}
        {fb && (
          <div className={cn("space-y-3 rounded-2xl p-4 animate-sheet", fb.correct ? "bg-success-soft" : "bg-danger-soft")} role="status">
            <p className={cn("flex items-center gap-2 font-display text-lg font-extrabold", fb.correct ? "text-success" : "text-danger")}>
              <span className={cn("grid size-7 place-items-center rounded-full text-white animate-pop-in", fb.correct ? "bg-success" : "bg-danger")} aria-hidden>
                {fb.correct ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
              </span>
              {fb.correct ? (fb.nearMiss ? "¡Casi! Ojo con los acentos" : "¡Correcto!") : "Se dice:"}
              <span lang={language} className="text-text">{fb.full}</span>
              <SpeakButton text={fb.full} locale={locale} size={32} label="Escuchar" />
            </p>
            <table className="w-full text-sm">
              <caption className="sr-only">Conjugación completa</caption>
              <tbody>
                {fb.row.map((r, k) => (
                  <tr key={k} className={cn(k === cur.person && "font-bold")}>
                    <td className="w-1/3 py-0.5 pr-3 text-muted" lang={language}>{r.pronoun}</td>
                    <td lang={language} className={cn(k === cur.person && (fb.correct ? "text-success" : "text-danger"))}>{r.form ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button onClick={next} autoFocus variant={fb.correct ? "success" : "primary"} className="w-full">
              {i + 1 >= questions.length ? "Terminar" : "Siguiente"} <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
