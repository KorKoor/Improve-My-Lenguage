import assert from "node:assert/strict";
import { test } from "node:test";
import { alphabetFor, arabicForms, charBreakdown, hasAlphabet, keyboardFor, romanForms } from "../src/lib/content/alphabets";
import { LANGUAGES } from "../src/lib/content/languages";
import { evaluateRoman } from "../src/lib/engine/evaluate";
import { backspaceJamo, romanizeSyllable, typeJamo } from "../src/lib/hangul";

const type = (keys: string) => [...keys].reduce(typeJamo, "");

test("alfabeto: todos los idiomas de otra escritura lo tienen, y ninguno latino", () => {
  for (const l of LANGUAGES.filter((x) => x.status !== "planned")) {
    const latin = l.writingSystems.every((w) => w === "latin");
    assert.equal(hasAlphabet(l.code), !latin, l.code);
  }
});

test("alfabeto: grupos completos y respuestas sin ambigüedad", () => {
  assert.equal(alphabetFor("ru")!.groups.flatMap((g) => g.letters).length, 33);
  assert.equal(alphabetFor("ar")!.groups.filter((g) => g.id !== "ar-short").flatMap((g) => g.letters).length, 28);
  assert.equal(alphabetFor("ja")!.groups.filter((g) => g.set === "hiragana").flatMap((g) => g.letters).length, 46 + 23);
  for (const code of ["ru", "ar", "ko", "ja", "zh"]) {
    const a = alphabetFor(code)!;
    assert.ok(a.groups.length >= 3, code);
    assert.equal(new Set(a.groups.map((g) => g.id)).size, a.groups.length, `${code}: ids repetidos`);
    for (const set of new Set(a.groups.map((g) => g.set))) {
      const letters = a.groups.filter((g) => g.set === set).flatMap((g) => g.letters);
      // En el ejercicio, dos letras con la misma respuesta harían correctas dos opciones.
      assert.equal(new Set(letters.map((l) => l.r)).size, letters.length, `${code}/${set}: transcripciones repetidas`);
      assert.equal(new Set(letters.map((l) => l.g)).size, letters.length, `${code}/${set}: letras repetidas`);
    }
    for (const g of a.groups) assert.ok(g.letters.length >= 2 && g.intro && g.title, `${code}/${g.id}`);
  }
});

test("teclado en pantalla: tiene todas las letras que se enseñan", () => {
  for (const code of ["ru", "ar", "ko", "ja"]) {
    const keys = new Set(keyboardFor(code)!.flatMap((l) => l.rows.flat()));
    const letters = alphabetFor(code)!.groups.filter((g) => g.id !== "ar-short").flatMap((g) => g.letters);
    // Las vocales compuestas del coreano se escriben con dos teclas (ㅗ + ㅏ = ㅘ).
    const typable = (g: string) => keys.has(g) || (code === "ko" && [...keys].some((a) => [...keys].some((b) => typeJamo(a, b) === g)));
    for (const l of letters) assert.ok(typable(l.g), `${code}: falta ${l.g}`);
  }
  assert.equal(keyboardFor("zh"), null);
  assert.ok(keyboardFor("fr")![0]!.rows.flat().includes("ç"), "letras especiales del francés");
  assert.equal(keyboardFor("en"), null);
});

test("hangul: las letras se juntan en sílabas como en un teclado coreano", () => {
  assert.equal(type("ㅎㅏㄴ"), "한");
  assert.equal(type("ㅎㅏㄴㄱㅜㄱ"), "한국");
  assert.equal(type("ㅎㅏㄴㅏ"), "하나"); // la final pasa a la sílaba siguiente
  assert.equal(type("ㅇㅗㅏ"), "와"); // vocal compuesta
  assert.equal(type("ㅇㅓㅂㅅ"), "없"); // final doble
  assert.equal(type("ㅇㅓㅂㅅㅓ"), "업서");
  assert.equal(type("ㅇㅓㅂㅅㅇㅓ"), "없어");
  assert.equal(type("ㄲㅗㅊ"), "꽃");
  assert.equal(type("ㅏ"), "ㅏ");
  assert.equal(backspaceJamo("한"), "하");
  assert.equal(backspaceJamo("하"), "ㅎ");
  assert.equal(backspaceJamo("와"), "오");
  assert.equal(backspaceJamo("없"), "업");
  assert.equal(backspaceJamo("ㅎ"), "");
  assert.equal(romanizeSyllable("한"), "han");
  assert.equal(romanizeSyllable("꽃"), "kkot");
  assert.equal(romanizeSyllable("a"), null);
});

test("desglose letra a letra para leer dentro de las palabras", () => {
  assert.deepEqual(charBreakdown("ru", "Мама").map((p) => p.r), ["m", "a", "m", "a"]);
  assert.deepEqual(charBreakdown("ko", "한국").map((p) => p.r), ["han", "guk"]);
  assert.deepEqual(charBreakdown("ja", "きょう").map((p) => p.r), ["kyo", "u"]);
  assert.deepEqual(charBreakdown("ja", "しゃしん").map((p) => p.r), ["sha", "shi", "n"]);
  assert.deepEqual(charBreakdown("ja", "コーヒー").map((p) => p.r), ["ko", "(larga)", "hi", "(larga)"]);
  assert.equal(charBreakdown("ja", "日本").length, 0); // sólo kanji: nada que desglosar
  const ar = charBreakdown("ar", "كِتَاب");
  assert.deepEqual(ar.map((p) => p.r), ["k", "t", "ā", "b"]); // sin vocales cortas
  assert.equal(ar[0]!.say, "كاف");
  assert.equal(charBreakdown("zh", "你好").length, 0);
  assert.equal(charBreakdown("fr", "bonjour").length, 0);
});

test("formas del árabe: las que no se unen por la izquierda no llevan enlace final", () => {
  assert.deepEqual(arabicForms("ب"), ["ب", "بـ", "ـبـ", "ـب"]);
  assert.deepEqual(arabicForms("د"), ["د", "د", "ـد", "ـد"]);
});

test("respuestas en letras latinas: se aceptan con aviso", () => {
  assert.deepEqual(romanForms("فِي · fī"), ["fi"]);
  assert.deepEqual(romanForms("shì (shi⁴)"), ["shi"]);
  assert.deepEqual(romanForms("ni hao"), ["nihao"]);
  assert.deepEqual(romanForms("ʕalā"), ["ala"]);
  assert.deepEqual(romanForms(undefined), []);
  assert.deepEqual(romanForms("то́лько · tólʹko"), ["tolko"]);
  assert.deepEqual(romanForms("с (s)"), ["s"]);
  assert.equal(evaluateRoman("svoy", ["svoj"], "свой")?.correct, true);
  assert.deepEqual(romanForms("спасибо"), []);
  assert.equal(evaluateRoman("Spasibo", ["spasibo"], "спасибо")?.note, "roman");
  assert.equal(evaluateRoman("nǐ hǎo", ["nihao"], "你好")?.correct, true);
  assert.equal(evaluateRoman("arigatou", ["arigato"], "ありがとう")?.correct, true);
  assert.equal(evaluateRoman("gracias", ["spasibo"], "спасибо"), null);
  assert.equal(evaluateRoman("", ["spasibo"], "спасибо"), null);
});
