import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Afi, type AfiMood, type AfiMotion } from "./afi";

/**
 * Afi dice algo: un bocadillo corto junto a Afi. Es la capa emocional del
 * motor adaptativo: traduce un dato («preposiciones: 4 de 6 errores») en
 * una frase tranquila. El texto se entiende sin ver a Afi (Afi es decorativo).
 *
 * `live`: se anuncia a los lectores de pantalla al aparecer (reacciones a
 * una respuesta); por defecto no, para no interrumpir.
 */
export function AfiMessage({
  children,
  mood = "happy",
  motion = "none",
  size = 56,
  live = false,
  className,
}: {
  children: ReactNode;
  mood?: AfiMood;
  motion?: AfiMotion;
  size?: number;
  live?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end gap-2.5", className)} {...(live ? { role: "status" } : {})}>
      <Afi mood={mood} motion={motion} size={size} />
      <div className="relative mb-2 min-w-0 flex-1 rounded-2xl rounded-bl-md border border-border/70 bg-surface px-4 py-2.5 text-sm leading-relaxed shadow-[var(--shadow)]">
        <span className="sr-only">Afi: </span>
        {children}
      </div>
    </div>
  );
}
