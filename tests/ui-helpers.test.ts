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
