import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { storiesFor } from "@/lib/content/stories";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Historias" };

export default async function StoriesPage() {
  const learner = await requireLearner();
  const stories = storiesFor(learner.language.code);
  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Historias para empezar</h1>
        <p className="mt-1 max-w-2xl text-muted">Historias cortas escritas para principiantes: frase a frase, con audio lento y la traducción cuando la necesites. Al final, unas preguntas para comprobar que lo entendiste.</p>
      </header>
      {stories.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">Todavía no hay historias para {learner.language.name.toLowerCase()}. Mientras tanto, prueba las lecturas adaptadas a tu nivel.</p>
          <ButtonLink href="/app/read" className="mt-4">Ir a lecturas</ButtonLink>
        </div>
      ) : (
        <ul className="stagger grid gap-3 sm:grid-cols-2">
          {stories.map((s) => (
            <li key={s.id} className="min-w-0">
              <Link href={`/app/stories/${s.id}`} className="card lift flex h-full gap-4 p-5 hover:border-primary">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-3xl" aria-hidden>{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted">{s.level} · {s.lines.length} frases</p>
                  <h2 className="font-display text-lg font-extrabold" lang={learner.language.code}>{s.title}</h2>
                  <p className="truncate text-sm text-muted" lang={learner.language.code}>{s.lines[0]!.t}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
