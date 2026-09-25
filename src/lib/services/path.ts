import "server-only";
import { catalog, grammarFor } from "../content";
import * as repo from "../db/repositories";
import { buildPath, type PathLevel } from "../engine/path";
import { isLearned } from "../engine/progress";
import { getSkills, knowledgeToCard } from "./learning";
import type { Learner } from "./viewer";

export async function learnerPath(learner: Learner): Promise<PathLevel[]> {
  const now = new Date();
  const [knowledge, skills] = await Promise.all([repo.getAllKnowledge(learner.ul.id), getSkills(learner.ul.id)]);
  const kmap = new Map(
    knowledge.map((k) => {
      const card = knowledgeToCard(k, now);
      return [k.itemId, { learned: k.reps > 0 && isLearned(card, now), known: k.status === "known", stability: k.stability, reps: k.reps }] as const;
    }),
  );
  return buildPath({
    vocab: catalog.vocab(learner.language.code).map((v) => ({ id: v.id, cefr: v.cefr })),
    grammar: grammarFor(learner.language.code).map((g) => ({ id: g.id, cefr: g.cefr })),
    knowledge: kmap,
    skills: [...skills.values()].filter((s) => s.evidence > 0).map((s) => ({ skill: s.skill, theta: s.theta })),
  });
}
