import type { ReadingRule, RuleCheck } from "../phase-zero/types";

/** Regla de escritura: [texto, cómo se lee, significado] por ejemplo. */
export const R = (id: string, title: string, explain: string, examples: [string, string?, string?][], check: RuleCheck): ReadingRule => ({
  id,
  title,
  explain,
  examples: examples.map(([w, r, es]) => ({ w, ...(r ? { r } : {}), ...(es ? { es } : {}) })),
  check,
});
