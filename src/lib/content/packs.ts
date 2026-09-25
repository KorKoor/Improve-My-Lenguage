import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import type { CefrLevel, ContentSourceTag, LanguageCode, PartOfSpeech, TenseKey, VocabItem } from "./types";

/**
 * Paquetes de vocabulario generados desde datos públicos
 * (scripts/content/build_packs.py → data/packs/<código>.json.gz).
 *
 * Se leen sólo en el servidor, bajo demanda y una vez por proceso: el
 * navegador nunca descarga el diccionario completo. Si falta el archivo, la
 * app sigue funcionando con el contenido curado del repositorio.
 */
interface PackWord {
  s: string; // slug
  l: string; // lema
  p: PartOfSpeech;
  r: number; // rango de frecuencia entre lemas
  c: CefrLevel;
  b: 1 | 2 | 3 | 4 | 5;
  t: string[]; // traducciones al español
  src: ContentSourceTag;
  tp: string[];
  ex: [text: string, es: string | null, source: ContentSourceTag][];
  d?: string;
  i?: string;
  a?: string;
  rd?: string;
  n?: string;
  f?: string[];
  cj?: Partial<Record<TenseKey, (string | null)[]>>;
}

export interface PackSource {
  name: string;
  url: string;
  license: string;
  use: string;
}

export interface PackMeta {
  language: LanguageCode;
  generatedAt: string;
  count: number;
  levels: Partial<Record<CefrLevel, number>>;
  sources: PackSource[];
}

interface LoadedPack {
  meta: PackMeta;
  words: VocabItem[];
}

const cache = new Map<LanguageCode, LoadedPack | null>();

function packPath(language: LanguageCode): string {
  return path.join(process.cwd(), "data", "packs", `${language}.json.gz`);
}

function toVocab(language: LanguageCode, w: PackWord): VocabItem {
  const sources = new Set<ContentSourceTag>(["wordfreq", w.src]);
  for (const e of w.ex) sources.add(e[2]);
  if (w.a) sources.add("commons");
  return {
    id: `${language}:w:${w.s}`,
    language,
    lemma: w.l,
    reading: w.rd,
    pos: w.p,
    cefr: w.c,
    rank: w.r,
    frequencyBand: w.b,
    ipa: w.i,
    audioUrl: w.a,
    translations: { es: w.t },
    definition: w.d,
    examples: w.ex.map(([text, es]) => ({ text, translation: es ? { es } : undefined })),
    topics: w.tp,
    register: "neutral",
    usageNote: w.n,
    forms: w.f,
    conjugation: w.cj,
    sources: [...sources],
  };
}

function load(language: LanguageCode): LoadedPack | null {
  if (cache.has(language)) return cache.get(language)!;
  let pack: LoadedPack | null = null;
  try {
    const file = packPath(language);
    if (existsSync(file)) {
      const raw = JSON.parse(gunzipSync(readFileSync(file)).toString("utf8")) as { meta: PackMeta; words: PackWord[] };
      pack = { meta: raw.meta, words: raw.words.map((w) => toVocab(language, w)) };
    }
  } catch (err) {
    console.error(`[content] no se pudo leer el paquete de ${language}`, err);
  }
  cache.set(language, pack);
  return pack;
}

export function packVocab(language: LanguageCode): VocabItem[] {
  return load(language)?.words ?? [];
}

export function packMeta(language: LanguageCode): PackMeta | null {
  return load(language)?.meta ?? null;
}
