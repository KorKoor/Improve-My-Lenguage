"use client";
import { ArrowLeft, CheckCircle2, Lightbulb, Loader2, PenLine, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { submitWritingAction } from "@/app/app/skills-actions";
import { Confetti } from "@/components/celebrate";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { WritingPrompt } from "@/lib/content/writing-prompts";
import type { WritingResult } from "@/lib/services/writing";

const KIND_STYLE = {
  spelling: "decoration-danger bg-danger-soft/70",
  accent: "decoration-warning bg-warning-soft/80",
  capital: "decoration-primary bg-primary-soft/70",
  repeat: "decoration-muted bg-surface-muted",
} as const;
const KIND_LABEL = { spelling: "Ortografía", accent: "Acentos", capital: "Mayúsculas", repeat: "Estilo" } as const;

interface History {
  id: string;
  prompt: string;
  excerpt: string;
  score: number | null;
  createdAt: string;
}

function draftKey(id: string) {
  return `iml:draft:${id}`;
}

export function WritingStudio({ prompts, level, aiEnabled, locale, languageName, history }: { prompts: WritingPrompt[]; level: string; aiEnabled: boolean; locale: string; languageName: string; history: History[] }) {
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [useAi, setUseAi] = useState(aiEnabled);
  const [result, setResult] = useState<WritingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Borrador local (sólo en este navegador).
  useEffect(() => {
    if (!prompt) return;
    try {
      setText(localStorage.getItem(draftKey(prompt.id)) ?? "");
    } catch {
      /* sin almacenamiento */
    }
  }, [prompt]);
  useEffect(() => {
    if (!prompt || result) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(prompt.id), text);
      } catch {
        /* sin almacenamiento */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [text, prompt, result]);

  const wordCount = useMemo(() => (locale.startsWith("ja") || locale.startsWith("zh") ? [...text.replace(/\s/g, "")].length : text.trim().split(/\s+/).filter(Boolean).length), [text, locale]);

  const submit = async () => {
    if (!prompt) return;
    setBusy(true);
    setError(null);
    const res = await submitWritingAction(prompt.id, text, useAi);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setResult(res.data);
    try {
      localStorage.removeItem(draftKey(prompt.id));
    } catch {
      /* sin almacenamiento */
    }
  };

  if (!prompt) {
    return (
      <div className="space-y-6">
        <header className="animate-rise">
          <h1 className="font-display text-3xl font-extrabold">Escritura</h1>
          <p className="mt-1 max-w-2xl text-muted">Escribe en {languageName.toLowerCase()} y recibe correcciones al instante: ortografía, acentos, mayúsculas, variedad y el nivel de tu texto.{aiEnabled ? " Con tu tutor de IA, además, correcciones explicadas y una versión mejorada." : ""}</p>
          <p className="mt-2 text-sm text-muted">Tu nivel de escritura estimado: <Chip>{level}</Chip></p>
        </header>
        <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {prompts.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setPrompt(p)} className="card lift flex h-full w-full flex-col gap-2 p-5 text-left hover:border-primary">
                <div className="flex items-center gap-2"><Chip>{p.level}</Chip><span className="text-xs text-muted">~{p.words} palabras</span></div>
                <p className="font-display text-lg font-extrabold">{p.title}</p>
                <p className="text-sm text-muted">{p.task}</p>
              </button>
            </li>
          ))}
        </ul>
        {history.length > 0 && (
          <Card>
            <CardHeader title="Tus textos recientes" />
            <ul className="divide-y divide-border/70">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-32 shrink-0 font-medium">{h.prompt}</span>
                  <span className="flex-1 truncate text-muted">{h.excerpt}</span>
                  {h.score !== null ? <Chip tone={h.score >= 80 ? "success" : "muted"}>{h.score}</Chip> : null}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button type="button" onClick={() => { setPrompt(null); setResult(null); setText(""); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text"><ArrowLeft size={16} /> Consignas</button>
      <Card className="animate-rise">
        <div className="flex items-center gap-2"><Chip>{prompt.level}</Chip><span className="text-xs text-muted">Objetivo: ~{prompt.words} palabras</span></div>
        <h1 className="mt-2 font-display text-2xl font-extrabold">{prompt.title}</h1>
        <p className="mt-1 text-lg">{prompt.task}</p>
        <ul className="mt-3 space-y-1 text-sm text-muted">{prompt.tips.map((t) => <li key={t} className="flex gap-2"><Lightbulb size={15} className="mt-0.5 shrink-0 text-warning-ink" />{t}</li>)}</ul>
      </Card>

      {!result ? (
        <Card className="animate-rise">
          <label htmlFor="writing-text" className="sr-only">Tu texto</label>
          <textarea
            id="writing-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            maxLength={4000}
            lang={locale}
            spellCheck={false}
            placeholder={`Escribe aquí en ${languageName.toLowerCase()}…`}
            className="w-full resize-y rounded-2xl border border-border bg-bg p-4 text-lg leading-relaxed outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
          />
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={Math.min(1, wordCount / prompt.words)} label="Palabras escritas" className="flex-1" color={wordCount >= prompt.words ? "var(--success)" : undefined} />
            <span className="text-sm font-semibold tabular-nums text-muted">{wordCount}/{prompt.words}</span>
          </div>
          {aiEnabled ? (
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} className="size-4 accent-[var(--primary)]" />
              <Sparkles size={15} className="text-primary" /> Corrección detallada con el tutor de IA
            </label>
          ) : null}
          {error ? <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-ink">{error}</p> : null}
          <Button size="lg" className="mt-4 w-full sm:w-auto" onClick={() => void submit()} disabled={busy || text.trim().length < 10}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />} Revisar mi texto
          </Button>
          <p className="mt-2 text-xs text-muted">Tu borrador se guarda en este navegador mientras escribes.</p>
        </Card>
      ) : (
        <Result result={result} text={text} locale={locale} onRetry={() => setResult(null)} />
      )}
    </div>
  );
}

function Result({ result, text, locale, onRetry }: { result: WritingResult; text: string; locale: string; onRetry: () => void }) {
  const { analysis: a, ai } = result;
  const [active, setActive] = useState<number | null>(null);
  // Texto con los problemas marcados en su sitio.
  const pieces: { t: string; issue?: number }[] = [];
  let pos = 0;
  a.issues.forEach((iss, k) => {
    if (iss.start < pos) return;
    if (iss.start > pos) pieces.push({ t: text.slice(pos, iss.start) });
    pieces.push({ t: text.slice(iss.start, iss.end), issue: k });
    pos = iss.end;
  });
  if (pos < text.length) pieces.push({ t: text.slice(pos) });
  const great = (ai ? ai.mistakes.length === 0 : a.issues.length === 0) && a.words >= 10;

  return (
    <div className="space-y-5">
      {great ? <Confetti /> : null}
      <Card className="animate-rise">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>Nivel del texto: {ai?.level ?? a.level}</Chip>
          <Chip tone={a.score >= 85 ? "success" : a.score >= 60 ? "warning" : "danger"}>Precisión {ai ? Math.max(0, 100 - ai.mistakes.length * 10) : a.score}</Chip>
          <Chip tone="muted">{a.words} palabras · {a.sentences} frases</Chip>
          <Chip tone="muted">Variedad {Math.round(a.variety * 100)} %</Chip>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed" lang={locale}>
          {pieces.map((p, k) =>
            p.issue === undefined ? (
              <span key={k}>{p.t}</span>
            ) : (
              <button key={k} type="button" onClick={() => setActive(p.issue!)} className={cn("rounded px-0.5 underline decoration-wavy decoration-2 underline-offset-4", KIND_STYLE[a.issues[p.issue!]!.kind])}>
                {p.t}
              </button>
            ),
          )}
        </p>
        {active !== null && a.issues[active] ? (
          <div className="mt-3 animate-fade rounded-2xl bg-surface-muted p-4 text-sm">
            <p className="font-semibold">{KIND_LABEL[a.issues[active]!.kind]}: {a.issues[active]!.message}</p>
            {a.issues[active]!.suggestion ? <p className="mt-1">Sugerencia: <strong lang={locale}>{a.issues[active]!.suggestion}</strong></p> : null}
          </div>
        ) : a.issues.length ? (
          <p className="mt-3 text-sm text-muted">Toca las palabras marcadas para ver la sugerencia.</p>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-sm text-success-ink"><CheckCircle2 size={16} /> No detectamos errores de ortografía, acentos ni mayúsculas.</p>
        )}
      </Card>

      {ai ? (
        <Card className="animate-rise">
          <CardHeader title="Corrección del tutor" icon={<Sparkles size={18} className="text-primary" />} />
          {ai.mistakes.length ? (
            <ul className="space-y-3">
              {ai.mistakes.map((m, k) => (
                <li key={k} className="rounded-2xl bg-surface-muted p-4">
                  <p lang={locale}><span className="text-danger-ink line-through">{m.original}</span> → <strong className="text-success-ink">{m.correction}</strong></p>
                  <p className="mt-1 text-sm text-muted">{m.explanation}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-success-ink">¡Sin errores importantes!</p>}
          <h3 className="mt-5 font-semibold">Versión mejorada</h3>
          <p className="mt-1 whitespace-pre-wrap rounded-2xl bg-success-soft p-4 leading-relaxed" lang={locale}>{ai.corrected}</p>
          {ai.strengths.length ? <><h3 className="mt-4 font-semibold">Lo que hiciste bien</h3><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{ai.strengths.map((s) => <li key={s}>{s}</li>)}</ul></> : null}
          {ai.suggestions.length ? <><h3 className="mt-4 font-semibold">Para sonar más natural</h3><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{ai.suggestions.map((s) => <li key={s}>{s}</li>)}</ul></> : null}
        </Card>
      ) : result.aiError ? (
        <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning-ink">{result.aiError} Mostramos la revisión automática.</p>
      ) : null}

      {result.newAchievements.length ? <div className="flex flex-wrap gap-2">{result.newAchievements.map((x) => <Chip key={x.id} tone="warning">{x.icon} {x.title}</Chip>)}</div> : null}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onRetry}><PenLine size={16} /> Corregir y volver a enviar</Button>
        <Button variant="secondary" onClick={() => window.location.reload()}><RotateCcw size={16} /> Otra consigna</Button>
      </div>
    </div>
  );
}
