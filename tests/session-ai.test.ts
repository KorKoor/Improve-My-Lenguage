import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog, grammarFor, vocabFor } from "../src/lib/content";
import { buildSessionSteps, selectNewWords, type KnowledgeLite } from "../src/lib/engine/session-builder";
import { planSession } from "../src/lib/engine/planner";
import { mulberry32 } from "../src/lib/engine/random";
import { resolveExercise } from "../src/lib/engine/exercises";
import { sanitizeFeedback, tutorSystemPrompt, learnerProfileBlock, type LearnerContext } from "../src/lib/ai/prompts";

const now = new Date("2026-05-01T12:00:00Z");

function plan(minutes: number, due: number, target?: string) {
  return planSession({
    minutes,
    dueReviews: due,
    newWordsAvailable: 50,
    weaknesses: target
      ? [{ category: "past-tense", count: 4, sessionsWithError: 3, recentSessions: 5, errorRate: 0.5, score: 3, recurring: true }]
      : [],
    weaknessLabel: (c) => c,
    grammarForCategory: (c) => (c === "past-tense" ? "en:g:past-simple" : null),
    skills: [],
    aiAvailable: false,
    audioAvailable: true,
    seed: 3,
  });
}

test("una sesión nueva presenta palabras antes de evaluarlas y todo es resoluble", () => {
  const steps = buildSessionSteps({
    plan: plan(20, 0),
    language: "en",
    native: "es",
    catalog,
    grammar: grammarFor("en"),
    knowledge: [],
    due: [],
    vocabTheta: -0.5,
    grammarTheta: -0.5,
    interests: ["tech"],
    seed: 42,
  });
  assert.ok(steps.length >= 10, `pocos pasos: ${steps.length}`);
  const firstIntro = steps.findIndex((s) => s.kind === "intro");
  const intro = steps[firstIntro]!;
  assert.equal(intro.kind, "intro");
  const introId = intro.kind === "intro" ? intro.word.id : "";
  const firstTest = steps.findIndex((s) => s.kind === "exercise" && s.exercise.itemIds.includes(introId));
  assert.ok(firstTest > firstIntro, "la palabra se presenta antes de evaluarla");
  const keys = steps.filter((s) => s.kind === "exercise").map((s) => (s.kind === "exercise" ? s.exercise.key : ""));
  assert.equal(new Set(keys).size, keys.length, "sin ejercicios duplicados");
  for (const k of keys) assert.ok(resolveExercise(k, catalog, "es"), `resoluble: ${k}`);
  assert.ok(steps.some((s) => s.kind === "tip"), "incluye un consejo de gramática");
});

test("una debilidad recurrente hace que la gramática practique ese concepto", () => {
  const steps = buildSessionSteps({
    plan: plan(20, 0, "past"),
    language: "en",
    native: "es",
    catalog,
    grammar: grammarFor("en"),
    knowledge: [],
    due: [],
    vocabTheta: -0.5,
    grammarTheta: -0.5,
    interests: [],
    seed: 1,
  });
  const tip = steps.find((s) => s.kind === "tip");
  assert.ok(tip && tip.kind === "tip" && tip.grammar.id === "en:g:past-simple");
});

test("los repasos usan los ítems vencidos", () => {
  const due: KnowledgeLite[] = vocabFor("en").slice(0, 8).map((v) => ({ itemId: v.id, itemType: "vocab", reps: 3, stability: 4, status: "learning", dueAt: now }));
  const steps = buildSessionSteps({
    plan: { totalMinutes: 5, blocks: [{ kind: "review", minutes: 5, reason: "" }] },
    language: "en",
    native: "es",
    catalog,
    grammar: grammarFor("en"),
    knowledge: due,
    due,
    vocabTheta: 0,
    grammarTheta: 0,
    interests: [],
    seed: 9,
  });
  const reviewed = new Set(steps.flatMap((s) => (s.kind === "exercise" ? s.exercise.itemIds : [])));
  assert.ok([...reviewed].every((id) => due.some((d) => d.itemId === id)));
  assert.ok(reviewed.size >= 6);
});

test("vocabulario nuevo: prioriza intereses y nivel, nunca repite palabras ya vistas", () => {
  const vocab = vocabFor("en");
  const seen = new Map<string, KnowledgeLite>(vocab.slice(0, 20).map((v) => [v.id, { itemId: v.id, itemType: "vocab", reps: 2, stability: 3, status: "learning", dueAt: now }]));
  const words = selectNewWords(vocab, seen, -0.5, ["tech"], 6, mulberry32(5));
  assert.equal(words.length, 6);
  assert.ok(words.every((w) => !seen.has(w.id)));
  assert.ok(words.filter((w) => w.topics.includes("tech")).length >= 3, "mayoría del tema de interés");
  assert.ok(words.every((w) => w.cefr !== "C2"), "no salta a C2 con nivel B1");
});

test("funciona con un idioma sin escritura latina (japonés)", () => {
  const steps = buildSessionSteps({
    plan: plan(15, 0),
    language: "ja",
    native: "es",
    catalog,
    grammar: grammarFor("ja"),
    knowledge: [],
    due: [],
    vocabTheta: -2.5,
    grammarTheta: -2.5,
    interests: [],
    seed: 2,
  });
  assert.ok(steps.length > 5);
  assert.ok(steps.every((s) => s.kind !== "exercise" || s.exercise.type !== "rearrange"), "sin reordenar en idiomas sin espacios");
});

const ctx: LearnerContext = {
  languageName: "inglés",
  languageEnglishName: "English",
  nativeLanguageName: "español",
  level: "B1",
  skills: [{ skill: "grammar", level: "B1" }],
  weakAreas: ["pasado simple"],
  recentMistakes: [{ wrong: "She go yesterday", right: "She went yesterday" }],
  interests: ["Videojuegos"],
  goal: "Reach B2",
  knownWords: ["although"],
  explanationDepth: "balanced",
  displayName: "Carlos",
};

test("el prompt del tutor incluye el perfil estructurado", () => {
  const p = tutorSystemPrompt(ctx, null);
  assert.match(p, /USER PROFILE/);
  assert.match(p, /Estimated level \(CEFR\): B1/);
  assert.match(p, /pasado simple/);
  assert.match(learnerProfileBlock(ctx), /Interests: Videojuegos/);
});

test("el feedback de IA se valida: categorías cerradas y sin errores inventados", () => {
  const allowed = new Set(["past-tense", "articles", "vocabulary"]);
  const learner = ["Yesterday I go to the cinema with my friends", "I like the video games"];
  const out = sanitizeFeedback(
    {
      summary: "Bien",
      strengths: ["Fluidez"],
      mistakes: [
        { category: "past-tense", userText: "Yesterday I go to the cinema", correction: "Yesterday I went to the cinema", explanation: "Pasado" },
        { category: "made-up-category", userText: "I like the video games", correction: "I like video games", explanation: "Artículos" },
        { category: "articles", userText: "Frase que el alumno nunca escribió", correction: "x", explanation: "alucinación" },
      ],
      suggestedFocus: "Pasado simple",
    },
    allowed,
    learner,
  )!;
  assert.equal(out.mistakes.length, 2, "descarta el error que no aparece en el texto del alumno");
  assert.equal(out.mistakes[1]!.category, "vocabulary", "categoría desconocida → categoría segura");
  assert.equal(sanitizeFeedback("no es json", allowed, learner), null);
});

test("perfil del tutor: otros idiomas y aviso de interferencia", () => {
  const block = learnerProfileBlock({ ...ctx, otherLanguages: [{ name: "Portuguese", close: true }, { name: "Japanese", close: false }] });
  assert.match(block, /Also studying: Portuguese, Japanese\./);
  assert.match(block, /interference from Portuguese/);
  assert.doesNotMatch(learnerProfileBlock(ctx), /Also studying/);
});
