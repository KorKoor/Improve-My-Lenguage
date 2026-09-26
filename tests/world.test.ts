import assert from "node:assert/strict";
import { test } from "node:test";
import { checkPublicUrl, htmlToText, isPrivateAddress, readingLength, sanitizeWorldPack, worldKind, worldSystemPrompt, worldUserPrompt, WORLD_KINDS, youtubeId } from "../src/lib/engine/world";

const good = {
  title: "Aprende con Minecraft",
  summary: "Bloques, recursos y supervivencia.",
  vocabulary: [
    { term: "block", meaning: "bloque", example: "I place a block." },
    { term: "pickaxe", meaning: "pico", example: "I need a pickaxe." },
    { term: "to craft", meaning: "fabricar", example: "Let's craft a table." },
    { term: "block", meaning: "duplicado", example: "x" },
    { term: "", meaning: "vacío", example: "x" },
  ],
  reading: ["In Minecraft, the world is made of blocks. You can dig, build and explore.", "At night, monsters appear."],
  questions: [
    { question: "¿De qué está hecho el mundo?", options: ["De bloques", "De agua", "De nubes", "De papel"], answer: 0, explanation: "El texto dice «made of blocks»." },
    { question: "Mala", options: ["a", "a"], answer: 0, explanation: "" },
    { question: "Fuera de rango", options: ["a", "b"], answer: 5, explanation: "" },
  ],
  listening: [{ text: "I build a house.", meaning: "Construyo una casa." }, { text: "", meaning: "x" }],
  conversation: ["What do you like to build?"],
  writing: "Escribe 3 frases sobre tu construcción favorita.",
};

test("la lección del modelo se valida y se recorta", () => {
  const p = sanitizeWorldPack(good, "A2")!;
  assert.equal(p.level, "A2");
  assert.deepEqual(p.vocabulary.map((v) => v.term), ["block", "pickaxe", "to craft"]);
  assert.equal(p.questions.length, 1);
  assert.equal(p.listening.length, 1);
  assert.equal(p.reading.length, 2);
  assert.equal(p.writing, good.writing);
});

test("sin lectura o con poco vocabulario, no hay lección", () => {
  assert.equal(sanitizeWorldPack({ ...good, reading: [] }, "A1"), null);
  assert.equal(sanitizeWorldPack({ ...good, vocabulary: good.vocabulary.slice(0, 2) }, "A1"), null);
  assert.equal(sanitizeWorldPack("texto", "A1"), null);
  assert.equal(sanitizeWorldPack(null, "A1"), null);
  // La lectura también puede venir como un solo texto con saltos de línea.
  const joined = sanitizeWorldPack({ ...good, reading: "Primer párrafo bastante largo.\nSegundo párrafo también largo." }, "A1");
  assert.equal(joined?.reading.length, 2);
});

test("el prompt pide nivel, no copiar letras de canciones y JSON", () => {
  const sys = worldSystemPrompt({ languageName: "Inglés", languageEnglishName: "English", nativeName: "español", level: "A1", nonLatin: false });
  assert.match(sys, /Never reproduce song lyrics/);
  assert.match(sys, /60–90 words/);
  assert.match(sys, /Respond ONLY with JSON/);
  assert.match(worldUserPrompt("song", "Imagine"), /do NOT quote its lyrics/);
  assert.match(worldUserPrompt("wikipedia", "Eiffel", { title: "Tour Eiffel", text: "La tour…" }), /Source text/);
  assert.equal(readingLength("C1").words, "180–260");
});

test("tipos de fuente", () => {
  assert.equal(WORLD_KINDS.length, 7);
  assert.equal(worldKind("game")?.label, "Videojuego");
  assert.equal(worldKind("nope"), undefined);
});

test("direcciones privadas y URLs no públicas se rechazan (SSRF)", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.0.1", "172.20.0.5", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "999.1.1.1"]) assert.ok(isPrivateAddress(ip), ip);
  for (const ip of ["8.8.8.8", "142.250.1.1", "2606:4700::1111"]) assert.ok(!isPrivateAddress(ip), ip);
  assert.equal(checkPublicUrl("http://localhost:3000/x"), null);
  assert.equal(checkPublicUrl("http://169.254.169.254/latest"), null);
  assert.equal(checkPublicUrl("file:///etc/passwd"), null);
  assert.equal(checkPublicUrl("https://user:pw@example.com"), null);
  assert.equal(checkPublicUrl("https://example.com:8080/"), null);
  assert.equal(checkPublicUrl("https://intranet/"), null);
  assert.equal(checkPublicUrl("https://es.wikipedia.org/wiki/Minecraft")?.hostname, "es.wikipedia.org");
});

test("YouTube: id del vídeo en sus formatos", () => {
  assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ?t=3"), "dQw4w9WgXcQ");
  assert.equal(youtubeId("https://www.youtube.com/shorts/abcdefghijk"), "abcdefghijk");
  assert.equal(youtubeId("https://example.com/watch?v=x"), null);
  assert.equal(youtubeId("Minecraft"), null);
});

test("HTML → texto: sin scripts ni menús, entidades decodificadas", () => {
  const html = `<html><head><title>Noticia &amp; más</title><script>alert(1)</script></head><body><nav><p>Menú con un texto suficientemente largo para contar</p></nav><article><h1>Titular</h1><p>Primer párrafo de la noticia con suficiente longitud &quot;real&quot;.</p><p>corto</p><p>Segundo párrafo, también largo, con una entidad &#233; y &#x1F600; y &#9999999;.</p></article></body></html>`;
  const t = htmlToText(html);
  assert.equal(t.title, "Noticia & más");
  assert.equal(t.paragraphs.length, 2);
  assert.match(t.paragraphs[0]!, /"real"/);
  assert.match(t.paragraphs[1]!, /é/);
  assert.ok(!t.paragraphs.join(" ").includes("alert"));
  assert.ok(!t.paragraphs.join(" ").includes("Menú"));
});
