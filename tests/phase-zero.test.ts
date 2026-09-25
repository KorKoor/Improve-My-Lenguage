import assert from "node:assert/strict";
import { test } from "node:test";
import { catalog } from "../src/lib/content";
import { transliterate } from "../src/lib/content/alphabets";
import { letterById, letterGroupsFor, rulesFor } from "../src/lib/content/phase-zero";
import { checkTrace, strokesFor, strokeEnds } from "../src/lib/content/strokes";
import { resolveExercise } from "../src/lib/engine/exercises";
import { confusedLetter, toneVariants } from "../src/lib/engine/letter-exercises";
import { nextStep } from "../src/lib/engine/next-step";
import { DIAGNOSTIC_SIZE, diagnosticItems, isDecodable, phaseDone, phaseProgress, phaseZeroSteps, phaseZeroUnits, placement, taughtLetters, unitsToRead } from "../src/lib/engine/phase-zero";
import { mulberry32 } from "../src/lib/engine/random";

const LANGS = ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"] as const;
const NON_LATIN = new Set(["ru", "ar", "ja", "ko", "zh"]);
const ORDER = ["letters", "strokes", "rules", "words", "phrases"];

test("fase 0: los 12 idiomas, en orden letras → trazos → reglas → palabras → frases", () => {
  for (const lang of LANGS) {
    const units = phaseZeroUnits(lang);
    assert.equal(new Set(units.map((u) => u.id)).size, units.length, `${lang}: ids repetidos`);
    const kinds = units.map((u) => ORDER.indexOf(u.kind));
    assert.deepEqual(kinds, [...kinds].sort((a, b) => a - b), `${lang}: orden pedagógico`);
    assert.ok(units.some((u) => u.kind === "letters") && units.some((u) => u.kind === "rules") && units.some((u) => u.kind === "words"), lang);
    assert.equal(units.some((u) => u.kind === "strokes"), ["ja", "zh", "ko", "ar"].includes(lang), `${lang}: trazos`);
    for (const u of units) if (u.kind === "letters") assert.ok((u.letters?.length ?? 0) <= 7, `${lang}/${u.id}: demasiadas letras por unidad`);
  }
});

test("fase 0: cada unidad tiene ejercicios y todos se pueden corregir en el servidor", () => {
  for (const lang of LANGS) {
    for (const unit of phaseZeroUnits(lang)) {
      if (unit.kind === "strokes") continue;
      for (const audioFirst of [false, true]) {
        const steps = phaseZeroSteps(unit, lang, "es", catalog, { seed: 11, audioFirst });
        const exercises = steps.flatMap((s) => (s.kind === "exercise" ? [s.exercise] : []));
        assert.ok(exercises.length >= 2, `${lang}/${unit.id}: pocos ejercicios`);
        for (const ex of exercises) {
          if (audioFirst) assert.ok(ex.type !== "letter_see" && ex.type !== "read_word", `${lang}/${unit.id}: ejercicio visual en modo accesible`);
          const r = resolveExercise(ex.key, catalog, "es");
          assert.ok(r, `${lang}: ${ex.key} no se resuelve`);
          if (ex.input === "choice") {
            assert.ok(ex.options!.includes(r!.accepted[0]!), `${lang}: ${ex.key} sin la opción correcta`);
            assert.equal(new Set(ex.options).size, ex.options!.length, `${lang}: ${ex.key} opciones repetidas`);
            if (ex.easy) assert.ok(ex.easy.includes(r!.accepted[0]!) && ex.easy.length === 2, `${lang}: ${ex.key} opciones fáciles`);
          }
        }
      }
    }
  }
});

test("nunca se pide leer letras que aún no se han enseñado", () => {
  for (const lang of ["ru", "ar", "ja", "ko"]) {
    const groups = letterGroupsFor(lang);
    for (const unit of phaseZeroUnits(lang).filter((u) => u.kind === "letters")) {
      const gi = groups.findIndex((g) => g.id === unit.groupId);
      const group = groups[gi]!;
      const last = unit.letters![unit.letters!.length - 1]!;
      const taught = taughtLetters(lang, gi);
      for (const l of group.letters.slice(group.letters.findIndex((x) => x.g === last) + 1)) taught.delete(l.g);
      for (const s of phaseZeroSteps(unit, lang, "es", catalog, { seed: 5 })) {
        if (s.kind !== "exercise") continue;
        const ex = s.exercise;
        if (ex.type === "read_word") assert.ok(isDecodable(lang, ex.prompt, taught), `${lang}/${unit.id}: «${ex.prompt}» usa letras no vistas`);
        if (ex.type === "letter_hear" && (letterById(ex.itemIds[0]!)?.seen.length ?? 0) >= 4) {
          for (const o of ex.options!) assert.ok(taught.has(o) || group.letters.some((l) => l.g === o), `${lang}/${unit.id}: opción «${o}» no vista`);
        }
      }
    }
    // Palabras y frases: sólo con letras y signos ya enseñados.
    const all = taughtLetters(lang, -1, true);
    for (const unit of phaseZeroUnits(lang).filter((u) => u.kind === "words")) {
      for (const s of phaseZeroSteps(unit, lang, "es", catalog, { seed: 5 })) {
        if (s.kind === "intro") assert.ok(isDecodable(lang, s.word.lemma, all), `${lang}/${unit.id}: «${s.word.lemma}» no es legible`);
      }
    }
  }
});

test("reglas: una idea, ejemplos que suenan y un ejercicio bien formado", () => {
  for (const lang of LANGS) {
    const rules = rulesFor(lang);
    assert.ok(rules.length >= 5, `${lang}: pocas reglas`);
    assert.equal(new Set(rules.map((r) => r.id)).size, rules.length, `${lang}: ids repetidos`);
    for (const r of rules) {
      assert.ok(r.title && r.explain.length > 20, `${lang}/${r.id}`);
      assert.ok(r.examples.length >= 2, `${lang}/${r.id}: ejemplos`);
      assert.ok(r.check.options.includes(r.check.answer), `${lang}/${r.id}: la respuesta no está entre las opciones`);
      assert.equal(new Set(r.check.options).size, r.check.options.length, `${lang}/${r.id}: opciones repetidas`);
    }
  }
});

test("letras de los idiomas latinos: sin respuestas ambiguas y con ejemplo que suena", () => {
  for (const lang of LANGS.filter((l) => !NON_LATIN.has(l))) {
    const letters = letterGroupsFor(lang).flatMap((g) => g.letters);
    assert.ok(letters.length >= 8, `${lang}: pocas letras`);
    assert.equal(new Set(letters.map((l) => l.r)).size, letters.length, `${lang}: sonidos repetidos`);
    assert.equal(new Set(letters.map((l) => l.g)).size, letters.length, `${lang}: letras repetidas`);
    for (const l of letters) {
      assert.ok(l.hint && l.ex && l.say, `${lang}/${l.g}: falta pista o ejemplo`);
      assert.ok(l.say!.toLowerCase().includes(l.g.toLowerCase()), `${lang}/${l.g}: el ejemplo «${l.say}» no contiene la letra`);
    }
  }
});

test("qué hace falta saber para leer una palabra", () => {
  assert.deepEqual(unitsToRead("ko", "한"), ["ㅎ", "ㅏ", "ㄴ"]);
  assert.deepEqual(unitsToRead("ko", "없"), ["ㅇ", "ㅓ", "ㅂ", "ㅅ"]);
  assert.equal(unitsToRead("ja", "日本"), null);
  assert.deepEqual(unitsToRead("ru", "вода́"), ["в", "о", "д", "а"]);
  assert.ok(isDecodable("fr", "vous", taughtLetters("fr", 0)));
  assert.ok(!isDecodable("fr", "français", taughtLetters("fr", 0)), "ç se enseña en el grupo 2");
  assert.ok(isDecodable("fr", "français", taughtLetters("fr", 1)));
  assert.ok(!isDecodable("ja", "きって", taughtLetters("ja")), "la っ pequeña llega con las reglas");
  assert.ok(isDecodable("ja", "きって", taughtLetters("ja", -1, true)));
});

test("transcripción coherente con las letras enseñadas", () => {
  assert.equal(transliterate("ru", "Привет"), "privet");
  assert.equal(transliterate("ru", "есть"), "yest'");
  assert.equal(transliterate("ja", "きって"), "kitte");
  assert.equal(transliterate("ja", "コーヒー"), "kōhī");
  assert.equal(transliterate("ja", "ちょっと"), "chotto");
  assert.equal(transliterate("ko", "사람"), "saram");
  assert.equal(transliterate("ar", "باب", "بَاب · bāb"), "bāb");
  assert.equal(transliterate("zh", "是", "shì (shi⁴)"), "shì");
});

test("tonos del chino: variantes con las mismas sílabas y otro tono", () => {
  const v = toneVariants("nǐ hǎo", mulberry32(3));
  assert.ok(v.length >= 2);
  for (const x of v) {
    assert.notEqual(x, "nǐ hǎo");
    assert.equal(x.normalize("NFD").replace(/\p{M}/gu, ""), "ni hao");
  }
  assert.deepEqual(toneVariants("ma", mulberry32(1)), []);
});

test("confusiones: se sabe qué letra eligió por error", () => {
  assert.equal(confusedLetter("letter_hear", "ru:l:ш", "щ"), "щ");
  assert.equal(confusedLetter("letter_see", "ru:l:р", "p"), "п");
  assert.equal(confusedLetter("letter_hear", "ru:l:ш", "ш"), null);
  assert.equal(confusedLetter("letter_hear", "ru:l:ш", ""), null);
});

test("diagnóstico: 8 letras de dificultad creciente y colocación", () => {
  for (const lang of LANGS) {
    const items = diagnosticItems(lang, 42);
    assert.ok(items.length >= DIAGNOSTIC_SIZE - 1, `${lang}: ${items.length} letras`);
    for (const it of items) assert.ok(it.options.includes(letterById(it.id)!.letter.r), `${lang}: ${it.id} sin respuesta`);
  }
  const items = diagnosticItems("ru", 42);
  const all = placement("ru", items.map((i) => ({ id: i.id, correct: true })));
  assert.ok(all.skipAll);
  const none = placement("ru", items.map((i) => ({ id: i.id, correct: false })));
  assert.deepEqual(none, { passedUnits: [], skipAll: false });
  // Falla la cuarta: se dan por sabidos los grupos anteriores al de esa letra.
  const mid = placement("ru", items.map((i, k) => ({ id: i.id, correct: k < 3 })));
  assert.ok(!mid.skipAll && mid.passedUnits.length > 0 && mid.passedUnits.every((u) => u.startsWith("letters:")));
  const progress = phaseProgress(phaseZeroUnits("ru"), new Set(mid.passedUnits));
  assert.ok(progress.next && !mid.passedUnits.includes(progress.next.id));
});

test("progreso: los grupos hechos en la página del alfabeto cuentan (también sus partes)", () => {
  const done = phaseDone({ "rules:1": 2 }, { "ko-cons": 3 });
  assert.ok(done.has("rules:1") && done.has("letters:ko-cons:1") && done.has("letters:ko-cons:2"));
  const units = phaseZeroUnits("ko");
  assert.equal(phaseProgress(units, new Set(), true).complete, true);
  assert.equal(phaseProgress(units, new Set()).next?.id, units[0]!.id);
});

test("seguir aprendiendo: repasos → letras débiles → fase 0 → lecciones", () => {
  const base = { dueCount: 0, courseDone: 0, courseTotal: 30, nextLesson: 1, lessonsToday: 0, minutesToday: 0, dailyMinutes: 15, storyId: null, storiesToday: 0 };
  const phase = { next: { id: "letters:ru-same", title: "Iguales", kind: "letters" }, done: 0, total: 16, diagnosed: false };
  assert.equal(nextStep({ ...base, phase }).href, "/app/start");
  assert.equal(nextStep({ ...base, phase: { ...phase, diagnosed: true } }).href, "/app/session?phase=letters%3Aru-same");
  assert.equal(nextStep({ ...base, phase: { ...phase, done: 3, next: { id: "strokes", title: "Trazos", kind: "strokes" } } }).href, "/app/start/strokes");
  assert.equal(nextStep({ ...base, phase: { ...phase, next: null, done: 16 } }).kind, "lesson");
  assert.equal(nextStep({ ...base, phase, weakLetters: 4 }).kind, "letters");
  assert.equal(nextStep({ ...base, phase, dueCount: 12 }).kind, "review");
  assert.equal(nextStep(base).kind, "lesson");
});

test("trazos: calcar el modelo pasa; otro número de trazos o al revés, no", () => {
  for (const lang of ["ja", "zh", "ko", "ar"]) {
    const chars = strokesFor(lang);
    assert.ok(chars.length >= 5, lang);
    for (const ch of chars) {
      const perfect = ch.strokes.map((s) => {
        const { from, to } = strokeEnds(s.d);
        return [from, [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2], to] as [number, number][];
      });
      assert.equal(checkTrace(ch.strokes, perfect), 0, `${lang}/${ch.ch}`);
      assert.equal(checkTrace(ch.strokes, perfect.slice(1)), -1, `${lang}/${ch.ch}: faltan trazos`);
      for (const s of ch.strokes) assert.ok(s.desc.length > 10, `${lang}/${ch.ch}: falta descripción`);
    }
  }
  const one = strokesFor("zh").find((c) => c.ch === "一")!;
  assert.equal(checkTrace(one.strokes, [[[82, 50], [18, 50]]]), 1, "al revés");
});
