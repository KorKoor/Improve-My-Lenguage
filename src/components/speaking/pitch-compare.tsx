"use client";
import { Loader2, Mic, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { audioUrlFor } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { classifyTone, describeContour, normalizeContour, pitchTrack, TONE_SHAPES, type Tone } from "@/lib/pitch";

const SR = 16000;
const TONE_NAME: Record<Tone, string> = { 1: "1.º tono (alto y plano)", 2: "2.º tono (sube)", 3: "3.º tono (baja y sube)", 4: "4.º tono (cae)" };

/** Audio → mono a 16 kHz (media de canales y remuestreo lineal). */
async function toMono16k(buf: ArrayBuffer): Promise<Float32Array> {
  const ctx = new AudioContext();
  try {
    const audio = await ctx.decodeAudioData(buf);
    const ch = Array.from({ length: audio.numberOfChannels }, (_, i) => audio.getChannelData(i));
    const ratio = audio.sampleRate / SR;
    const out = new Float32Array(Math.floor(audio.length / ratio));
    for (let i = 0; i < out.length; i++) {
      const pos = i * ratio;
      const j = Math.floor(pos);
      let v = 0;
      for (const c of ch) v += c[j]! + ((c[j + 1] ?? c[j]!) - c[j]!) * (pos - j);
      out[i] = v / ch.length;
    }
    return out;
  } finally {
    void ctx.close();
  }
}

async function contourOf(buf: ArrayBuffer): Promise<number[] | null> {
  return normalizeContour(pitchTrack(await toMono16k(buf), SR));
}

function Curve({ points, className, dashed = false }: { points: number[]; className: string; dashed?: boolean }) {
  // Semitonos (−8…+8) → alto del gráfico; o formas de referencia (0…1).
  const isShape = points.every((p) => p >= 0 && p <= 1) && points.length <= 6;
  const y = (v: number) => (isShape ? 90 - v * 80 : 50 - Math.max(-8, Math.min(8, v)) * 5);
  const d = points.map((v, i) => `${i ? "L" : "M"}${(10 + (i / (points.length - 1)) * 280).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return <path d={d} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? "8 7" : undefined} className={className} />;
}

/**
 * Tu entonación frente a la del modelo. Graba (la grabación no sale del
 * dispositivo), calcula la curva de tono de las dos voces y las dibuja; en
 * chino dice además qué tono se parece más a lo que dijiste.
 */
export function PitchCompare({ text, lang, tone, className }: { text: string; lang: string; tone?: Tone; className?: string }) {
  const [state, setState] = useState<"idle" | "recording" | "analyzing" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [mine, setMine] = useState<number[] | null>(null);
  const [model, setModel] = useState<number[] | null>(null);
  const [myUrl, setMyUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  // Se decide en el cliente (en el servidor no hay micrófono): evita desajustes de hidratación.
  const [supported, setSupported] = useState(true);
  useEffect(() => setSupported("MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia), []);

  // Curva del modelo (grabación humana o voz libre), si hay archivo.
  useEffect(() => {
    let alive = true;
    setModel(null);
    setMine(null);
    setState("idle");
    void (async () => {
      const url = await audioUrlFor(lang, text);
      if (!url) return;
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const c = await contourOf(await res.arrayBuffer());
        if (alive) setModel(c);
      } catch {
        /* sin curva del modelo: queda la forma de referencia */
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang, text]);

  useEffect(() => () => { if (myUrl) URL.revokeObjectURL(myUrl); }, [myUrl]);

  async function start() {
    setErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("analyzing");
        const blob = new Blob(chunks, { type: r.mimeType });
        setMyUrl(URL.createObjectURL(blob));
        try {
          const c = await contourOf(await blob.arrayBuffer());
          if (!c) {
            setErr("No se oyó bien la voz. Acércate al micrófono y habla un poco más alto.");
            setState("error");
          } else {
            setMine(c);
            setState("done");
          }
        } catch {
          setErr("No pudimos analizar la grabación en este navegador.");
          setState("error");
        }
      };
      rec.current = r;
      r.start();
      setState("recording");
      // Tope de 6 segundos: es para una palabra o una frase corta.
      setTimeout(() => r.state === "recording" && r.stop(), 6000);
    } catch {
      setErr("Necesitamos permiso para usar el micrófono.");
      setState("error");
    }
  }

  const said = mine && tone ? classifyTone(mine) : null;
  const summary = [
    model ? `Curva del modelo: ${describeContour(model)}.` : tone ? `Este es el ${TONE_NAME[tone]}.` : null,
    mine ? `Tu curva: ${describeContour(mine)}.` : null,
    said && tone ? (said === tone ? "Tono correcto." : `Sonó más como el ${TONE_NAME[said]}; aquí va el ${TONE_NAME[tone]}.`) : null,
  ].filter(Boolean).join(" ");

  if (!supported) return <p className={cn("text-sm text-muted", className)}>Tu navegador no permite grabar audio aquí.</p>;

  return (
    <div className={cn("rounded-2xl bg-surface-muted p-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {state === "recording" ? (
          <Button size="sm" variant="danger" onClick={() => rec.current?.stop()}><Square size={14} aria-hidden /> Parar</Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => void start()} disabled={state === "analyzing"}>
            {state === "analyzing" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Mic size={14} aria-hidden />} {mine ? "Grabar otra vez" : "Grabar y comparar"}
          </Button>
        )}
        {myUrl && state !== "recording" && (
          <Button size="sm" variant="ghost" onClick={() => void new Audio(myUrl).play()}><Play size={14} aria-hidden /> Oírme</Button>
        )}
        <span className="text-xs text-muted">Tu grabación no sale de tu dispositivo.</span>
      </div>
      {(model || mine || tone) && (
        <figure className="mt-3">
          <svg viewBox="0 0 300 100" className="h-28 w-full" role="img" aria-label={summary || "Curva de entonación"}>
            <line x1="10" y1="50" x2="290" y2="50" stroke="var(--border)" strokeDasharray="3 4" />
            {model ? <Curve points={model} className="stroke-[var(--skill-vocabulary)] opacity-80" dashed /> : tone ? <Curve points={TONE_SHAPES[tone]} className="stroke-[var(--skill-vocabulary)] opacity-80" dashed /> : null}
            {mine && <Curve points={mine} className="stroke-[var(--primary)]" />}
          </svg>
          <figcaption className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted">
            <span><span className="mr-1 inline-block h-0.5 w-5 border-t-2 border-dashed border-[var(--skill-vocabulary)] align-middle" aria-hidden />{model ? "Modelo" : "Forma del tono"}</span>
            {mine && <span><span className="mr-1 inline-block h-1 w-5 rounded bg-primary align-middle" aria-hidden />Tu voz</span>}
          </figcaption>
        </figure>
      )}
      <p className="mt-2 min-h-5 text-sm" role="status">
        {err ? <span className="text-danger-ink">{err}</span> : state === "recording" ? "Te escucho… di la palabra y pulsa «Parar»." : summary}
      </p>
    </div>
  );
}
