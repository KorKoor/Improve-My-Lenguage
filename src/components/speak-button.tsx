"use client";
import { AlertTriangle, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { speechRate } from "@/components/comfort";
import { cn } from "@/lib/cn";
import { detectPlatform, installVoiceHelp, pickVoice } from "@/lib/voice";
import { audioKey } from "@/lib/audio-key";

export type VoiceStatus = "loading" | "ok" | "missing" | "unsupported";

// ── Audio pregenerado (public/audio/<idioma>/index.json) ──────────────────
/** files: texto → mp3 de voz libre; human: texto → grabación humana (Commons). */
type Pack = { files: Record<string, string>; human: Record<string, string>; synth: boolean };
const packs = new Map<string, Promise<Pack | null>>();
/** Manifiesto del idioma, una sola descarga por idioma y visita. */
function loadPack(lang: string): Promise<Pack | null> {
  let p = packs.get(lang);
  if (!p) {
    p = fetch(`/audio/${lang}/index.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { files?: Record<string, string>; human?: Record<string, string> } | null) =>
        m ? { files: m.files ?? {}, human: m.human ?? {}, synth: Object.keys(m.files ?? {}).length > 0 } : null,
      )
      .catch(() => null);
    packs.set(lang, p);
  }
  return p;
}

// Un solo sonido a la vez en toda la app: uno nuevo corta el anterior.
let current: HTMLAudioElement | null = null;
let seqToken = 0;
function stopAll() {
  seqToken++;
  current?.pause();
  current = null;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/**
 * Pronunciación, en este orden:
 *   1. grabación humana (Wikimedia Commons / Lingua Libre), si se pasa;
 *   2. audio pregenerado con una voz libre (scripts/audio), si existe para ese texto;
 *   3. la voz del navegador (la mejor del idioma: «Natural», Google, «Premium»…).
 * Así suena igual en cualquier dispositivo, tenga o no voces instaladas.
 */
export function useSpeech(locale: string) {
  const lang = locale.slice(0, 2).toLowerCase();
  const pack = useRef<Pack | null>(null);
  const [hasPack, setHasPack] = useState(false);
  useEffect(() => {
    let alive = true;
    void loadPack(lang).then((p) => {
      if (!alive) return;
      pack.current = p;
      // Sólo cuenta como «siempre suena» si hay voz libre para todo el contenido básico.
      setHasPack(Boolean(p?.synth));
    });
    return () => {
      alive = false;
    };
  }, [lang]);
  const [supported, setSupported] = useState(false);
  // En un ref: que carguen las voces no debe cambiar `speak` (re-dispararía la reproducción automática).
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  const [status, setStatus] = useState<VoiceStatus>("loading");

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("unsupported");
      return;
    }
    setSupported(true);
    const synth = window.speechSynthesis;
    const load = () => {
      const vs = synth.getVoices();
      voices.current = vs;
      if (vs.length) setStatus(pickVoice(vs, locale) ? "ok" : "missing");
    };
    load();
    synth.addEventListener?.("voiceschanged", load);
    // Algunos navegadores nunca disparan el evento si no hay voces.
    const t = setTimeout(() => setStatus((s) => (s === "loading" ? (synth.getVoices().length ? s : "missing") : s)), 2500);
    return () => {
      synth.removeEventListener?.("voiceschanged", load);
      clearTimeout(t);
    };
  }, [locale]);

  /** Reproduce un texto; `done` se llama al terminar (para las secuencias). */
  const play = useCallback(
    (text: string, rate: number, audioUrl: string | undefined, done?: () => void): boolean => {
      const key = audioKey(text);
      const file = pack.current?.files[key];
      const human = audioUrl ?? pack.current?.human[key];
      const url = human ?? (file ? `/audio/${lang}/${file}` : undefined);
      if (url) {
        const audio = new Audio(url);
        // La velocidad lenta no cambia el tono (preservesPitch está activo por defecto).
        audio.playbackRate = speechRate(rate);
        current = audio;
        audio.onended = () => done?.();
        // Si falla la grabación humana, el audio pregenerado; si falla éste, la voz del navegador.
        audio.play().catch(() => (human && file ? playFile(file) : speakSynth(text, rate, done)));
        return true;
      }
      return speakSynth(text, rate, done);
      function playFile(f: string) {
        const a = new Audio(`/audio/${lang}/${f}`);
        a.playbackRate = speechRate(rate);
        current = a;
        a.onended = () => done?.();
        a.play().catch(() => speakSynth(text, rate, done));
      }
      function speakSynth(t: string, r: number, end?: () => void) {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(t);
        u.lang = locale;
        u.rate = speechRate(r);
        const voice = pickVoice(voices.current.length ? voices.current : synth.getVoices(), locale);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        }
        u.onend = () => end?.();
        synth.speak(u);
        return true;
      }
    },
    [lang, locale],
  );

  const speak = useCallback(
    (text: string, rate = 1, audioUrl?: string) => {
      stopAll();
      return play(text, rate, audioUrl);
    },
    [play],
  );

  /** Varios textos seguidos (deletreo: «cé, ache, a, té»), con una pausa corta entre ellos. */
  const speakSeq = useCallback(
    (texts: string[], rate = 1) => {
      stopAll();
      const token = seqToken;
      const next = (i: number) => {
        if (token !== seqToken || i >= texts.length) return;
        play(texts[i]!, rate, undefined, () => setTimeout(() => next(i + 1), 350));
      };
      next(0);
      return texts.length > 0;
    },
    [play],
  );
  return { supported: supported || hasPack, speak, speakSeq, status, hasPack };
}

/**
 * Aviso cuando el dispositivo no tiene voz para el idioma: el navegador lee
 * entonces con una voz de otro idioma (o no lee) y no se entiende nada.
 */
export function VoiceWarning({ locale, languageName }: { locale: string; languageName: string }) {
  const { status, hasPack } = useSpeech(locale);
  const [hidden, setHidden] = useState(false);
  const [platform, setPlatform] = useState<ReturnType<typeof detectPlatform>>("other");
  useEffect(() => {
    setPlatform(detectPlatform(navigator.userAgent));
    try {
      setHidden(sessionStorage.getItem(`iml:voice-warn:${locale}`) === "1");
    } catch {}
  }, [locale]);
  // Con audio pregenerado, lo importante ya suena bien aunque falte la voz del dispositivo.
  if (hidden || hasPack || (status !== "missing" && status !== "unsupported")) return null;
  return (
    <div role="status" className="mt-3 flex gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-3 text-sm">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden />
      <div className="flex-1">
        <p className="font-semibold">{status === "unsupported" ? "Tu navegador no puede leer en voz alta" : `Tu dispositivo no tiene voz en ${languageName.toLowerCase()}`}</p>
        <p className="text-muted">
          {status === "unsupported" ? "Prueba con Chrome, Edge o Safari. " : "Por eso el audio puede sonar raro o no oírse. "}
          {installVoiceHelp(platform, languageName)}
        </p>
      </div>
      <button
        type="button"
        aria-label="Cerrar aviso"
        className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-surface"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem(`iml:voice-warn:${locale}`, "1");
          } catch {}
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * Botón de pronunciación. Si hay grabación real (Wikimedia Commons) la usa;
 * si falla o no existe, recurre a la síntesis de voz del navegador.
 */
export function SpeakButton({ text, locale, audioUrl, rate = 1, size = 40, className, label }: { text: string; locale: string; audioUrl?: string; rate?: number; size?: number; className?: string; label?: string }) {
  const { supported, speak } = useSpeech(locale);
  if (!supported && !audioUrl) return null;
  return (
    <button
      type="button"
      onClick={() => speak(text, rate, audioUrl)}
      aria-label={label ?? `Escuchar: ${text}`}
      title={audioUrl ? "Pronunciación grabada por una persona" : undefined}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition hover:brightness-95 active:scale-95", className)}
      style={{ width: size, height: size }}
    >
      <Volume2 size={Math.round(size * 0.45)} aria-hidden />
    </button>
  );
}
