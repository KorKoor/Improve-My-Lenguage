"use client";
import { Trophy } from "lucide-react";
import type { GameId } from "@/lib/engine/games";
import { useBest } from "./shell";

/** Récord guardado en este dispositivo (nada si aún no has jugado). */
export function BestBadge({ game, lang }: { game: GameId; lang: string }) {
  const { best } = useBest(game, lang);
  if (!best) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-warning-ink">
      <Trophy size={12} aria-hidden /> Récord {best}
    </span>
  );
}
