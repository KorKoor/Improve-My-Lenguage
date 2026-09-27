"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AFI_WAKE, afiGaze, afiPoke, afiSleepAfter, type AfiReaction } from "@/lib/engine/afi-voice";
import { cn } from "@/lib/cn";
import type { AfiWear } from "@/lib/engine/afi-bond";
import { Afi, type AfiMood, type AfiMotion } from "./afi";

/**
 * Afi con vida: mira hacia el puntero, reacciona cuando lo tocas (con frases
 * propias de su personalidad, lib/engine/afi-voice.ts), se duerme si nadie le
 * hace caso y se despierta sobresaltado. En pantallas táctiles mira alrededor
 * de vez en cuando. Con «reducir movimiento» no se mueve: sólo cambia la cara.
 *
 * Es un botón (se puede tocar con teclado); lo que dice se anuncia con
 * aria-live, así que nada depende de verlo.
 */
export function LiveAfi({
  mood = "happy",
  size = 96,
  motion = "none",
  talk = true,
  sleepy = true,
  wear,
  className,
}: {
  /** Estado de base (al que vuelve después de cada reacción). */
  mood?: AfiMood;
  size?: number;
  motion?: AfiMotion;
  /** Mostrar lo que dice en un bocadillo al tocarlo. */
  talk?: boolean;
  /** Se duerme tras un rato sin actividad. */
  sleepy?: boolean;
  /** Accesorios ganados (ver lib/engine/afi-bond.ts). */
  wear?: AfiWear[];
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [reaction, setReaction] = useState<AfiReaction | null>(null);
  const [asleep, setAsleep] = useState(false);
  const [particles, setParticles] = useState<{ id: number; dx: number; icon: string }[]>([]);
  const [motionKey, setMotionKey] = useState(0);
  const taps = useRef({ n: 0, last: 0, seed: 0 });
  const lastActive = useRef(0);
  const calm = useRef(false);

  const setGaze = useCallback((x: number, y: number) => {
    // En el botón: las variables se heredan y sobreviven a que Afi se vuelva a montar.
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--afi-lx", String(x));
    el.style.setProperty("--afi-ly", String(y));
  }, []);

  // Seguir el puntero (ratón o lápiz) y, sin puntero, mirar alrededor de vez en cuando.
  useEffect(() => {
    calm.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lastActive.current = Date.now();
    taps.current.seed = Math.floor(Math.random() * 1000);
    if (calm.current) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      lastActive.current = Date.now();
      if (e.pointerType === "touch") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const g = afiGaze(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2), r.width);
        setGaze(g.x, g.y);
      });
    };
    const fine = window.matchMedia("(pointer: fine)").matches;
    let glance: ReturnType<typeof setTimeout>;
    const lookAround = () => {
      glance = setTimeout(() => {
        const idle = Date.now() - lastActive.current > 2500;
        if (!fine || idle) {
          const spots = [[-2.4, -0.6], [2.4, -0.8], [0, 1.6], [1.6, 1.2], [0, 0], [0, 0]] as const;
          const [x, y] = spots[Math.floor(Math.random() * spots.length)]!;
          setGaze(x, y);
        }
        lookAround();
      }, 3500 + Math.random() * 5000);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    lookAround();
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(glance);
    };
  }, [setGaze]);

  // Dormirse tras un rato sin actividad; cualquier gesto lo despierta.
  useEffect(() => {
    if (!sleepy) return;
    const wake = () => {
      lastActive.current = Date.now();
    };
    const id = setInterval(() => {
      if (document.hidden) return;
      const limit = afiSleepAfter(new Date().getHours()) * 1000;
      setAsleep((was) => was || Date.now() - lastActive.current > limit);
    }, 5000);
    window.addEventListener("keydown", wake);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("pointerdown", wake);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, [sleepy]);

  // Dormido, cualquier movimiento del ratón lo despierta (sobresaltado).
  useEffect(() => {
    if (!asleep) return;
    const onMove = () => react(AFI_WAKE);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asleep]);

  // La reacción dura un poco y Afi vuelve a su estado de base.
  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => setReaction(null), Math.min(7000, 2200 + reaction.text.length * 45));
    return () => clearTimeout(t);
  }, [reaction]);

  function react(r: AfiReaction) {
    setAsleep(false);
    lastActive.current = Date.now();
    setReaction(r);
    setMotionKey((k) => k + 1);
    if (!calm.current && r.motion !== "sway") {
      const icon = r.mood === "excited" ? "✨" : r.mood === "confused" ? "💫" : "💜";
      const id = Date.now();
      setParticles((p) => [...p.slice(-3), { id, dx: Math.round(Math.random() * 40 - 20), icon }]);
      setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 1200);
    }
  }

  const poke = () => {
    if (asleep) return react(AFI_WAKE);
    const now = Date.now();
    const t = taps.current;
    t.n = now - t.last < 1400 ? t.n + 1 : 1;
    t.last = now;
    t.seed += 1;
    react(afiPoke(t.n, t.seed, new Date().getHours()));
  };

  // El bocadillo nunca se sale de la pantalla: si no cabe centrado, se desplaza.
  const bubble = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  useLayoutEffect(() => {
    const el = bubble.current;
    if (!el) return setShift(0);
    el.style.setProperty("--shift", "0px");
    const r = el.getBoundingClientRect();
    const room = document.documentElement.clientWidth - 12;
    setShift(r.right > room ? room - r.right : r.left < 12 ? 12 - r.left : 0);
  }, [reaction]);

  const shown: AfiMood = asleep ? "sleepy" : reaction?.mood ?? mood;
  const shownMotion: AfiMotion = reaction ? reaction.motion : asleep ? "breathe" : motion;

  return (
    <span className={cn("relative inline-flex flex-col items-center", className)}>
      <button
        ref={ref}
        type="button"
        onClick={poke}
        className="afi-live relative rounded-full"
        aria-label={asleep ? "Despertar a Afi" : "Saludar a Afi"}
      >
        <Afi key={motionKey} mood={shown} size={size} motion={shownMotion} wear={wear} />
        {particles.map((p) => (
          <span key={p.id} className="afi-particle text-lg" style={{ "--dx": `${p.dx}px` } as React.CSSProperties} aria-hidden>
            {p.icon}
          </span>
        ))}
      </button>
      <span className="sr-only" aria-live="polite">{reaction ? `Afi: ${reaction.text}` : ""}</span>
      {talk && reaction && (
        <span
          ref={bubble}
          style={{ "--shift": `${shift}px` } as React.CSSProperties}
          className="afi-bubble absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-[min(15rem,calc(100vw-24px))] translate-x-[calc(-50%+var(--shift))] rounded-2xl rounded-bl-md border border-border/70 bg-surface px-3 py-2 text-left text-sm leading-snug text-text shadow-[var(--shadow)]"
          aria-hidden
        >
          {reaction.text}
        </span>
      )}
    </span>
  );
}
