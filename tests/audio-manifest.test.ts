import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { collect } from "../scripts/audio/collect-texts";
import { audioKey, PREGEN_VOICES, speechText } from "../src/lib/audio-key";

const dir = (lang: string) => path.join(process.cwd(), "public/audio", lang);
const manifest = (lang: string) => JSON.parse(readFileSync(path.join(dir(lang), "index.json"), "utf-8")) as { voice: string | null; files: Record<string, string>; human?: Record<string, string> };

test("clave de audio: igual con o sin acento ruso, mayúsculas o espacios de más", () => {
  assert.equal(audioKey("Вода́"), audioKey("вода"));
  assert.equal(audioKey("  Bonjour   Marie "), "bonjour marie");
  assert.equal(speechText("вода́"), "вода");
});

test("audio pregenerado: cubre letras, reglas y abecedario de cada idioma con voz libre", () => {
  for (const lang of Object.keys(PREGEN_VOICES)) {
    const file = path.join(dir(lang), "index.json");
    assert.ok(existsSync(file), `${lang}: falta public/audio/${lang}/index.json (scripts/audio/build_audio.py)`);
    const m = manifest(lang);
    assert.equal(m.voice, PREGEN_VOICES[lang]!.voice, `${lang}: voz distinta de la registrada`);
    const missing = collect(lang).filter((t) => ["letter", "rule", "alphabet"].includes(t.kind) && !m.files[t.key]);
    assert.deepEqual(missing.map((t) => t.text), [], `${lang}: textos sin audio — vuelve a ejecutar collect-texts y build_audio`);
    for (const f of new Set(Object.values(m.files))) assert.ok(existsSync(path.join(dir(lang), f)), `${lang}: falta ${f}`);
  }
});

test("grabaciones humanas: URL de Wikimedia en MP3, sin parámetros", () => {
  for (const lang of ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"]) {
    if (!existsSync(path.join(dir(lang), "index.json"))) continue;
    for (const url of Object.values(manifest(lang).human ?? {})) {
      assert.match(url, /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^?]+\.mp3$/, `${lang}: ${url}`);
    }
  }
});

test("variedad correcta: nada de cantonés en mandarín ni de afrikáans en inglés", async () => {
  const { audioMatchesLanguage } = await import("../src/lib/audio-key");
  assert.ok(!audioMatchesLanguage("https://upload.wikimedia.org/wikipedia/commons/transcoded/a/ab/LL-Q9186-Luilui6666-%E4%B8%AD.wav/x.mp3", "zh"));
  assert.ok(audioMatchesLanguage("https://upload.wikimedia.org/x/LL-Q9192_(cmn)-A-%E4%B8%AD.wav", "zh"));
  assert.ok(!audioMatchesLanguage("https://upload.wikimedia.org/x/LL-Q14196_(afr)-A-cat.wav", "en"));
  assert.ok(audioMatchesLanguage("https://upload.wikimedia.org/x/Zh-zh%C5%8Dng.ogg", "zh"));
  for (const lang of ["en", "fr", "de", "it", "pt", "nl", "sv", "ru", "ar", "ja", "ko", "zh"]) {
    const m = manifest(lang);
    for (const url of Object.values(m.human ?? {})) assert.ok(audioMatchesLanguage(url, lang), `${lang}: ${url}`);
  }
  const { catalog } = await import("../src/lib/content");
  const zh = catalog.vocab("zh").filter((v) => v.audioUrl && /LL-Q9186/.test(decodeURIComponent(v.audioUrl)));
  assert.equal(zh.length, 0, "el vocabulario de chino no trae audio cantonés");
});
