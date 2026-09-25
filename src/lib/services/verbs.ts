import "server-only";
import { getVocab, vocabFor } from "../content";
import { pronouns, tenseLabel, tensesForLevel, TENSE_DIFFICULTY, TENSE_ORDER, withPronoun } from "../content/conjugation";
import type { CefrLevel, TenseKey, VocabItem } from "../content/types";
import * as repo from "../db/repositories";
import { rateLimit } from "../db/limits";
import { itemTheta, thetaToCefr, updateSkillOnline } from "../engine/levels";
import { localDay } from "../engine/progress";
import { hashString, mulberry32 } from "../engine/random";
import { buildVerbDrill, gradeConjugation } from "../engine/verbs";
import { knownRankForTheta } from "../reading/text";
import { checkAchievements, getSkills, RateLimitedError } from "./learning";
import type { Learner } from "./viewer";

export interface VerbSummary {
  id: string;
  lemma: string;
  translation: string;
  cefr: CefrLevel;
}

export interface VerbQuestion {
  key: string;
  lemma: string;
  translation: string;
  tense: TenseKey;
  tenseLabel: string;
  person: number;
  pronoun: string;
}

function verbsWithTables(learner: Learner): VocabItem[] {
  return vocabFor(learner.language.code).filter((v) => v.pos === "verb" && v.conjugation && Object.keys(v.conjugation).length > 0);
}

export async function verbsHome(learner: Learner): Promise<{ level: CefrLevel; verbs: VerbSummary[]; supported: boolean }> {
  const skills = await getSkills(learner.ul.id);
  const level = thetaToCefr(skills.get("grammar")!.theta);
  const all = verbsWithTables(learner);
  return {
    level,
    supported: all.length > 0,
    verbs: all.slice(0, 60).map((v) => ({ id: v.id, lemma: v.lemma, translation: v.translations.es?.[0] ?? "", cefr: v.cefr })),
  };
}

export async function startVerbDrill(learner: Learner, verbId: string | null): Promise<{ questions: VerbQuestion[]; locale: string }> {
  const skills = await getSkills(learner.ul.id);
  const level = thetaToCefr(skills.get("grammar")!.theta);
  let verbs: VocabItem[];
  if (verbId) {
    const v = getVocab(verbId);
    if (!v || v.language !== learner.language.code || !v.conjugation) throw new Error("Verbo sin tabla de conjugación");
    verbs = [v];
  } else {
    // Verbos que ya deberías conocer (por frecuencia), empezando por los más útiles.
    const known = knownRankForTheta(skills.get("vocabulary")!.theta);
    const all = verbsWithTables(learner);
    verbs = all.filter((v) => (v.rank ?? 99999) <= Math.max(300, known * 1.2)).slice(0, 40);
    if (verbs.length < 4) verbs = all.slice(0, 12);
  }
  const tenses = verbId ? TENSE_ORDER : tensesForLevel(level);
  const rand = mulberry32(hashString(`${learner.userId}|verbs|${verbId ?? "mix"}|${Date.now() >> 14}`));
  const items = buildVerbDrill({ verbs, tenses, count: 12, rand });
  return {
    locale: learner.language.speechLocale,
    questions: items.map((it) => {
      const v = getVocab(it.verbId)!;
      return {
        key: it.key,
        lemma: it.lemma,
        translation: v.translations.es?.[0] ?? "",
        tense: it.tense,
        tenseLabel: tenseLabel(learner.language.code, it.tense),
        person: it.person,
        pronoun: pronouns(learner.language.code)[it.person]!,
      };
    }),
  };
}

export interface VerbFeedback {
  correct: boolean;
  nearMiss: boolean;
  expected: string;
  full: string;
  /** Fila completa para repasar el patrón. */
  row: { pronoun: string; form: string | null }[];
}

export async function answerVerb(learner: Learner, key: string, answer: string, timeMs: number): Promise<VerbFeedback> {
  if (!(await rateLimit(`verbs:${learner.userId}`, 120, 60))) throw new RateLimitedError();
  const [tag, verbId, tense, personRaw] = key.split("|");
  const person = Number(personRaw);
  const v = verbId ? getVocab(verbId) : undefined;
  if (tag !== "conj" || !v || v.language !== learner.language.code || !Number.isInteger(person)) throw new Error("Ejercicio desconocido");
  const row = v.conjugation?.[tense as TenseKey];
  const expected = row?.[person];
  if (!row || !expected) throw new Error("Forma desconocida");
  const g = gradeConjugation(learner.language.code, expected, person, answer.slice(0, 120));
  const lang = learner.language.code;

  const difficulty = itemTheta(v) + TENSE_DIFFICULTY[tense as TenseKey];
  const skills = await getSkills(learner.ul.id);
  await repo.upsertSkillEstimates(learner.ul.id, [updateSkillOnline(skills.get("grammar")!, difficulty, g.correct)]);
  const attemptId = await repo.insertAttempt({
    userLanguageId: learner.ul.id,
    sessionId: null,
    exerciseKey: key,
    exerciseType: "conjugation",
    skill: "grammar",
    errorCategory: "conjugation",
    correct: g.correct,
    nearMiss: g.nearMiss,
    response: answer.slice(0, 120),
    timeMs: Math.max(0, Math.min(timeMs, 600_000)),
    attempts: 1,
    confidence: null,
    difficulty,
  });
  if (!g.correct) {
    await repo.insertMistakes([{ userLanguageId: learner.ul.id, sessionId: null, attemptId, source: "exercise", category: "conjugation", subcategory: tense ?? null, userText: answer.slice(0, 120) || null, correctedText: expected, explanation: `${v.lemma} · ${tenseLabel(lang, tense as TenseKey)}` }]);
  }
  await repo.bumpActivity(learner.userId, lang, localDay(new Date(), learner.profile.timezone), { seconds: Math.min(Math.round(timeMs / 1000), 60), exercises: 1, correct: g.correct ? 1 : 0 });
  const ps = pronouns(lang);
  return {
    ...g,
    full: withPronoun(lang, person, expected),
    row: row.map((form, i) => ({ pronoun: ps[i]!, form })),
  };
}

export async function finishVerbDrill(learner: Learner, correct: number, total: number) {
  await repo.track(learner.userId, "verbs_completed", { correct, total });
  return { newAchievements: await checkAchievements(learner) };
}
