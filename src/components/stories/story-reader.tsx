"use client";

import { ArrowRight, Check, Eye, Loader2, Snail, Volume2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { completeStoryAction } from "@/app/app/first-steps-actions";
import { setWordStatusAction } from "@/app/app/actions";
import { Confetti } from "@/components/celebrate";
import { useSpeech, VoiceWarning } from "@/components/speak-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { Story } from "@/lib/content/stories";

export interface StoryToken {
  t: string;
  id?: string;
  lemma?: string;
  tr?: string;
}

/**
 * Historia graduada: se lee frase a frase (con audio lento y traducción al
 * tocar) y se termina con preguntas de comprensión.
 */
export function StoryReader({ story, tokens, locale, language, languageName, rtl }: { story: Story; tokens: StoryToken[][]; locale: string; language: string; languageName: string; rtl: boolean }) {
  const [word, setWord] = useState<{ line: number; k: number } | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const { speak } = useSpeech(locale);
  const [shown, setShown] = useState(1);
  const [reveal, setReveal] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<"read" | "quiz" | "done">("read");
  const [q, setQ] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [saving, setSaving] = useState(false);
  const started = useRef(Date.now());
  const dir = rtl ? "rtl" : "ltr";

  useEffect(() => {
    if (phase === "read") speak(story.lines[shown - 1]!.t, 0.8);
  }, [shown, phase, story, speak]);

  const finish = async (score: number) => {
    setSaving(true);
    await completeStoryAction(story.id, score, story.questions.length, Math.round((Date.now() - started.current) / 1000));
    setSaving(false);
    setPhase("done");
  };

  if (phase === "done") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center animate-rise">
        {correct === story.questions.length && <Confetti />}
        <p className="text-5xl" aria-hidden>{story.emoji}</p>
        <h1 className="font-display text-3xl font-extrabold">¡Historia terminada!</h1>
        <p className="text-muted">{correct} de {story.questions.length} preguntas correctas. Has leído una historia entera en {languageName.toLowerCase()}.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/app/stories" size="lg">Más historias</ButtonLink>
          <ButtonLink href="/app/session" variant="secondary" size="lg">Sesión de hoy</ButtonLink>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const cur = story.questions[q]!;
    return (
      <div className="flex flex-1 flex-col pb-10 pt-5">
        <div className="flex items-center gap-4">
          <Link href="/app/stories" aria-label="Salir" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted"><X size={20} /></Link>
          <ProgressBar value={0.5 + (q / story.questions.length) * 0.5} label={`Pregunta ${q + 1} de ${story.questions.length}`} height={10} className="flex-1" />
        </div>
        <p className="mt-6 text-sm font-semibold text-muted">Comprensión · {q + 1} de {story.questions.length}</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold">{cur.q}</h2>
        <div className="mt-5 grid gap-2.5">
          {cur.options.map((o) => {
            const state = chosen ? (o === cur.answer ? "ok" : o === chosen ? "bad" : null) : null;
            return (
              <button key={o} type="button" disabled={!!chosen} onClick={() => { setChosen(o); if (o === cur.answer) setCorrect((c) => c + 1); }} className={cn("flex items-center gap-2 rounded-2xl border px-4 py-3.5 text-left font-medium", state === "ok" ? "border-2 border-success bg-success-soft text-success" : state === "bad" ? "border-2 border-danger bg-danger-soft text-danger" : "border-border bg-surface hover:border-primary")}>
                <span className="flex-1">{o}</span>
                {state === "ok" && <Check size={18} aria-hidden />}
                {state === "bad" && <X size={18} aria-hidden />}
              </button>
            );
          })}
        </div>
        {chosen && (
          <Button size="lg" className="mt-6 w-full" autoFocus disabled={saving} onClick={() => {
            if (q + 1 < story.questions.length) { setQ(q + 1); setChosen(null); }
            else void finish(correct);
          }}>
            {saving && <Loader2 size={16} className="animate-spin" aria-hidden />} {q + 1 < story.questions.length ? "Siguiente" : "Terminar"} <ArrowRight size={18} aria-hidden />
          </Button>
        )}
      </div>
    );
  }

  const done = shown >= story.lines.length;
  return (
    <div className="flex flex-1 flex-col pb-10 pt-5">
      <div className="flex items-center gap-4">
        <Link href="/app/stories" aria-label="Salir" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted"><X size={20} /></Link>
        <ProgressBar value={(shown / story.lines.length) * 0.5} label={`Frase ${shown} de ${story.lines.length}`} height={10} className="flex-1" />
        <span className="text-xl" aria-hidden>{story.emoji}</span>
      </div>
      <VoiceWarning locale={locale} languageName={languageName} />
      <h1 className="mt-6 font-display text-2xl font-extrabold" lang={language} dir={dir}>{story.title}</h1>
      <p className="text-sm text-muted">Toca una palabra para ver qué significa, o <Eye size={13} className="inline" aria-label="el ojo" /> para traducir la frase entera.</p>
      <ol className="mt-4 space-y-3">
        {story.lines.slice(0, shown).map((l, i) => (
          <li key={i} className={cn("card p-4 animate-rise", i === shown - 1 && "border-primary")}>
            <div className="flex items-start gap-2">
              <p className="flex-1 text-lg leading-relaxed" lang={language} dir={dir}>
                {(tokens[i] ?? [{ t: l.t }]).map((tk, k) =>
                  tk.id ? (
                    <button key={k} type="button" onClick={() => setWord(word?.line === i && word.k === k ? null : { line: i, k })} className={cn("rounded px-0.5 underline decoration-dotted decoration-primary/40 underline-offset-4 hover:bg-primary-soft", word?.line === i && word.k === k && "bg-primary-soft")}>
                      {tk.t}
                    </button>
                  ) : (
                    <span key={k}>{tk.t}</span>
                  ),
                )}
              </p>
              <button type="button" onClick={() => speak(l.t, 0.8)} className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary" aria-label="Escuchar"><Volume2 size={16} /></button>
              <button type="button" onClick={() => speak(l.t, 0.55)} className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-primary" aria-label="Escuchar despacio"><Snail size={16} /></button>
              <button type="button" onClick={() => setReveal((r) => new Set(r).add(i))} className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-muted" aria-label="Ver traducción"><Eye size={16} /></button>
            </div>
            {l.r && <p className="mt-1 text-sm text-muted">{l.r}</p>}
            {word?.line === i && tokens[i]?.[word.k]?.id && (() => {
              const tk = tokens[i]![word.k]!;
              return (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm animate-fade">
                  <strong lang={language}>{tk.lemma}</strong> <span>= {tk.tr}</span>
                  <button type="button" onClick={() => speak(tk.lemma!, 0.8)} className="grid size-7 place-items-center rounded-full bg-surface text-primary" aria-label="Escuchar la palabra"><Volume2 size={13} /></button>
                  <button
                    type="button"
                    disabled={saved.has(tk.id!)}
                    onClick={async () => {
                      const r = await setWordStatusAction(tk.id!, "saved");
                      if (r.ok) setSaved((s) => new Set(s).add(tk.id!));
                    }}
                    className="ml-auto rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {saved.has(tk.id!) ? "✓ Guardada para repasar" : "+ Guardar para repasar"}
                  </button>
                </div>
              );
            })()}
            {reveal.has(i) && <p className="mt-2 text-sm text-muted animate-fade">{l.es}</p>}
          </li>
        ))}
      </ol>
      <Button size="lg" className="mt-6 w-full" autoFocus onClick={() => (done ? setPhase("quiz") : setShown((s) => s + 1))}>
        {done ? "Preguntas de comprensión" : "Siguiente frase"} <ArrowRight size={18} aria-hidden />
      </Button>
    </div>
  );
}
