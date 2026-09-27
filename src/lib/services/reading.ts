import "server-only";
import { getVocab, topicLabel, vocabFor } from "../content";
import { classicByTitle, classicsFor } from "../content/classics";
import type { LanguageCode, VocabItem } from "../content/types";
import * as repo from "../db/repositories";
import { translationOf } from "../engine/exercises";
import { thetaToCefr, updateSkillOnline } from "../engine/levels";
import { localDay } from "../engine/progress";
import { hashString, mulberry32, shuffle } from "../engine/random";
import {
  analyzeTokens,
  buildLookupIndex,
  buildQuiz,
  knownRankForTheta,
  splitSentences,
  tokenize,
  type LookupIndex,
  type QuizQuestion,
  type TextAnalysis,
  type Token,
} from "../reading/text";
import { fetchArticle, randomArticles, searchArticles, sourcesFor, SOURCE_LABEL, type WikiSource } from "../reading/wiki";
import { checkAchievements, getSkills } from "./learning";
import type { Learner } from "./viewer";

const indexes = new Map<LanguageCode, LookupIndex>();
function lookupFor(language: LanguageCode): LookupIndex {
  let idx = indexes.get(language);
  if (!idx) {
    idx = buildLookupIndex(language, vocabFor(language));
    indexes.set(language, idx);
  }
  return idx;
}

/** Palabras que el alumno ya ha trabajado (cuentan como conocidas aunque sean raras). */
async function knownIds(learner: Learner): Promise<Set<string>> {
  const k = await repo.getAllKnowledge(learner.ul.id);
  return new Set(k.filter((x) => x.status === "known" || x.reps >= 2).map((x) => x.itemId));
}

async function learnerRank(learner: Learner): Promise<number> {
  const skills = await getSkills(learner.ul.id);
  const v = skills.get("vocabulary")!;
  const r = skills.get("reading")!;
  // El vocabulario manda; la lectura ajusta un poco (inferencia por contexto).
  return knownRankForTheta(v.theta * 0.8 + r.theta * 0.2);
}

export interface ReadingCard {
  source: WikiSource;
  sourceLabel: string;
  title: string;
  extract: string;
  url: string;
  analysis: TextAnalysis;
}

/**
 * Recomendaciones: artículos reales puntuados por lo bien que encajan con tu
 * nivel (≈ 95 % de palabras conocidas) y tus intereses. Sin IA.
 */
export async function readingRecommendations(learner: Learner, query?: string): Promise<{ cards: ReadingCard[]; sources: WikiSource[] }> {
  const lang = learner.language.code;
  const sources = sourcesFor(lang);
  const rank = await learnerRank(learner);
  const known = await knownIds(learner);
  const rand = mulberry32(hashString(`${learner.userId}|${localDay(new Date(), learner.profile.timezone)}`));

  const requests: Promise<Awaited<ReturnType<typeof randomArticles>>>[] = [];
  const main: WikiSource = lang === "en" && rank < 2500 ? "simplewiki" : "wikipedia";
  if (query) {
    requests.push(searchArticles(main, lang, query, 14));
    if (sources.includes("wikinews")) requests.push(searchArticles("wikinews", lang, query, 6));
  } else {
    // Un tema de tus intereses (palabra del idioma de ese tema) + artículos variados.
    const interests = new Set(learner.profile.interests);
    const topical = vocabFor(lang).filter((v) => v.pos === "noun" && v.topics.some((t) => interests.has(t)) && (v.rank ?? 9e9) < rank * 1.5);
    const term = topical.length ? shuffle(topical.slice(0, 40), rand)[0]!.lemma : undefined;
    if (term) requests.push(searchArticles(main, lang, term, 8));
    requests.push(randomArticles(main, lang, 16));
    if (sources.includes("wikinews")) requests.push(randomArticles("wikinews", lang, 8));
    if (sources.includes("wikivoyage") && interests.has("travel")) requests.push(randomArticles("wikivoyage", lang, 6));
  }
  const results = (await Promise.all(requests)).flat();

  const idx = lookupFor(lang);
  const seen = new Set<string>();
  const cards: ReadingCard[] = [];
  for (const s of results) {
    const key = `${s.source}|${s.title}`;
    if (seen.has(key) || s.extract.length < 200) continue;
    seen.add(key);
    const tokens = tokenize(lang, s.extract, idx, learner.language.spaceSeparated);
    const analysis = analyzeTokens(tokens, getVocab, rank, known);
    if (analysis.words < 30) continue;
    cards.push({ source: s.source, sourceLabel: SOURCE_LABEL[s.source], title: s.title, extract: s.extract.slice(0, 280), url: s.url, analysis });
  }
  cards.sort((a, b) => b.analysis.suitability - a.analysis.suitability);
  return { cards: cards.slice(0, 18), sources };
}

export interface ReaderWord {
  lemma: string;
  reading?: string;
  ipa?: string;
  pos: string;
  translation: string[];
  cefr: string;
  audioUrl?: string;
  note?: string;
  known: boolean;
}

export interface ReaderData {
  title: string;
  source: WikiSource | "own" | "graded" | "classic";
  sourceLabel: string;
  url?: string;
  license?: string;
  licenseUrl?: string;
  paragraphs: Token[][];
  words: Record<string, ReaderWord>;
  analysis: TextAnalysis;
  quiz: QuizQuestion[];
  locale: string;
  rtl: boolean;
  /** Traducción humana de cada párrafo (lecturas graduadas), a mostrar bajo demanda. */
  translations?: (string | null)[];
}

async function buildReader(learner: Learner, meta: { title: string; source: WikiSource | "own" | "graded" | "classic"; sourceLabel?: string; url?: string; license?: string; licenseUrl?: string; translations?: (string | null)[] }, paragraphs: string[]): Promise<ReaderData> {
  const lang = learner.language.code;
  const idx = lookupFor(lang);
  const [rank, known] = await Promise.all([learnerRank(learner), knownIds(learner)]);
  const tokenized = paragraphs.map((p) => tokenize(lang, p, idx, learner.language.spaceSeparated));
  const all = tokenized.flat();
  const analysis = analyzeTokens(all, getVocab, rank, known);
  const words: Record<string, ReaderWord> = {};
  for (const t of all) {
    if (!t.id || words[t.id]) continue;
    const v = getVocab(t.id);
    if (!v) continue;
    words[t.id] = {
      lemma: v.lemma,
      reading: v.reading,
      ipa: v.ipa,
      pos: v.pos,
      translation: translationOf(v, learner.native).slice(0, 3),
      cefr: v.cefr,
      audioUrl: v.audioUrl,
      note: v.usageNote,
      known: known.has(v.id) || (v.rank ?? 99999) <= rank,
    };
  }
  const pool = vocabFor(lang);
  const quiz = buildQuiz({
    sentences: paragraphs.flatMap(splitSentences),
    newWordIds: analysis.newWords,
    vocabById: getVocab,
    pool,
    translate: (v: VocabItem) => translationOf(v, learner.native)[0]!,
    language: lang,
    spaceSeparated: learner.language.spaceSeparated,
    seed: `${meta.source}|${meta.title}|${learner.userId}`,
  });
  await repo.track(learner.userId, "article_opened", { source: meta.source, level: analysis.level });
  return {
    ...meta,
    translations: meta.translations,
    sourceLabel: meta.sourceLabel ?? (meta.source === "own" ? "Tu texto" : meta.source === "graded" ? "Frases reales de Tatoeba" : meta.source === "classic" ? "Wikisource" : SOURCE_LABEL[meta.source]),
    paragraphs: tokenized,
    words,
    analysis,
    quiz,
    locale: learner.language.speechLocale,
    rtl: learner.language.rtl,
  };
}

export async function readerForArticle(learner: Learner, source: WikiSource, title: string): Promise<ReaderData | null> {
  const article = await fetchArticle(source, learner.language.code, title);
  if (!article) return null;
  return buildReader(learner, { title: article.title, source, url: article.url, license: article.license, licenseUrl: article.licenseUrl }, article.paragraphs);
}

/** Texto pegado por el alumno: se analiza y NO se guarda. */
export async function readerForOwnText(learner: Learner, text: string): Promise<ReaderData> {
  const paragraphs = text
    .slice(0, 8000)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 40);
  return buildReader(learner, { title: "Tu texto", source: "own" }, paragraphs);
}

/** Lectura de una lección de «Aprende con el mundo» (texto escrito por Afi a tu nivel): se analiza y no se guarda. */
export async function readerForWorld(learner: Learner, title: string, paragraphs: string[], sourceLabel: string): Promise<ReaderData> {
  return buildReader(learner, { title, source: "own", sourceLabel }, paragraphs.slice(0, 8));
}

export interface ReadingResult {
  source: string;
  title: string;
  url: string;
  level: string;
  theta: number;
  words: number;
  correct: number;
  total: number;
  seconds: number;
}

/** Cierra una lectura: actualiza la habilidad de lectura, la actividad y el historial. */
export async function completeReading(learner: Learner, r: ReadingResult) {
  const skills = await getSkills(learner.ul.id);
  let est = skills.get("reading")!;
  for (let i = 0; i < r.total; i++) est = updateSkillOnline(est, r.theta, i < r.correct);
  // Leer un texto largo también es evidencia (aunque no haya preguntas).
  if (r.total === 0) est = updateSkillOnline(est, r.theta - 0.5, true);
  await repo.upsertSkillEstimates(learner.ul.id, [est]);
  await repo.bumpActivity(learner.userId, learner.language.code, localDay(new Date(), learner.profile.timezone), {
    seconds: Math.min(r.seconds, 3600),
    exercises: r.total,
    correct: r.correct,
  });
  if (r.source !== "own" && r.source !== "graded") {
    await repo.saveReading(learner.ul.id, { source: r.source, title: r.title, url: r.url, level: r.level, correct: r.correct, total: r.total, words: r.words });
  }
  await repo.track(learner.userId, "article_completed", { level: r.level, correct: r.correct, total: r.total });
  const newAchievements = await checkAchievements(learner);
  return { newAchievements };
}


// ── Lecturas graduadas (A1 → B1) ────────────────────────────────────────────
export interface GradedCard {
  topic: string;
  title: string;
  sentences: number;
  coverage: number;
  level: string;
}

interface GradedSentence {
  text: string;
  es: string | null;
  coverage: number;
  theta: number;
}

/**
 * Frases reales (Tatoeba, con traducción humana) de las que ya conoces casi
 * todas las palabras: lectura posible desde el primer día.
 */
async function gradedSentences(learner: Learner, topic: string): Promise<GradedSentence[]> {
  const lang = learner.language.code;
  const idx = lookupFor(lang);
  const [rank, known] = await Promise.all([learnerRank(learner), knownIds(learner)]);
  const pool = vocabFor(lang).filter((v) => (topic === "all" || v.topics.includes(topic)) && (v.rank ?? 99999) <= Math.max(rank * 1.6, 400));
  const out: GradedSentence[] = [];
  const seen = new Set<string>();
  for (const v of pool) {
    for (const ex of v.examples) {
      if (seen.has(ex.text) || ex.text.length < 12) continue;
      seen.add(ex.text);
      const tokens = tokenize(lang, ex.text, idx, learner.language.spaceSeparated);
      const a = analyzeTokens(tokens, getVocab, rank, known);
      if (a.words < 3) continue;
      out.push({ text: ex.text, es: ex.translation?.es ?? null, coverage: a.coverage, theta: a.theta });
    }
  }
  return out;
}

export async function gradedReadings(learner: Learner): Promise<GradedCard[]> {
  const topics = ["all", ...learner.profile.interests.slice(0, 4), "everyday"].filter((t, i, arr) => arr.indexOf(t) === i);
  const cards: GradedCard[] = [];
  for (const topic of topics) {
    const sents = (await gradedSentences(learner, topic)).filter((s) => s.coverage >= 0.8);
    if (sents.length < 5) continue;
    const top = sents.slice(0, 40);
    const coverage = top.reduce((a, s) => a + s.coverage, 0) / top.length;
    const theta = top.reduce((a, s) => a + s.theta, 0) / top.length;
    cards.push({ topic, title: topic === "all" ? "Frases a tu nivel" : `Frases reales: ${topicLabel(topic)}`, sentences: Math.min(10, sents.length), coverage, level: thetaToCefr(theta) });
  }
  return cards;
}

export async function readerForGraded(learner: Learner, topic: string): Promise<ReaderData | null> {
  const all = (await gradedSentences(learner, topic)).filter((s) => s.coverage >= 0.8);
  if (all.length < 5) return null;
  // Cada día una selección distinta; un par de frases algo más difíciles (i + 1).
  const rand = mulberry32(hashString(`${learner.userId}|${topic}|${localDay(new Date(), learner.profile.timezone)}`));
  const easy = shuffle(all.filter((s) => s.coverage >= 0.92), rand).slice(0, 8);
  const stretch = shuffle(all.filter((s) => s.coverage < 0.92), rand).slice(0, 2);
  const chosen = [...easy, ...stretch].sort((a, b) => a.theta - b.theta);
  return buildReader(
    learner,
    { title: topic === "all" ? "Frases a tu nivel" : `Frases reales: ${topicLabel(topic)}`, source: "graded", translations: chosen.map((s) => s.es) },
    chosen.map((s) => s.text),
  );
}


// ── Clásicos de dominio público (Wikisource) ────────────────────────────────
export interface ClassicCard {
  title: string;
  author: string;
  work: string;
  excerpt: boolean;
  preview: string;
  analysis: TextAnalysis;
}

/** Fábulas, cuentos y relatos breves, ordenados por lo bien que encajan con tu nivel. */
export async function classicReadings(learner: Learner): Promise<ClassicCard[]> {
  const lang = learner.language.code;
  const classics = classicsFor(lang);
  if (!classics.length) return [];
  const idx = lookupFor(lang);
  const [rank, known] = await Promise.all([learnerRank(learner), knownIds(learner)]);
  const cards = classics.map((c) => {
    const text = c.paragraphs.join("\n");
    const analysis = analyzeTokens(tokenize(lang, text, idx, learner.language.spaceSeparated), getVocab, rank, known);
    return { title: c.title, author: c.author, work: c.work, excerpt: c.excerpt, preview: text.slice(0, 200), analysis };
  });
  return cards.sort((a, b) => b.analysis.coverage - a.analysis.coverage);
}

export async function readerForClassic(learner: Learner, title: string): Promise<ReaderData | null> {
  const c = classicByTitle(learner.language.code, title);
  if (!c) return null;
  return buildReader(
    learner,
    { title: c.title, source: "classic", sourceLabel: `${c.author} · Wikisource${c.excerpt ? " (comienzo)" : ""}`, url: c.url, license: c.license, licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/deed.es" },
    c.paragraphs,
  );
}
