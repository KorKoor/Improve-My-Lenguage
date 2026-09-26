"use client";
import { ArrowRight, Check, Eraser, Loader2, Play, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { completeStrokesAction } from "@/app/app/phase-actions";
import { useSpeech } from "@/components/speak-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { checkTrace, strokeEnds, type StrokeChar } from "@/lib/content/strokes";
import { cn } from "@/lib/cn";

const COLORS = ["var(--primary)", "var(--success)", "var(--warning)", "var(--danger)"];

/** Animación del orden de trazos: cada trazo se dibuja en su dirección, uno tras otro. */
function StrokeAnimation({ ch, play }: { ch: StrokeChar; play: number }) {
  return (
    <svg viewBox="0 0 100 100" className="size-56 rounded-2xl bg-surface-muted" role="img" aria-label={`Orden de trazos de ${ch.ch}: ${ch.strokes.map((s, i) => `${i + 1}. ${s.desc}`).join(" ")}`}>
      <path d="M50 4 V96 M4 50 H96" stroke="var(--border)" strokeWidth={0.6} strokeDasharray="2 2" fill="none" />
      {ch.strokes.map((s, i) => <path key={`g${i}`} d={s.d} fill="none" stroke="var(--border)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />)}
      {ch.strokes.map((s, i) => {
        const { from } = strokeEnds(s.d);
        return (
          <g key={`${play}-${i}`}>
            <path d={s.d} pathLength={1} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" className="stroke-draw" style={{ animationDelay: `${i * 0.9}s` }} />
            <circle cx={from[0]} cy={from[1]} r={5.5} fill={COLORS[i % COLORS.length]} className="stroke-dot" style={{ animationDelay: `${i * 0.9}s` }} />
            <text x={from[0]} y={from[1] + 2.2} textAnchor="middle" fontSize="6.5" fontWeight="800" fill="white" className="stroke-dot" style={{ animationDelay: `${i * 0.9}s` }}>{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Calcar con el dedo (o el ratón): comprobación tolerante de inicio, final y
 * orden de cada trazo. Es práctica, no examen: no cuenta para la nota.
 */
function TraceCanvas({ ch, onOk }: { ch: StrokeChar; onOk: () => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const [strokes, setStrokes] = useState<[number, number][][]>([]);
  const drawing = useRef(false);
  const [verdict, setVerdict] = useState<number | null>(null);

  const point = (e: React.PointerEvent): [number, number] => {
    const r = svg.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
  };
  const reset = () => {
    setStrokes([]);
    setVerdict(null);
  };
  const check = () => {
    const v = checkTrace(ch.strokes, strokes);
    setVerdict(v);
    if (v === 0) onOk();
  };

  return (
    <div>
      <svg
        ref={svg}
        viewBox="0 0 100 100"
        className="size-56 touch-none rounded-2xl border-2 border-dashed border-border bg-surface"
        aria-hidden
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drawing.current = true;
          setVerdict(null);
          setStrokes((s) => [...s, [point(e)]]);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const p = point(e);
          setStrokes((s) => [...s.slice(0, -1), [...s[s.length - 1]!, p]]);
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
      >
        {ch.strokes.map((s, i) => <path key={`g${i}`} d={s.d} fill="none" stroke="var(--surface-muted)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />)}
        {ch.strokes.map((s, i) => {
          const { from } = strokeEnds(s.d);
          return <circle key={i} cx={from[0]} cy={from[1]} r={3} fill={COLORS[i % COLORS.length]} opacity={0.5} />;
        })}
        {strokes.map((s, i) => (
          <polyline key={i} points={s.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--text)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={check} disabled={!strokes.length}><Check size={16} aria-hidden /> Comprobar</Button>
        <Button size="sm" variant="secondary" onClick={reset}><Eraser size={16} aria-hidden /> Borrar</Button>
      </div>
      <p className="mt-2 min-h-5 text-sm" role="status">
        {verdict === 0 ? <span className="font-semibold text-success-ink">¡Muy bien! Orden y dirección correctos.</span>
          : verdict === -1 ? <span className="text-danger-ink">Tiene {ch.strokes.length} {ch.strokes.length === 1 ? "trazo" : "trazos"}; has hecho {strokes.length}. Borra y prueba otra vez.</span>
          : verdict ? <span className="text-danger-ink">Revisa el trazo {verdict}: empieza en el punto de su color y sigue el mismo sentido que en la animación.</span>
          : null}
      </p>
    </div>
  );
}

/** `practice`: práctica libre de caligrafía (no guarda el avance de la Fase 0). */
export function StrokesTrainer({ chars, locale, language, rtl, nextHref, practice = false }: { chars: StrokeChar[]; locale: string; language: string; rtl: boolean; nextHref: string; practice?: boolean }) {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(0);
  const [traced, setTraced] = useState<Set<number>>(new Set());
  const [state, setState] = useState<"learn" | "saving" | "done">("learn");
  const started = useRef(Date.now());
  const { speak } = useSpeech(locale);
  const ch = chars[i]!;
  const heading = useRef<HTMLHeadingElement>(null);

  const say = useCallback(() => speak(ch.ch, 0.8), [speak, ch.ch]);
  useEffect(() => {
    heading.current?.focus();
    say();
  }, [i, say]);

  const finish = async () => {
    if (practice) return setState("done");
    setState("saving");
    await completeStrokesAction(traced.size, chars.length, Math.round((Date.now() - started.current) / 1000));
    setState("done");
  };

  if (state !== "learn") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-rise" role="status">
        <h1 className="font-display text-3xl font-extrabold">¡Trazos practicados!</h1>
        <p className="max-w-md text-muted">Has visto el orden de {chars.length} signos{traced.size ? ` y calcado ${traced.size}` : ""}. Escribir a mano ayuda a recordar las letras.</p>
        {state === "saving" ? <Loader2 className="animate-spin text-primary" aria-label="Guardando" /> : <ButtonLink href={nextHref} size="lg">Seguir <ArrowRight size={18} aria-hidden /></ButtonLink>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProgressBar value={i / chars.length} label={`Signo ${i + 1} de ${chars.length}`} height={10} />
      <h1 ref={heading} tabIndex={-1} className="font-display text-2xl font-extrabold outline-none">
        <span lang={language} dir={rtl ? "rtl" : "ltr"}>{ch.ch}</span> · {ch.r} · {ch.strokes.length} {ch.strokes.length === 1 ? "trazo" : "trazos"}
      </h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <section aria-labelledby="demo-title">
          <h2 id="demo-title" className="mb-2 text-sm font-semibold text-muted">Mira el orden</h2>
          <StrokeAnimation ch={ch} play={play} />
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPlay((p) => p + 1)}><Play size={16} aria-hidden /> Otra vez</Button>
            <Button size="sm" variant="secondary" onClick={say}><Volume2 size={16} aria-hidden /> Escuchar</Button>
          </div>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
            {ch.strokes.map((s, k) => <li key={k}>{s.desc}</li>)}
          </ol>
        </section>
        <section aria-labelledby="trace-title">
          <h2 id="trace-title" className="mb-2 text-sm font-semibold text-muted">Cálcalo con el dedo (práctica libre)</h2>
          <TraceCanvas key={i} ch={ch} onOk={() => setTraced((t) => new Set(t).add(i))} />
        </section>
      </div>
      <div className="flex flex-wrap gap-3">
        {i + 1 < chars.length ? (
          <Button size="lg" onClick={() => setI(i + 1)}>Siguiente signo <ArrowRight size={18} aria-hidden /></Button>
        ) : (
          <Button size="lg" onClick={() => void finish()}>Terminar <Check size={18} aria-hidden /></Button>
        )}
        {i > 0 && <Button size="lg" variant="ghost" onClick={() => setI(i - 1)}>Anterior</Button>}
      </div>
      <p className={cn("text-xs text-muted")}>Calcar no cuenta para la nota: puedes pasar al siguiente signo cuando quieras.</p>
    </div>
  );
}
