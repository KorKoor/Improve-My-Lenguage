import type { Metadata } from "next";
import Link from "next/link";
import { LiveAfi } from "@/components/afi/live-afi";
import { BestBadge } from "@/components/games/best-badge";
import { GAMES } from "@/lib/engine/games";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Minijuegos" };

/** Minijuegos: práctica corta y divertida con tus propias palabras y frases reales. */
export default async function GamesPage() {
  const learner = await requireLearner();
  const name = learner.language.name.toLowerCase();
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4 animate-rise">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-extrabold">Minijuegos</h1>
          <p className="mt-1 max-w-2xl text-muted">Partidas de 1 a 3 minutos para practicar {name} jugando, con las palabras que ya has visto y frases reales.</p>
        </div>
        <LiveAfi size={84} mood="excited" className="mt-10 hidden sm:inline-flex" />
      </header>
      <ul className="stagger grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <li key={g.id}>
            <Link href={`/app/games/${g.id}`} className="card lift group flex h-full gap-4 p-5 hover:border-primary">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-4xl transition-transform group-hover:scale-110 group-hover:-rotate-6" aria-hidden>{g.emoji}</span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg font-extrabold">{g.title}</span>
                  <BestBadge game={g.id} lang={learner.language.code} />
                </span>
                <span className="text-sm text-muted">{g.text}</span>
                <span className="mt-auto flex gap-2 pt-1 text-xs font-semibold text-muted">
                  <span className="rounded-full bg-surface-muted px-2 py-0.5">{g.skill}</span>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5">{g.minutes}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">Los récords se guardan en este dispositivo. Los juegos son para practicar a tu aire: tu nivel y tus repasos se calculan con las sesiones.</p>
    </div>
  );
}
