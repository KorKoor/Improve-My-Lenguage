import "server-only";
import { categoriesFor, getVocab, vocabFor } from "../content";
import { getPrompt, promptsFor, type WritingPrompt } from "../content/writing-prompts";
import type { CefrLevel, LanguageCode } from "../content/types";
import { aiAvailable, generate, parseJson } from "../ai/provider";
import { sanitizeWritingFeedback, writingSystemPrompt, type WritingFeedback } from "../ai/prompts";
import * as repo from "../db/repositories";
import { rateLimit } from "../db/limits";
import { cefrToTheta, thetaToCefr, updateSkillOnline } from "../engine/levels";
import { localDay } from "../engine/progress";
import { buildLookupIndex, type LookupIndex } from "../reading/text";
import { analyzeWriting, buildSpellIndex, type SpellIndex, type WritingAnalysis } from "../writing/analyze";
import { checkAchievements, getSkills, RateLimitedError } from "./learning";
import { buildLearnerContext, guardAi } from "./tutor";
import type { Learner } from "./viewer";

const indexes = new Map<LanguageCode, { idx: LookupIndex; spell: SpellIndex }>();
function tools(lang: LanguageCode) {
  let t = indexes.get(lang);
  if (!t) {
    const idx = buildLookupIndex(lang, vocabFor(lang));
    t = { idx, spell: buildSpellIndex(idx) };
    indexes.set(lang, t);
  }
  return t;
}

export async function writingHome(learner: Learner): Promise<{ prompts: WritingPrompt[]; level: CefrLevel; aiEnabled: boolean }> {
  const skills = await getSkills(learner.ul.id);
  const w = skills.get("writing")!;
  const base = w.evidence > 0 ? w.theta : skills.get("vocabulary")!.theta - 0.3;
  const level = thetaToCefr(base);
  return { prompts: promptsFor(level, learner.profile.interests), level, aiEnabled: aiAvailable() && learner.profile.aiConsent };
}

export interface WritingResult {
  analysis: WritingAnalysis;
  ai: WritingFeedback | null;
  aiError: string | null;
  newAchievements: { id: string; title: string; icon: string }[];
}

export async function submitWriting(learner: Learner, promptId: string, text: string, useAi: boolean): Promise<WritingResult> {
  if (!(await rateLimit(`write:${learner.userId}`, 20, 3600))) throw new RateLimitedError();
  const prompt = getPrompt(promptId);
  const lang = learner.language.code;
  const { idx, spell } = tools(lang);
  const analysis = analyzeWriting({ language: lang, text, idx, spell, vocabById: getVocab, spaceSeparated: learner.language.spaceSeparated });

  // Corrección con IA (opcional, con consentimiento y cuota).
  let ai: WritingFeedback | null = null;
  let aiError: string | null = null;
  if (useAi && aiAvailable() && learner.profile.aiConsent) {
    try {
      await guardAi(learner);
      const ctx = await buildLearnerContext(learner);
      const categories = categoriesFor(lang).map((c) => ({ id: c.id, label: c.label }));
      const raw = await generate({
        tier: "smart",
        json: true,
        temperature: 0.2,
        maxTokens: 1400,
        system: writingSystemPrompt(ctx, prompt?.task ?? "Free writing", categories),
        messages: [{ role: "user", content: text }],
      });
      ai = sanitizeWritingFeedback(parseJson(raw), new Set(categories.map((c) => c.id)), text);
      if (!ai) aiError = "La corrección automática no se pudo validar esta vez.";
    } catch (err) {
      aiError = err instanceof Error && err.message ? err.message : "La corrección con IA no está disponible ahora.";
    }
  }

  // Modelo del alumno: θ de escritura según el nivel mostrado y la precisión.
  const shownTheta = ai?.level ? cefrToTheta(ai.level) : analysis.theta;
  const accuracy = ai ? Math.max(0, 1 - ai.mistakes.length / Math.max(4, analysis.sentences * 2)) : analysis.score / 100;
  const skills = await getSkills(learner.ul.id);
  let est = skills.get("writing")!;
  // Un texto largo aporta más evidencia que uno corto.
  const reps = Math.min(4, Math.max(1, Math.round(analysis.words / 40)));
  for (let i = 0; i < reps; i++) est = updateSkillOnline(est, shownTheta, accuracy >= 0.7);
  await repo.upsertSkillEstimates(learner.ul.id, [est]);

  const feedbackToStore = { analysis: { ...analysis, issues: analysis.issues.slice(0, 30) }, ai };
  await repo.saveWriting(learner.ul.id, { prompt: prompt?.title ?? "Escritura libre", text, feedback: feedbackToStore, score: Math.round(accuracy * 100) });
  const mistakes = [
    ...(ai?.mistakes ?? []).map((m) => ({ category: m.category, userText: m.original, correctedText: m.correction, explanation: m.explanation })),
    ...analysis.issues.filter((i) => i.kind === "spelling" || i.kind === "accent").slice(0, 6).map((i) => ({ category: "spelling", userText: text.slice(i.start, i.end), correctedText: i.suggestion ?? null, explanation: i.message })),
  ];
  if (mistakes.length) {
    await repo.insertMistakes(mistakes.map((m) => ({ userLanguageId: learner.ul.id, sessionId: null, attemptId: null, source: "writing" as const, category: m.category, subcategory: null, userText: m.userText, correctedText: m.correctedText, explanation: m.explanation })));
  }
  await repo.bumpActivity(learner.userId, lang, localDay(new Date(), learner.profile.timezone), { seconds: Math.min(1800, analysis.words * 12), exercises: 1, correct: accuracy >= 0.7 ? 1 : 0 });
  await repo.track(learner.userId, "writing_submitted", { words: analysis.words, ai: Boolean(ai), level: ai?.level ?? analysis.level });
  const newAchievements = await checkAchievements(learner);
  return { analysis, ai, aiError, newAchievements };
}

export async function writingHistory(learner: Learner) {
  const rows = await repo.listWritings(learner.ul.id, 8);
  return rows.map((r) => ({ id: r.id, prompt: r.prompt, excerpt: r.text.slice(0, 140), score: r.score, createdAt: r.createdAt.toISOString() }));
}
