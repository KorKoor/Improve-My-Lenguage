import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assessmentBankFor,
  catalog,
  getGrammar,
  grammarFor,
  vocabFor,
  LANGUAGES,
} from "../src/lib/content";
import { ERROR_CATEGORIES } from "../src/lib/content/error-categories";
import {
  buildGrammarExercise,
  buildMatchExercise,
  buildVocabExercise,
  canonicalMatchResponse,
  resolveExercise,
  translationOf,
} from "../src/lib/engine/exercises";
import { evaluateChoice, evaluateText } from "../src/lib/engine/evaluate";

const available = LANGUAGES.filter((l) => l.status !== "planned").map((l) => l.code);

test("IDs únicos y bien formados", () => {
  const ids = new Set<string>();
  for (const lang of available) {
    for (const v of vocabFor(lang)) {
      assert.ok(v.id.startsWith(`${lang}:w:`), v.id);
      assert.ok(!ids.has(v.id), `duplicado ${v.id}`);
      ids.add(v.id);
      assert.ok(v.examples.length >= 1, `${v.id} sin ejemplos`);
      assert.ok(v.translations.es?.length, `${v.id} sin traducción`);
      assert.ok(!v.id.includes("|") && !v.id.includes(","), v.id);
    }
    for (const g of grammarFor(lang)) {
      assert.ok(!ids.has(g.id));
      ids.add(g.id);
    }
  }
});

test("categorías de error apuntan a gramática existente", () => {
  for (const c of ERROR_CATEGORIES) {
    if (c.grammarId) assert.ok(getGrammar(c.grammarId), `${c.id} → ${c.grammarId}`);
  }
  for (const lang of available) {
    for (const g of grammarFor(lang)) {
      assert.ok(ERROR_CATEGORIES.some((c) => c.id === g.errorCategory), `${g.id}: ${g.errorCategory}`);
    }
  }
});

test("cada ejercicio de gramática es resoluble y su respuesta es correcta", () => {
  for (const lang of available) {
    for (const g of grammarFor(lang)) {
      g.exercises.forEach((ex, i) => {
        if (ex.options) assert.ok(ex.options.includes(ex.answers[0]!), `${g.id}#${i}`);
        const built = buildGrammarExercise(g, i)!;
        const res = resolveExercise(built.key, catalog, "es")!;
        assert.ok(res, built.key);
        const ok =
          res.mode === "choice"
            ? evaluateChoice(ex.answers[0]!, res.accepted[0]!)
            : evaluateText(ex.answers[0]!, res.accepted, lang, { typos: res.typos });
        assert.ok(ok.correct, built.key);
        if (ex.type === "correct") {
          const wrong = evaluateText(ex.prompt, res.accepted, lang, { typos: res.typos });
          assert.equal(wrong.correct, false, `la frase errónea no debe aceptarse: ${built.key}`);
        }
      });
    }
  }
});

test("ejercicios de vocabulario: generables, resolubles y coherentes", () => {
  const types = ["meaning_mc", "reverse_mc", "recall", "cloze", "dictation", "rearrange"] as const;
  let clozeCount = 0;
  for (const lang of available) {
    for (const v of vocabFor(lang)) {
      for (const t of types) {
        const ex = buildVocabExercise(t, v, catalog, "es");
        if (!ex) continue;
        if (t === "cloze") clozeCount++;
        const res = resolveExercise(ex.key, catalog, "es");
        assert.ok(res, ex.key);
        if (ex.options) {
          assert.ok(ex.options.includes(res.accepted[0]!), `${ex.key}: la respuesta está entre las opciones`);
          assert.equal(new Set(ex.options).size, ex.options.length, `${ex.key}: opciones repetidas`);
        }
        if (t === "rearrange") {
          const ordered = res.accepted[0]!;
          assert.ok(evaluateText(ordered, res.accepted, lang, { typos: false }).correct);
          assert.deepEqual([...ex.tokens!].sort(), ordered.split(/\s+/).sort(), ex.key);
        }
      }
      assert.ok(translationOf(v, "es").length > 0);
    }
  }
  assert.ok(clozeCount > 80, `pocos cloze generables: ${clozeCount}`);
});

test("emparejar: la respuesta canónica coincide", () => {
  const items = vocabFor("en").slice(0, 5);
  const ex = buildMatchExercise(items, "es")!;
  const res = resolveExercise(ex.key, catalog, "es")!;
  const pairs = Object.fromEntries(items.map((i) => [i.lemma, translationOf(i, "es")[0]!]));
  assert.equal(canonicalMatchResponse(pairs), res.accepted[0]);
});

test("bancos de diagnóstico válidos para todos los idiomas disponibles", () => {
  for (const lang of available) {
    const bank = assessmentBankFor(lang, "es");
    assert.ok(bank.length >= 10, `${lang}: banco pequeño (${bank.length})`);
    for (const item of bank) {
      assert.ok(item.options.includes(item.answer), item.id);
      assert.equal(new Set(item.options).size, item.options.length, `${item.id} opciones repetidas`);
      assert.ok(item.options.length >= 2);
    }
  }
});

test("cada idioma disponible tiene un paquete mínimo útil y temas válidos", async () => {
  const { TOPICS } = await import("../src/lib/content");
  const topics = new Set(TOPICS.map((t) => t.id));
  for (const lang of available) {
    const vocab = vocabFor(lang);
    assert.ok(vocab.length >= 30, `${lang}: sólo ${vocab.length} palabras`);
    assert.ok(grammarFor(lang).length >= 2, `${lang}: faltan conceptos de gramática`);
    assert.ok(assessmentBankFor(lang, "es").length >= 12, `${lang}: banco de diagnóstico demasiado pequeño`);
    for (const v of vocab) for (const t of v.topics) assert.ok(topics.has(t), `${v.id}: tema desconocido ${t}`);
    for (const g of grammarFor(lang)) {
      for (const e of g.exercises) if (e.type === "mc") assert.ok(e.options?.includes(e.answers[0]!), `${g.id}: respuesta fuera de las opciones`);
    }
  }
});
