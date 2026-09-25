"use client";
import { AlertTriangle, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { speechRate } from "@/components/comfort";
import { cn } from "@/lib/cn";
import { detectPlatform, installVoiceHelp, pickVoice } from "@/lib/voice";

export type VoiceStatus = "loading" | "ok" | "missing" | "unsupported";

/**
 * Pronunciación con la síntesis de voz del navegador (gratis, sin servidor).
 * Elige la mejor voz del idioma («Natural», Google, «Premium»…) y, si se
 * pasa una grabación humana (Wikimedia Commons), la prefiere.
 */
export function useSpeech(locale: string) {
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

  const speak = useCallback(
    (text: string, rate = 1, audioUrl?: string) => {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.playbackRate = speechRate(rate);
        audio.play().catch(() => speakSynth(text, rate));
        return true;
      }
      return speakSynth(text, rate);
      function speakSynth(t: string, r: number) {
        if (!supported) return false;
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(t);
        u.lang = locale;
        u.rate = speechRate(r);
        const voice = pickVoice(voices.current.length ? voices.current : synth.getVoices(), locale);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        }
        synth.speak(u);
        return true;
      }
    },
    [locale, supported],
  );
  return { supported, speak, status };
}

/**
 * Aviso cuando el dispositivo no tiene voz para el idioma: el navegador lee
 * entonces con una voz de otro idioma (o no lee) y no se entiende nada.
 */
export function VoiceWarning({ locale, languageName }: { locale: string; languageName: string }) {
  const { status } = useSpeech(locale);
  const [hidden, setHidden] = useState(false);
  const [platform, setPlatform] = useState<ReturnType<typeof detectPlatform>>("other");
  useEffect(() => {
    setPlatform(detectPlatform(navigator.userAgent));
    try {
      setHidden(sessionStorage.getItem(`iml:voice-warn:${locale}`) === "1");
    } catch {}
  }, [locale]);
  if (hidden || (status !== "missing" && status !== "unsupported")) return null;
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
