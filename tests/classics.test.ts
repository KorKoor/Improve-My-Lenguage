import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const LANGS = ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"];
type Classic = { id: string; title: string; author: string; work: string; url: string; license: string; excerpt: boolean; paragraphs: string[] };

test("clásicos de Wikisource: en los 12 idiomas, con autor, fuente y licencia", () => {
  for (const lang of LANGS) {
    const items = JSON.parse(readFileSync(`data/readings/${lang}.json`, "utf-8")) as Classic[];
    assert.ok(items.length >= 1, `${lang}: sin clásicos`);
    assert.equal(new Set(items.map((c) => c.title)).size, items.length, `${lang}: títulos repetidos`);
    for (const c of items) {
      assert.ok(c.url.startsWith(`https://${lang}.wikisource.org/wiki/`), `${lang}/${c.title}: fuente`);
      assert.equal(c.license, "Dominio público");
      assert.ok(c.author && c.work, `${lang}/${c.title}: autor y obra`);
      const text = c.paragraphs.join("\n");
      assert.ok(text.length >= 300, `${lang}/${c.title}: texto demasiado corto`);
      assert.doesNotMatch(text, /Public domain|Wikipedia|Wikidata|\{\{\{|\[\[|作者：|автор /, `${lang}/${c.title}: restos de la página`);
    }
  }
});

test("clásicos en chino: en simplificado, como el resto de la app", () => {
  const [c] = JSON.parse(readFileSync("data/readings/zh.json", "utf-8")) as Classic[];
  assert.doesNotMatch(c!.paragraphs.join(""), /[這從裏們說麼爲]/);
});
