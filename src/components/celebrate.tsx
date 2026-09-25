"use client";
import { useEffect, useState } from "react";

/**
 * Confeti ligero en CSS (sin librerías). Se desactiva solo con
 * prefers-reduced-motion (las animaciones globales se anulan en globals.css).
 */
const COLORS = ["var(--primary)", "var(--skill-grammar)", "var(--skill-listening)", "var(--skill-writing)", "var(--skill-speaking)", "var(--skill-reading)"];

export function Confetti({ pieces = 70, duration = 2600 }: { pieces?: number; duration?: number }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOn(false), duration + 400);
    return () => clearTimeout(t);
  }, [duration]);
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: pieces }, (_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 12) * 60;
        const size = 6 + (i % 4) * 2;
        const drift = ((i % 7) - 3) * 22;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              width: size,
              height: size * (i % 2 ? 1.6 : 1),
              background: COLORS[i % COLORS.length],
              animationDelay: `${delay}ms`,
              animationDuration: `${duration - delay}ms`,
              ["--drift" as string]: `${drift}px`,
              borderRadius: i % 3 === 0 ? "9999px" : "2px",
            }}
          />
        );
      })}
    </div>
  );
}

/** Número que cuenta hacia arriba al aparecer (sólo decorativo; el valor real está en el DOM desde el inicio). */
export function CountUp({ value, duration = 900, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || value <= 0) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setShown(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <span aria-label={`${value}${suffix}`}>
      <span aria-hidden>{shown.toLocaleString("es")}{suffix}</span>
    </span>
  );
}
