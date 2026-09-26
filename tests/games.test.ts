import assert from "node:assert/strict";
import { test } from "node:test";
import { navGroups, navItems } from "../src/components/app/nav-items";
import {
  choices, distinctWords, gameMeta, GAMES, isOrdered, listenPoints, memoryDeck, memoryStars, rainFallSeconds, rng, scramble,
  sentenceTiles, shuffle, solutionIndexes, type GameWord,
} from "../src/lib/engine/games";

const W = (i: number, meaning = `m${i}`): GameWord => ({ id: `w${i}`, text: `t${i}`, speak: `t${i}`, meaning });
const pool = Array.from({ length: 12 }, (_, i) => W(i));

test("el generador con semilla es reproducible y la mezcla conserva los elementos", () => {
  const a = shuffle(pool, rng(42)).map((w) => w.id);
  assert.deepEqual(a, shuffle(pool, rng(42)).map((w) => w.id));
  assert.deepEqual([...a].sort(), pool.map((w) => w.id).sort());
});

test("sin palabras repetidas ni significados repetidos", () => {
  const d = distinctWords([W(1, "casa"), W(2, "casa"), { ...W(3), text: "t1" }, W(4, "")]);
  assert.deepEqual(d.map((w) => w.id), ["w1"]);
});

test("las opciones incluyen la correcta y no se repiten", () => {
  const o = choices(pool[3]!, pool, 4, rng(7));
  assert.equal(o.length, 4);
  assert.ok(o.some((w) => w.id === "w3"));
  assert.equal(new Set(o.map((w) => w.id)).size, 4);
});

test("memorama: 2 cartas por pareja y estrellas según intentos", () => {
  const deck = memoryDeck(pool, 6, rng(1));
  assert.equal(deck.length, 12);
  for (const c of deck) assert.equal(deck.filter((x) => x.pair === c.pair).length, 2);
  assert.equal(memoryStars(6, 7), 3);
  assert.equal(memoryStars(6, 12), 2);
  assert.equal(memoryStars(6, 20), 1);
});

test("la lluvia acelera pero nunca es imposible", () => {
  assert.ok(rainFallSeconds(0) > rainFallSeconds(5));
  assert.equal(rainFallSeconds(100), 3.2);
});

test("oído rápido: la racha multiplica", () => {
  assert.deepEqual([1, 3, 6].map(listenPoints), [10, 20, 30]);
});

test("ordena la frase: fichas, desorden y solución", () => {
  assert.deepEqual(sentenceTiles("fr", "Je  suis étudiant."), ["Je", "suis", "étudiant."]);
  assert.equal(sentenceTiles("fr", "Bonjour"), null);
  assert.equal(sentenceTiles("ja", "私は学生です。"), null);
  assert.deepEqual(sentenceTiles("ja", "私は学生です。", "watashi wa gakusei desu"), ["watashi", "wa", "gakusei", "desu"]);
  const tiles = ["the", "cat", "sees", "the", "dog"];
  for (let s = 0; s < 20; s++) assert.ok(!isOrdered(scramble(tiles, rng(s)), tiles));
  const bank = scramble(tiles, rng(3));
  assert.ok(isOrdered(solutionIndexes(bank, tiles).map((k) => bank[k]!), tiles));
  assert.equal(new Set(solutionIndexes(bank, tiles)).size, tiles.length);
});

test("cada juego tiene su ficha", () => {
  assert.equal(GAMES.length, 4);
  assert.equal(gameMeta("rain")?.title, "Lluvia de palabras");
  assert.equal(gameMeta("nope"), undefined);
});

test("el menú agrupa todas las secciones sin duplicados e incluye los juegos", () => {
  for (const simple of [false, true]) {
    const groups = navGroups(3, simple, true);
    assert.deepEqual(groups.map((g) => g.id), ["today", "learn", "practice", "play", "you"]);
    const hrefs = navItems(3, simple, true).map((i) => i.href);
    assert.equal(new Set(hrefs).size, hrefs.length);
    assert.ok(hrefs.includes("/app/games"));
    assert.ok(hrefs.includes("/app/alphabet"));
    for (const g of groups) assert.ok(g.items.length > 0);
  }
  assert.ok(!navItems(0, false, false).some((i) => i.href === "/app/alphabet"));
  assert.equal(navItems(5).find((i) => i.href === "/app/review")?.badge, 5);
});

test("chino sin pinyin con espacios: una ficha por carácter", () => {
  assert.deepEqual(sentenceTiles("zh", "我喝水。"), ["我", "喝", "水。"]);
  assert.deepEqual(sentenceTiles("zh", "“我喝水。”"), ["我", "喝", "水。"]);
  assert.equal(sentenceTiles("zh", "我"), null);
  assert.deepEqual(sentenceTiles("zh", "我喝水。", "wǒ hē shuǐ"), ["wǒ", "hē", "shuǐ"]);
});
