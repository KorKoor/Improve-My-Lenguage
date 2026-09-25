"use client";
import { useEffect } from "react";
import type { TextSize } from "@/lib/db/types";

/**
 * Comodidad (accesibilidad): tamaño de letra y audio lento para toda la app.
 * Se guarda en el perfil y se refleja en una cookie para aplicarse antes del
 * primer pintado (sin parpadeo), igual que el tema.
 *   <html data-text="large" data-slow-audio="1">
 * Todo el diseño usa rem, así que cambiar el tamaño base escala la interfaz.
 */
const COOKIE = "comfort";

export const comfortScript = `(function(){try{var m=document.cookie.match(/(?:^|; )comfort=(normal|large|xl)\.(0|1)/);if(!m)return;var h=document.documentElement;h.dataset.text=m[1];h.dataset.slowAudio=m[2];}catch(e){}})();`;

export function applyComfort(textSize: TextSize, slowAudio: boolean) {
  const h = document.documentElement;
  h.dataset.text = textSize;
  h.dataset.slowAudio = slowAudio ? "1" : "0";
  document.cookie = `${COOKIE}=${textSize}.${slowAudio ? 1 : 0}; path=/; max-age=31536000; samesite=lax`;
}

/** Sincroniza las preferencias guardadas en el perfil con el documento. */
export function ComfortSync({ textSize, slowAudio }: { textSize: TextSize; slowAudio: boolean }) {
  useEffect(() => applyComfort(textSize, slowAudio), [textSize, slowAudio]);
  return null;
}

/** Velocidad de voz efectiva: 0,8× si el usuario pidió audio lento. */
export function speechRate(requested = 1): number {
  if (typeof document === "undefined") return requested;
  return document.documentElement.dataset.slowAudio === "1" ? Math.max(0.5, requested * 0.8) : requested;
}
