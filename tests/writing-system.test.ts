import assert from "node:assert/strict";
import { test } from "node:test";
import { catalog } from "../src/lib/content";
import { letterNameById, spellingOf, writingFor, writingUnits } from "../src/lib/content/writing-system";
import { capitalizationSlip } from "../src/lib/engine/evaluate";
import { resolveExercise } from "../src/lib/engine/exercises";
import { accentVariants } from "../src/lib/engine/letter-exercises";
import { nextStep } from "../src/lib/engine/next-step";
import { mulberry32 } from "../src/lib/engine/random";
import { pickWritingUnit, writingDue, writingSteps } from "../src/lib/engine/writing";
import { jamoOf } from "../src/lib/hangul";

const LANGS = ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"] as const;

test("escritura y ortografía: los 12 idiomas con abecedario, signos, cómo teclear y unidades A1–A2", () => {
  for (const lang of LANGS) {
    const w = writingFor(lang)!;
    assert.ok(w, lang);
    assert.ok(w.alphabet && w.alphabet.length >= 20, `${lang}: abecedario`);
    assert.equal(new Set(w.alphabet!.map((a) => a.g)).size, w.alphabet!.length, `${lang}: letras repetidas`);
    assert.ok(w.signs.length >= 2, `${lang}: signos`);
    assert.ok(w.typing.phone.length > 40 && w.typing.computer.length > 40, `${lang}: cómo teclear`);
    assert.ok(w.units.some((u) => u.level === "A1") && w.units.some((u) => u.level === "A2"), `${lang}: A1 y A2`);
    const ids = w.units.flatMap((u) => u.rules.map((r) => r.id));
    assert.equal(new Set(ids).size, ids.length, `${lang}: reglas repetidas`);
    for (const u of w.units) for (const r of u.rules) {
      assert.ok(r.examples.length >= 1 && r.explain.length > 20, `${lang}/${r.id}`);
      assert.ok(r.check.options.includes(r.check.answer), `${lang}/${r.id}: respuesta fuera de las opciones`);
      assert.equal(new Set(r.check.options).size, r.check.options.length, `${lang}/${r.id}: opciones repetidas`);
    }
  }
});

test("cada unidad genera ejercicios que el servidor sabe corregir", () => {
  for (const lang of LANGS) {
    for (const unit of writingUnits(lang)) {
      const steps = writingSteps(unit, lang, "es", catalog, { seed: 3 });
      const exercises = steps.flatMap((s) => (s.kind === "exercise" ? [s.exercise] : []));
      assert.ok(exercises.length >= 2, `${lang}/${unit.id}: pocos ejercicios`);
      for (const ex of exercises) {
        const r = resolveExercise(ex.key, catalog, "es");
        assert.ok(r, `${lang}: ${ex.key} no se resuelve`);
        if (ex.input === "choice") assert.ok(ex.options!.includes(r!.accepted[0]!), `${lang}: ${ex.key} sin la opción correcta`);
        if (ex.type === "spell_word") assert.ok(ex.audioSeq && ex.audioSeq.length >= 3, `${lang}: ${ex.key} sin deletreo`);
      }
    }
  }
});

test("deletreo: nombre de cada letra; en coreano, letra a letra de cada sílaba", () => {
  assert.deepEqual(spellingOf("fr", "chat")!.map((a) => a.name), ["cé", "ache", "a", "té"]);
  assert.deepEqual(spellingOf("en", "Bob")!.map((a) => a.name), ["bi", "ou", "bi"]);
  assert.equal(spellingOf("fr", "été"), null, "las letras con tilde no se deletrean así");
  assert.deepEqual(spellingOf("ko", "나", jamoOf)!.map((a) => a.name), ["nieun", "a"]);
  assert.deepEqual(spellingOf("ru", "да")!.map((a) => a.say), ["дэ", "а"]);
  assert.equal(spellingOf("ja", "ねこ"), null, "el japonés no se deletrea");
  assert.equal(letterNameById("fr:n:W")!.item.name, "double vé");
});

test("¿cómo se escribe?: variantes con otras tildes, siempre distintas de la buena", () => {
  const v = accentVariants("été", mulberry32(1));
  assert.ok(v.includes("ete"), "incluye la versión sin tildes");
  assert.ok(v.length >= 2 && !v.includes("été"));
  assert.deepEqual(accentVariants("chat", mulberry32(1)), []);
  assert.ok(accentVariants("Straße", mulberry32(2)).every((x) => x !== "Straße"));
});

test("mayúsculas en alemán: «hund» por «Hund» es un aviso, no un fallo", () => {
  assert.ok(capitalizationSlip("de", "hund", "Hund"));
  assert.ok(!capitalizationSlip("de", "Hund", "Hund"));
  assert.ok(!capitalizationSlip("de", "gehen", "gehen"));
  assert.ok(!capitalizationSlip("fr", "paris", "Paris"));
});

test("la unidad recomendada sale de los errores; si no hay, la primera sin hacer", () => {
  const none = pickWritingUnit("fr", new Set(), {});
  assert.equal(none!.unit.id, "alphabet");
  const accents = pickWritingUnit("fr", new Set(), { accents: 4 });
  assert.equal(accents!.unit.kind, "signs");
  assert.match(accents!.reason, /4 errores/);
  const caps = pickWritingUnit("de", new Set(["alphabet"]), { capitalization: 2 });
  assert.equal(caps!.unit.kind, "capitals");
  assert.ok(!writingDue(0, 0, none, {}), "antes de 2 lecciones no se interrumpe");
  assert.ok(writingDue(2, 0, none, {}));
  assert.ok(!writingDue(2, 1, none, {}));
  assert.ok(writingDue(0, 0, accents, { accents: 4 }), "errores repetidos: antes");
});

test("seguir aprendiendo: la unidad de escritura va antes de la lección cuando toca", () => {
  const base = { dueCount: 0, courseDone: 3, courseTotal: 30, nextLesson: 4, lessonsToday: 0, minutesToday: 0, dailyMinutes: 15, storyId: null, storiesToday: 0 };
  assert.equal(nextStep({ ...base, writing: { due: true, next: { id: "signs", title: "Acentos" } } }).href, "/app/session?writing=signs");
  assert.equal(nextStep({ ...base, writing: { due: false, next: { id: "signs", title: "Acentos" } } }).kind, "lesson");
});
