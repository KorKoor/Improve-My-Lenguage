"use client";
import { BookOpen, Check, ExternalLink, Headphones, Loader2, MessageCircle, PenLine, Sparkles, HelpCircle, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { submitWritingAction } from "@/app/app/skills-actions";
import { Afi, type AfiMood } from "@/components/afi/afi";
import { Confetti } from "@/components/celebrate";
import { Reader } from "@/components/reading/reader";
import { SpeakButton, useSpeech } from "@/components/speak-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceList } from "@/components/ui/choice-list";
import { cn } from "@/lib/cn";
import { rng, shuffle } from "@/lib/engine/games";
import type { WorldPack } from "@/lib/engine/world";
import type { ReaderData } from "@/lib/services/reading";
import type { WritingResult } from "@/lib/services/writing";
import { RECENT_KEY, type RecentLesson } from "./start";

type Part = "vocab" | "reading" | "questions" | "listening" | "talk" | "write";
const PARTS: { id: Part; label: string; icon: typeof BookOpen }[] = [
  { id: "vocab", label: "Vocabulario", icon: Sparkles },
  { id: "reading", label: "Lectura", icon: BookOpen },
  { id: "questions", label: "Preguntas", icon: HelpCircle },
  { id: "listening", label: "Escucha", icon: Headphones },
  { id: "talk", label: "Conversación", icon: MessageCircle },
  { id: "write", label: "Escritura", icon: PenLine },
];

/** Una lección de «Aprende con el mundo»: seis partes, en el orden que quieras. */
export function WorldLesson({ id, pack, reader, lang, locale, dir }: { id: string; pack: WorldPack; reader: ReaderData; lang: string; locale: string; dir: "ltr" | "rtl" }) {
  const [part, setPart] = useState<Part>("vocab");
  const [done, setDone] = useState<Set<Part>>(new Set());
  const finish = (p: Part) => setDone((d) => new Set(d).add(p));
  const all = done.size === PARTS.length;

  // Recordar la lección en «Tus lecciones» (sólo en este dispositivo).
  useEffect(() => {
    try {
      const list: RecentLesson[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      const next = [{ id, title: pack.title, kind: pack.source?.kind ?? "topic", at: Date.now() }, ...list.filter((r) => r.id !== id)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignorar */
    }
  }, [id, pack.title, pack.source?.kind]);

  const mood: AfiMood = all ? "celebrating" : done.size >= 3 ? "proud" : "happy";
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {all && <Confetti />}
      <header className="flex items-start gap-4 animate-rise">
        <div className="min-w-0 flex-1">
          <Link href="/app/world" className="text-sm font-semibold text-muted hover:text-text">← Aprende con el mundo</Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">{pack.title}</h1>
          {pack.summary && <p className="mt-2 text-muted">{pack.summary}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 font-semibold">{pack.level}</span>
            {pack.source?.url ? (
              <a href={pack.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
                {pack.source.label} <ExternalLink size={12} aria-hidden /><span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            ) : (
              <span>{pack.source?.label}</span>
            )}
            {pack.source?.license ? <span>· {pack.source.license}</span> : null}
            <span>· Lección escrita por Afi con IA: puede tener algún error.</span>
          </p>
        </div>
        <Afi size={84} mood={mood} motion={all ? "hop" : "float"} className="hidden sm:block" key={done.size} />
      </header>

      <nav aria-label="Partes de la lección" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {PARTS.map(({ id: p, label, icon: Icon }) => (
          <button
            key={p}
            type="button"
            onClick={() => setPart(p)}
            aria-current={part === p ? "step" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
              part === p ? "border-primary bg-primary text-on-primary" : "border-border bg-surface hover:border-primary",
            )}
          >
            {done.has(p) ? <Check size={16} aria-hidden /> : <Icon size={16} aria-hidden />} {label}
            {done.has(p) ? <span className="sr-only"> (hecho)</span> : null}
          </button>
        ))}
      </nav>

      <section aria-live="polite">
        {part === "vocab" && <VocabPart pack={pack} lang={lang} locale={locale} dir={dir} onDone={() => { finish("vocab"); setPart("reading"); }} />}
        {part === "reading" && (
          <div className="space-y-4">
            <Reader data={reader} embedded />
            <Next onClick={() => { finish("reading"); setPart("questions"); }}>Ya lo leí</Next>
          </div>
        )}
        {part === "questions" && <QuestionsPart pack={pack} onDone={() => { finish("questions"); setPart("listening"); }} />}
        {part === "listening" && <ListeningPart pack={pack} locale={locale} lang={lang} dir={dir} onDone={() => { finish("listening"); setPart("talk"); }} />}
        {part === "talk" && <TalkPart pack={pack} locale={locale} lang={lang} dir={dir} onDone={() => { finish("talk"); setPart("write"); }} />}
        {part === "write" && <WritePart pack={pack} onDone={() => finish("write")} />}
      </section>

      {all && (
        <div className="card flex items-center gap-4 p-5" role="status">
          <Afi size={64} mood="celebrating" />
          <p className="flex-1 font-semibold">Lección completa. Ya sabes hablar de «{pack.title}» en otro idioma. ¿Otra?</p>
          <ButtonLink href="/app/world">Nueva lección</ButtonLink>
        </div>
      )}
    </div>
  );
}

function Next({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <Button size="lg" className="w-full" onClick={onClick}>{children}</Button>;
}

function VocabPart({ pack, lang, locale, dir, onDone }: { pack: WorldPack; lang: string; locale: string; dir: "ltr" | "rtl"; onDone: () => void }) {
  return (
    <div className="space-y-4">
      <ul className="grid gap-3 sm:grid-cols-2">
        {pack.vocabulary.map((v) => (
          <li key={v.term} className="card flex gap-3 p-4">
            <SpeakButton text={v.term} locale={locale} size={36} label={`Escuchar «${v.term}»`} />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold" lang={lang} dir={dir}>{v.term}</p>
              {v.reading && <p className="text-xs text-muted">{v.reading}</p>}
              <p className="text-sm font-semibold text-primary">{v.meaning}</p>
              {v.example && <p className="mt-1 text-sm text-muted" lang={lang} dir={dir}>{v.example}</p>}
            </div>
          </li>
        ))}
      </ul>
      <Next onClick={onDone}>Ya las vi · ir a la lectura</Next>
    </div>
  );
}

function QuestionsPart({ pack, onDone }: { pack: WorldPack; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const q = pack.questions[i];
  if (!pack.questions.length) return <p className="text-muted">Esta lección no trae preguntas. <button type="button" className="font-semibold text-primary underline" onClick={onDone}>Seguir</button></p>;
  if (!q) {
    return (
      <div className="card flex flex-col items-center gap-3 p-6 text-center">
        <Afi size={80} mood={right === pack.questions.length ? "proud" : "encouraging"} motion="hop" />
        <p className="font-display text-xl font-extrabold">{right} de {pack.questions.length} correctas</p>
        <Next onClick={onDone}>Seguir con la escucha</Next>
      </div>
    );
  }
  const correct = q.options[q.answer]!;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Pregunta {i + 1} de {pack.questions.length}</p>
      <h2 className="font-display text-xl font-extrabold">{q.question}</h2>
      <ChoiceList
        key={i}
        options={q.options}
        answered={answer !== null}
        result={(o) => (o === correct ? "ok" : o === answer ? "bad" : null)}
        onConfirm={(o) => {
          setAnswer(o);
          if (o === correct) setRight((r) => r + 1);
        }}
        listen={false}
      />
      {answer !== null && (
        <div className="space-y-3">
          <p className={cn("rounded-2xl p-4 text-sm", answer === correct ? "bg-success-soft text-success-ink" : "bg-warning-soft")}>
            <strong>{answer === correct ? "¡Bien! " : `Era: ${correct}. `}</strong>{q.explanation}
          </p>
          <Next onClick={() => { setAnswer(null); setI(i + 1); }}>Siguiente</Next>
        </div>
      )}
    </div>
  );
}

/** Escucha: suena una frase y eliges qué significa (sin verla hasta responder). */
function ListeningPart({ pack, locale, lang, dir, onDone }: { pack: WorldPack; locale: string; lang: string; dir: "ltr" | "rtl"; onDone: () => void }) {
  const { speak, supported } = useSpeech(locale);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const item = pack.listening[i];
  const options = useMemo(() => shuffle(pack.listening.map((l) => l.meaning), rng(i + 7)), [pack.listening, i]);
  useEffect(() => {
    if (item) speak(item.text, 0.9);
  }, [item, speak]);
  if (!pack.listening.length) return <p className="text-muted">Esta lección no trae frases para escuchar. <button type="button" className="font-semibold text-primary underline" onClick={onDone}>Seguir</button></p>;
  if (!item) return <Next onClick={onDone}>Seguir con la conversación</Next>;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Frase {i + 1} de {pack.listening.length}: escúchala y elige qué significa.</p>
      <button type="button" onClick={() => speak(item.text, 0.8)} className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-on-primary shadow-lg transition active:scale-95" aria-label="Volver a escuchar">
        <Volume2 size={34} aria-hidden />
      </button>
      {!supported && <p className="text-center text-sm text-muted">Tu navegador no tiene voz para este idioma: lee la frase al responder.</p>}
      <ChoiceList
        key={i}
        options={options}
        answered={answer !== null}
        result={(o) => (o === item.meaning ? "ok" : o === answer ? "bad" : null)}
        onConfirm={setAnswer}
        listen={false}
      />
      {answer !== null && (
        <div className="space-y-3">
          <p className="rounded-2xl bg-surface-muted p-4 text-lg font-semibold" lang={lang} dir={dir}>{item.text}</p>
          <Next onClick={() => { setAnswer(null); setI(i + 1); }}>Siguiente</Next>
        </div>
      )}
    </div>
  );
}

function TalkPart({ pack, locale, lang, dir, onDone }: { pack: WorldPack; locale: string; lang: string; dir: "ltr" | "rtl"; onDone: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-muted">Piensa cómo responderías (en voz alta, si puedes). Luego habla de esto con el tutor.</p>
      <ul className="space-y-2">
        {pack.conversation.map((c) => (
          <li key={c} className="card flex items-center gap-3 p-4">
            <SpeakButton text={c} locale={locale} size={34} />
            <span className="flex-1 font-semibold" lang={lang} dir={dir}>{c}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={`/app/tutor?topic=${encodeURIComponent(pack.title)}`} size="lg" onClick={onDone}>
          <MessageCircle size={18} aria-hidden /> Conversar con el tutor
        </ButtonLink>
        <Button variant="secondary" size="lg" onClick={onDone}>Seguir con la escritura</Button>
      </div>
    </div>
  );
}

function WritePart({ pack, onDone }: { pack: WorldPack; onDone: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WritingResult | null>(null);
  const send = async () => {
    setBusy(true);
    setError(null);
    const res = await submitWritingAction("world", text, true, pack.writing);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setResult(res.data);
    onDone();
  };
  return (
    <div className="space-y-4">
      <p className="rounded-2xl bg-primary-soft p-4 font-semibold">{pack.writing || "Escribe unas frases sobre lo que has aprendido."}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={4000} aria-label="Tu texto" className="w-full rounded-xl border border-border bg-surface p-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft" disabled={busy || Boolean(result)} />
      {error && <p className="text-sm font-semibold text-danger-ink" role="alert">{error}</p>}
      {!result ? (
        <Button size="lg" className="w-full" onClick={send} disabled={busy || text.trim().length < 10}>
          {busy ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} Corregir
        </Button>
      ) : (
        <div className="card space-y-3 p-5">
          {result.ai ? (
            <>
              <p className="text-sm text-muted">Versión corregida:</p>
              <p className="font-semibold">{result.ai.corrected}</p>
              {result.ai.strengths[0] && <p className="text-sm text-success-ink">✓ {result.ai.strengths[0]}</p>}
              {result.ai.mistakes.slice(0, 4).map((m, k) => (
                <p key={k} className="text-sm"><span className="text-danger-ink line-through">{m.original}</span> → <strong>{m.correction}</strong>{m.explanation ? <span className="text-muted"> · {m.explanation}</span> : null}</p>
              ))}
            </>
          ) : (
            <p className="text-sm text-muted">{result.aiError ?? "Guardado."}</p>
          )}
          <Link href="/app/write" className="text-sm font-semibold text-primary underline underline-offset-4">Ver en Escritura</Link>
        </div>
      )}
    </div>
  );
}
