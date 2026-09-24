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

export default async function GrammarPage() {
  const learner = await requireLearner();
  const now = new Date();
  const [knowledge, weaknesses] = await Promise.all([getAllKnowledge(learner.ul.id), getWeaknesses(learner.ul.id, now)]);
  const km = new Map(knowledge.map((k) => [k.itemId, k]));
  const weakCats = new Map(weaknesses.map((w) => [w.category, w.count]));
  const concepts = grammarFor(learner.language.code);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Gramática</h1>
        <p className="mt-1 text-muted">Concepto, uso, formación, errores típicos y contraste con estructuras parecidas. Los temas donde fallas aparecen marcados.</p>
      </header>
      {concepts.length === 0 ? (
        <Card><EmptyState title="Aún no hay gramática para este idioma">Estamos preparando el contenido revisado.</EmptyState></Card>
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
