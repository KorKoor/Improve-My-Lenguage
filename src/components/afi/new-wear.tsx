"use client";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Confetti } from "@/components/celebrate";
import type { AfiWear } from "@/lib/engine/afi-bond";
import { Afi } from "./afi";

const SEEN_KEY = "iml-afi-wear-seen";
const NEWS: Record<AfiWear, string> = {
  scarf: "¡Afi estrena bufanda! Es por tus 7 días seguidos.",
  glasses: "Afi se ha puesto gafas de lectora: ya sabes 100 palabras.",
  flower: "Una flor para Afi: 30 días seguidos. Esto ya es un hábito.",
  star: "Se encendió la tercera estrella de Afi: has llegado a B1.",
};

/** Cuando consigues un accesorio nuevo para Afi, te lo cuenta una vez (en este dispositivo). */
export function AfiNewWear({ wear }: { wear: AfiWear[] }) {
  const [fresh, setFresh] = useState<AfiWear | null>(null);
  useEffect(() => {
    try {
      const seen: AfiWear[] = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
      const next = wear.filter((w) => !seen.includes(w));
      if (next.length) {
        setFresh(next.at(-1)!);
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, ...next]));
      }
    } catch {
      /* sin almacenamiento: no se anuncia */
    }
  }, [wear]);
  if (!fresh) return null;
  return (
    <div className="card relative flex items-center gap-4 border-warning bg-warning-soft/60 p-4 animate-pop-in" role="status">
      <Confetti pieces={40} />
      <Afi size={64} mood="celebrating" motion="hop" wear={wear} />
      <p className="flex-1 font-semibold">
        {NEWS[fresh]} <Link href="/app/progress" className="whitespace-nowrap text-primary underline underline-offset-4">Ver su colección</Link>
      </p>
      <button type="button" onClick={() => setFresh(null)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface" aria-label="Cerrar">
        <X size={18} aria-hidden />
      </button>
    </div>
  );
}
