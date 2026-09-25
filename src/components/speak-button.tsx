"use client";
import { Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { speechRate } from "@/components/comfort";
import { cn } from "@/lib/cn";

/** Pronunciación con la síntesis de voz del navegador (gratis, sin servidor). */
export function useSpeech(locale: string) {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof window !== "undefined" && "speechSynthesis" in window), []);
  const speak = useCallback(
    (text: string, rate = 1) => {
      if (!supported) return false;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = locale;
      u.rate = speechRate(rate);
      const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(locale.toLowerCase().slice(0, 2)));
      if (voice) u.voice = voice;
      synth.speak(u);
      return true;
    },
    [locale, supported],
  );
  return { supported, speak };
}

/**
 * Botón de pronunciación. Si hay grabación real (Wikimedia Commons) la usa;
 * si falla o no existe, recurre a la síntesis de voz del navegador.
 */
export function SpeakButton({ text, locale, audioUrl, rate = 1, size = 40, className, label }: { text: string; locale: string; audioUrl?: string; rate?: number; size?: number; className?: string; label?: string }) {
  const { supported, speak } = useSpeech(locale);
  if (!supported && !audioUrl) return null;
  const play = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = speechRate(rate);
      audio.play().catch(() => speak(text, rate));
      return;
    }
    speak(text, rate);
  };
  return (
    <button
      type="button"
      onClick={play}
      aria-label={label ?? `Escuchar: ${text}`}
      title={audioUrl ? "Pronunciación grabada por una persona" : undefined}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition hover:brightness-95 active:scale-95", className)}
      style={{ width: size, height: size }}
    >
      <Volume2 size={Math.round(size * 0.45)} aria-hidden />
    </button>
  );
}
