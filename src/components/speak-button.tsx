"use client";
import { Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
      u.rate = rate;
      const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(locale.toLowerCase().slice(0, 2)));
      if (voice) u.voice = voice;
      synth.speak(u);
      return true;
    },
    [locale, supported],
  );
  return { supported, speak };
}

export function SpeakButton({ text, locale, rate = 1, size = 40, className, label }: { text: string; locale: string; rate?: number; size?: number; className?: string; label?: string }) {
  const { supported, speak } = useSpeech(locale);
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => speak(text, rate)}
      aria-label={label ?? `Escuchar: ${text}`}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition hover:brightness-95 active:scale-95", className)}
      style={{ width: size, height: size }}
    >
      <Volume2 size={Math.round(size * 0.45)} aria-hidden />
    </button>
  );
}
