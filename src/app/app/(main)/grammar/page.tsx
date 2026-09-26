import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { grammarFor } from "@/lib/content";
import { mastery } from "@/lib/engine/progress";
import { getAllKnowledge } from "@/lib/db/repositories";
import { getWeaknesses, knowledgeToCard } from "@/lib/services/learning";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Gramática" };

const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;

export default async function GrammarPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const learner = await requireLearner();
  const sp = await searchParams;
  const level = LEVELS.find((l) => l === sp.level) ?? null;
  const now = new Date();
  const [knowledge, weaknesses] = await Promise.all([getAllKnowledge(learner.ul.id), getWeaknesses(learner.ul.id, now)]);
  const km = new Map(knowledge.map((k) => [k.itemId, k]));
  const weakCats = new Map(weaknesses.map((w) => [w.category, w.count]));
  const all = grammarFor(learner.language.code);
  const concepts = level ? all.filter((g) => g.cefr === level) : all;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Gramática</h1>
        <p className="mt-1 text-muted">Concepto, uso, formación, errores típicos y contraste con estructuras parecidas. Los temas donde fallas aparecen marcados.</p>
        <nav aria-label="Filtrar por nivel" className="mt-4 flex flex-wrap gap-1.5">
          {[null, ...LEVELS].map((l) => (
            <Link
              key={l ?? "all"}
              href={l ? `/app/grammar?level=${l}` : "/app/grammar"}
              aria-current={level === l ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-sm font-semibold transition ${level === l ? "bg-primary text-on-primary" : "bg-surface-muted text-muted hover:text-text"}`}
            >
              {l ?? "Todos"} {l ? <span className="font-normal">({all.filter((g) => g.cefr === l).length})</span> : null}
            </Link>
          ))}
        </nav>
      </header>
      {concepts.length === 0 ? (
        <Card><EmptyState title="Aún no hay gramática para este idioma" mood="studying">Estamos preparando el contenido revisado.</EmptyState></Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {concepts.map((g) => {
            const k = km.get(g.id);
            const m = k ? mastery(knowledgeToCard(k, now), now) : 0;
            const errors = weakCats.get(g.errorCategory);
            return (
              <li key={g.id}>
                <Link href={`/app/grammar/${encodeURIComponent(g.id)}`} className="card flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip>{g.cefr}</Chip>
                    {errors ? <Chip tone="danger">{errors} {errors === 1 ? "error reciente" : "errores recientes"}</Chip> : null}
                    {k && m >= 0.7 ? <Chip tone="success">Dominado</Chip> : null}
                  </div>
                  <h2 className="font-display text-lg font-extrabold">{g.title}</h2>
                  <p className="line-clamp-2 text-sm text-muted">{g.summary}</p>
                  <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted">
                    <ProgressBar value={m} color="var(--skill-grammar)" label={`Dominio de ${g.title}`} className="flex-1" />
                    <span>{k ? `${Math.round(m * 100)} %` : "Sin practicar"}</span>
                    <ArrowRight size={16} className="text-primary" aria-hidden />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
