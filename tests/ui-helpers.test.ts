import assert from "node:assert/strict";
import { test } from "node:test";
import { languageGlyph } from "../src/components/language-mark";
import { cn } from "../src/lib/cn";

test("cn: la clase del llamador gana a la del componente (evita que `hidden` pierda contra `inline-flex`)", () => {
  assert.equal(cn("inline-flex items-center", "hidden sm:inline-flex"), "items-center hidden sm:inline-flex");
  assert.equal(cn("h-11 px-5", false, null, "h-9"), "px-5 h-9");
  // Colores propios del tema y tamaños de texto no chocan entre sí.
  assert.equal(cn("text-sm text-muted", "text-primary"), "text-sm text-primary");
});

test("marca de idioma: glifo de su escritura, sin banderas", () => {
  assert.equal(languageGlyph("en"), "En");
  assert.equal(languageGlyph("ja"), "あ");
  assert.equal(languageGlyph("ar"), "ع");
  assert.equal(languageGlyph("xx"), "Xx");
});

import { resolveSiteUrl } from "../src/lib/site-url";

test("URL del sitio: nunca rompe el build aunque la variable esté vacía o sin protocolo", () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" }), "http://localhost:3000");
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "  " , VERCEL_URL: "iml-abc.vercel.app" }), "https://iml-abc.vercel.app");
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "korwork.org" }), "https://korwork.org");
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://korwork.org/" }), "https://korwork.org");
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://" , VERCEL_PROJECT_PRODUCTION_URL: "korwork.org" }), "https://korwork.org");
});

test("registro de errores: sin correos ni tokens y con longitud acotada", async () => {
  const { scrub } = await import("../src/lib/log-scrub");
  const out = scrub("fallo para ana.lopez@example.com con token abcdefghijklmnopqrstuvwxyz0123456789ABCD " + "x".repeat(400));
  assert.ok(!out.includes("ana.lopez"));
  assert.ok(out.includes("<email>") && out.includes("<token>"));
  assert.ok(out.length <= 200);
});

test("voz: elige la natural del idioma y detecta cuando falta", async () => {
  const { pickVoice, detectPlatform, installVoiceHelp } = await import("../src/lib/voice");
  const voices = [
    { name: "Microsoft Hortense - French (France)", lang: "fr-FR", localService: true },
    { name: "Microsoft Denise Online (Natural) - French (France)", lang: "fr-FR", localService: false },
    { name: "Google français", lang: "fr-FR", localService: false },
    { name: "Microsoft Helena - Spanish (Spain)", lang: "es-ES", localService: true },
  ];
  assert.match(pickVoice(voices, "fr-FR")!.name, /Natural|Google/);
  assert.equal(pickVoice(voices, "ja-JP"), null);
  assert.equal(pickVoice([{ name: "Fred", lang: "en-US" }, { name: "Samantha", lang: "en-US" }], "en-US")!.name, "Samantha");
  assert.equal(detectPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "windows");
  assert.match(installVoiceHelp("windows", "Francés"), /Agregar voces/);
});

test("pares mínimos: cada par tiene dos palabras distintas y sus significados", async () => {
  const { MINIMAL_PAIRS } = await import("../src/lib/content/minimal-pairs");
  const langs = Object.keys(MINIMAL_PAIRS);
  assert.ok(langs.length >= 10);
  for (const [lang, sets] of Object.entries(MINIMAL_PAIRS)) {
    for (const s of sets!) {
      assert.ok(s.pairs.length >= 2, `${lang}/${s.id}`);
      for (const p of s.pairs) {
        assert.notEqual(p.a, p.b, `${lang}/${s.id}`);
        assert.ok(p.es[0] && p.es[1] && !p.es.join("").includes("sin sentido"), `${lang}/${s.id}: ${p.a}/${p.b}`);
      }
    }
  }
});
