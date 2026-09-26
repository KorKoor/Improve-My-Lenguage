/**
 * Fase 0 «aprender a leer y a sonar»: lo primero para quien empieza de cero,
 * antes del Camino guiado. Orden pedagógico fijo:
 *
 *   1. letras y sonidos (un grupo por unidad)
 *   2. trazos (escrituras con trazos: japonés, chino, coreano, árabe)
 *   3. reglas de ortografía y lectura (dos por unidad)
 *   4. primeras palabras que ya se pueden leer («descodificables»)
 *   5. primeras frases
 *
 * Nunca se pide leer algo con letras que aún no se han enseñado: el motor
 * calcula qué palabras son legibles con las letras vistas hasta cada punto.
 * Cada unidad se juega en el reproductor de sesiones de siempre (evaluación
 * en el servidor, memoria FSRS de cada letra y regla). Puro y determinista.
 */
import { alphabetFor } from "../content/alphabets";
import { FIRST_STEPS, unitPhrases } from "../content/first-steps";
import { letterChunks, letterGroupsFor, letterItemId, rulesFor } from "../content/phase-zero";
import type { LanguageCode, VocabItem } from "../content/types";
import { jamoOf } from "../hangul";
import { courseWords } from "./course";
import { buildPhraseExercise, buildVocabExercise, buildMatchExercise, translationOf, type Catalog, type Exercise } from "./exercises";
import { buildLetterExercise, buildLetterPairExercise, buildReadWordExercise, buildRuleExercise, buildTonePickExercise, wordReading, pinyinOf } from "./letter-exercises";
import { mulberry32, shuffle } from "./random";
import { wordCard, type SessionStep } from "./session-builder";

export type PhaseUnitKind = "letters" | "strokes" | "rules" | "words" | "phrases";

export interface PhaseUnit {
  id: string;
  n: number;
  kind: PhaseUnitKind;
  title: string;
  goal: string;
  emoji: string;
  groupId?: string;
  /** Letras de la unidad (un grupo grande se reparte en varias unidades). */
  letters?: string[];
  ruleIds?: string[];
}

/** Escrituras que se aprenden también trazando. */
export const STROKE_LANGS = new Set(["ja", "zh", "ko", "ar"]);
const RULES_PER_UNIT = 2;
export const WORDS_PER_UNIT = 6;
/** Aciertos para dar una unidad por superada (igual que las lecciones). */
export const PHASE_PASS = 0.6;

/** Idiomas que se pueden estudiar sólo con letras latinas (rōmaji, pinyin). */
export const LATIN_OPTIONAL = new Set(["ja", "zh"]);

/**
 * Unidades de la Fase 0 de un idioma, en orden. `latin`: el alumno estudia
 * japonés o chino sólo en letras latinas, así que se saltan los kana, los
 * kanji/hanzi, los trazos y las palabras «para leer»; en chino se quedan el
 * pinyin y los tonos (que son letras latinas).
 */
export function phaseZeroUnits(lang: LanguageCode, latin = false): PhaseUnit[] {
  latin = latin && LATIN_OPTIONAL.has(lang);
  const units: Omit<PhaseUnit, "n">[] = [];
  const groups = letterGroupsFor(lang).filter((g) => !latin || (lang === "zh" && g.id !== "zh-first"));
  const nonLatin = Boolean(alphabetFor(lang));
  for (const g of groups) {
    const chunks = letterChunks(g);
    const parts = chunks.length;
    for (let p = 0; p < parts; p++) {
      const letters = chunks[p]!.map((l) => l.g);
      units.push({
        id: parts > 1 ? `letters:${g.id}:${p + 1}` : `letters:${g.id}`,
        kind: "letters",
        groupId: g.id,
        letters,
        title: parts > 1 ? `${g.title} (${p + 1} de ${parts})` : g.title,
        goal: nonLatin ? `${letters.length} letras nuevas: cómo se escriben y cómo suenan.` : `${letters.length} sonidos que en español se escriben distinto.`,
        emoji: "🔤",
      });
    }
  }
  if (STROKE_LANGS.has(lang) && !latin) units.push({ id: "strokes", kind: "strokes", title: "Cómo se trazan", goal: "El orden de los trazos de los signos más sencillos.", emoji: "✍️" });
  // Reglas de dos en dos; si sobra una, va con la unidad anterior (una sola regla es muy poco).
  const rules = latin && lang === "ja" ? [] : rulesFor(lang);
  const chunks: (typeof rules)[] = [];
  for (let i = 0; i < rules.length; i += RULES_PER_UNIT) chunks.push(rules.slice(i, i + RULES_PER_UNIT));
  if (chunks.length > 1 && chunks[chunks.length - 1]!.length === 1) chunks[chunks.length - 2]!.push(...chunks.pop()!);
  chunks.forEach((chunk, i) => {
    units.push({ id: `rules:${i + 1}`, kind: "rules", ruleIds: chunk.map((r) => r.id), title: chunk.map((r) => r.title).join(" · "), goal: `${chunk.length} reglas para leer bien.`, emoji: "📏" });
  });
  if (!latin) {
    units.push({ id: "words:1", kind: "words", title: "Tus primeras palabras", goal: "Palabras que ya puedes leer solo.", emoji: "📖" });
    units.push({ id: "words:2", kind: "words", title: "Más palabras que ya sabes leer", goal: "Leer, escuchar y entender.", emoji: "📖" });
  }
  units.push({ id: "phrases", kind: "phrases", title: "Tus primeras frases", goal: "Saludar y presentarte con lo que ya lees.", emoji: "💬" });
  return units.map((u, i) => ({ ...u, n: i + 1 }));
}

/**
 * Progreso guardado → unidades superadas. Los grupos de letras practicados en
 * la página del alfabeto (`alphabet`) cuentan como sus unidades de letras.
 */
export function phaseDone(record: Record<string, number>, alphabet: Record<string, number> = {}): Set<string> {
  const done = new Set(Object.keys(record).filter((k) => (record[k] ?? 0) > 0));
  for (const [g, stars] of Object.entries(alphabet)) {
    if (stars <= 0) continue;
    done.add(`letters:${g}`);
    for (let p = 1; p <= 4; p++) done.add(`letters:${g}:${p}`);
  }
  return done;
}

export interface PhaseProgress {
  done: number;
  total: number;
  next: PhaseUnit | null;
  /** ¿Se considera terminada (o saltada) la fase? */
  complete: boolean;
}

export function phaseProgress(units: PhaseUnit[], done: Set<string>, skipped = false): PhaseProgress {
  const count = units.filter((u) => done.has(u.id)).length;
  const next = skipped ? null : units.find((u) => !done.has(u.id)) ?? null;
  return { done: skipped ? units.length : count, total: units.length, next, complete: skipped || next === null };
}

// ── ¿Qué se puede leer ya? ─────────────────────────────────────────────────
/** Letras latinas que un hispanohablante ya sabe leer. */
const SPANISH = new Set([..."abcdefghijklmnopqrstuvwxyzáéíóú"]);
/** Signos que se enseñan en reglas, no en grupos de letras. */
const RULE_SIGNS: Record<string, string> = {
  ar: "ةىءأإآؤئ",
  ja: "ゃゅょっーぁぃぅぇぉャュョッァィゥェォ",
};

/**
 * Letras enseñadas hasta el grupo `upTo` (incluido; -1 = todas). Con
 * `withRules`, también los signos que se aprenden en las reglas (っ, ة…).
 */
export function taughtLetters(lang: LanguageCode, upTo = -1, withRules = false): Set<string> {
  const groups = letterGroupsFor(lang);
  const until = upTo < 0 ? groups.length : upTo + 1;
  const out = new Set<string>();
  if (!alphabetFor(lang)) for (const c of SPANISH) out.add(c);
  for (const g of groups.slice(0, until)) for (const l of g.letters) out.add(l.g.toLowerCase());
  if (withRules) for (const c of RULE_SIGNS[lang] ?? "") out.add(c);
  return out;
}

/** Las unidades mínimas que hay que saber para leer un texto (null: imposible, p. ej. kanji). */
export function unitsToRead(lang: LanguageCode, text: string): string[] | null {
  const clean = text.normalize("NFC").replace(/́/g, "").replace(/[ً-ْٰ]/g, "").toLowerCase();
  const chars = [...clean].filter((c) => /\p{L}|ー/u.test(c));
  if (!chars.length) return null;
  if (lang === "ko") {
    const out: string[] = [];
    for (const c of chars) {
      const j = jamoOf(c);
      if (!j) return null;
      out.push(...j);
    }
    return out;
  }
  if (lang === "ja" && chars.some((c) => !/[぀-ヿー]/.test(c))) return null;
  return chars;
}

export function isDecodable(lang: LanguageCode, text: string, taught: Set<string>): boolean {
  const need = unitsToRead(lang, text);
  return Boolean(need && need.every((u) => taught.has(u)));
}

const WORD_POS = new Set(["noun", "verb", "adjective", "interjection", "numeral", "adverb"]);

/**
 * Palabras legibles con las letras enseñadas, de las más útiles a las menos
 * (el orden del Camino guiado y luego la frecuencia). Cortas y sin espacios.
 */
export function decodableWords(lang: LanguageCode, vocab: VocabItem[], native: LanguageCode, taught: Set<string>, count: number, maxLen = 7): VocabItem[] {
  const pool = [...courseWords(vocab, native, 200), ...vocab.slice(0, 4000).filter((v) => WORD_POS.has(v.pos))];
  const out: VocabItem[] = [];
  const seen = new Set<string>();
  for (const v of pool) {
    if (out.length >= count) break;
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    const len = [...v.lemma].length;
    if (/\s/.test(v.lemma) || len < 2 || len > maxLen || !translationOf(v, native)[0]) continue;
    if (lang === "zh" ? !pinyinOf(v) : !isDecodable(lang, v.lemma, taught) || (alphabetFor(lang) && !wordReading(v))) continue;
    out.push(v);
  }
  return out;
}

/** Palabras con un grupo de letras concreto (idiomas latinos: «ou» → vous, nous…). */
function wordsWith(lang: LanguageCode, vocab: VocabItem[], native: LanguageCode, glyph: string, taught: Set<string>, count: number): VocabItem[] {
  const g = glyph.toLowerCase();
  return decodableWords(lang, vocab.slice(0, 3000), native, taught, 200, 9).filter((v) => v.lemma.toLowerCase().includes(g)).slice(0, count);
}

// ── Pasos de cada unidad ───────────────────────────────────────────────────
export interface PhaseStepOptions {
  seed: number;
  /** Modo accesible (lector de pantalla): nada que dependa de ver formas. */
  audioFirst?: boolean;
  /** Parejas de letras que el alumno confunde (más frecuentes primero). */
  confusions?: [string, string][];
}

export function phaseZeroSteps(unit: PhaseUnit, lang: LanguageCode, native: LanguageCode, catalog: Catalog, opts: PhaseStepOptions): SessionStep[] {
  const rand = mulberry32(opts.seed);
  const steps: SessionStep[] = [];
  const keys = new Set<string>();
  const push = (ex: Exercise | null) => {
    if (!ex || keys.has(ex.key)) return;
    keys.add(ex.key);
    steps.push({ kind: "exercise", block: "reading", exercise: ex });
  };
  const vocab = catalog.vocab(lang);
  const groups = letterGroupsFor(lang);
  const nonLatin = Boolean(alphabetFor(lang));

  if (unit.kind === "letters") {
    const gi = groups.findIndex((g) => g.id === unit.groupId);
    const group = groups[gi];
    if (!group) return [];
    const letters = unit.letters ? group.letters.filter((l) => unit.letters!.includes(l.g)) : group.letters;
    for (const l of letters) steps.push({ kind: "letter", block: "reading", letter: { id: letterItemId(lang, l.g), ...l, groupId: group.id } });
    // Reconocer (ver → sonido) y luego oír (sonido → letra), cada uno en otro orden.
    if (!opts.audioFirst) for (const l of shuffle(letters, rand)) push(buildLetterExercise("letter_see", letterItemId(lang, l.g), opts.seed));
    for (const l of shuffle(letters, rand)) push(buildLetterExercise("letter_hear", letterItemId(lang, l.g), opts.seed));
    const mine = new Set(letters.map((l) => l.g));
    for (const [a, b] of (opts.confusions ?? []).filter(([a, b]) => mine.has(a) || mine.has(b)).slice(0, 2)) push(buildLetterPairExercise(letterItemId(lang, a), b, opts.seed));
    // Leer palabras con lo aprendido hasta aquí (sin las letras de las partes siguientes del grupo).
    const taught = taughtLetters(lang, gi);
    const later = group.letters.slice(group.letters.findIndex((l) => l.g === letters[letters.length - 1]?.g) + 1);
    for (const l of later) taught.delete(l.g.toLowerCase());
    if (nonLatin && lang !== "zh") {
      const words = decodableWords(lang, vocab, native, taught, 12, 5);
      for (const v of shuffle(words, rand).slice(0, 3)) push(opts.audioFirst ? buildVocabExercise("listen_pick", v, catalog, native, opts.seed) : buildReadWordExercise(v, [...taught], words, opts.seed));
    } else if (!nonLatin) {
      for (const l of letters) for (const v of wordsWith(lang, vocab, native, l.g, taught, 1)) push(buildVocabExercise("listen_pick", v, catalog, native, opts.seed));
    }
    return steps;
  }

  if (unit.kind === "rules") {
    for (const id of unit.ruleIds ?? []) {
      const rule = rulesFor(lang).find((r) => r.id === id);
      if (!rule) continue;
      steps.push({ kind: "rule", block: "reading", rule: { id: `${lang}:r:${rule.id}`, title: rule.title, explain: rule.explain, examples: rule.examples } });
      push(buildRuleExercise(lang, rule.id, opts.seed));
    }
    return steps;
  }

  if (unit.kind === "words") {
    const taught = taughtLetters(lang, -1, true);
    const all = decodableWords(lang, vocab, native, taught, WORDS_PER_UNIT * 2);
    const part = unit.id === "words:2" ? all.slice(WORDS_PER_UNIT) : all.slice(0, WORDS_PER_UNIT);
    const words = part.length >= 3 ? part : all.slice(0, WORDS_PER_UNIT);
    for (const v of words) steps.push({ kind: "intro", block: "reading", word: wordCard(v, native) });
    for (const v of shuffle(words, rand)) {
      if (lang === "zh") push(buildTonePickExercise(v, opts.seed));
      else if (nonLatin && !opts.audioFirst) push(buildReadWordExercise(v, [...taught], all, opts.seed));
      else push(buildVocabExercise("listen_pick", v, catalog, native, opts.seed));
    }
    for (const v of shuffle(words, rand)) push(buildVocabExercise(opts.audioFirst ? "listen_mc" : "meaning_mc", v, catalog, native, opts.seed));
    if (words.length >= 3) push(buildMatchExercise(words.slice(0, 5), native, opts.seed));
    return steps;
  }

  if (unit.kind === "phrases") {
    const taught = taughtLetters(lang, -1, true);
    const picked: { u: number; i: number; readable: boolean }[] = [];
    for (let u = 0; u < Math.min(3, FIRST_STEPS.length) && picked.length < 5; u++) {
      unitPhrases(FIRST_STEPS[u]!, lang).forEach((ph, i) => {
        if (picked.length >= 5) return;
        const readable = lang === "zh" || ph.text.split(/\s+/).every((w) => !/\p{L}/u.test(w) || isDecodable(lang, w, taught));
        if (readable || picked.length < 3) picked.push({ u, i, readable });
      });
    }
    for (const p of picked) {
      const ph = unitPhrases(FIRST_STEPS[p.u]!, lang)[p.i]!;
      steps.push({ kind: "intro", block: "reading", word: { id: `${lang}:p:${FIRST_STEPS[p.u]!.id}:${p.i}`, lemma: ph.text, reading: ph.roman, pos: "phrase", translation: [ph.es] } });
    }
    for (const p of shuffle(picked, rand)) push(buildPhraseExercise(lang, p.u, p.i, p.readable && !opts.audioFirst ? "phrase_pick" : "phrase_listen", opts.seed));
    for (const p of shuffle(picked, rand).slice(0, 2)) push(buildPhraseExercise(lang, p.u, p.i, "phrase_listen", opts.seed + 1));
    return steps;
  }
  return steps;
}

// ── Diagnóstico «¿Sabes leer esto?» (1 minuto) ────────────────────────────
export interface DiagnosticItem {
  /** Id de la letra («ru:l:ж»). */
  id: string;
  shown: string;
  options: string[];
}

export const DIAGNOSTIC_SIZE = 8;

/**
 * Ocho letras de dificultad creciente: una de cada grupo, repartidas de
 * principio a fin del alfabeto. La respuesta no viaja al cliente.
 */
export function diagnosticItems(lang: LanguageCode, seed: number): DiagnosticItem[] {
  const groups = letterGroupsFor(lang);
  if (!groups.length) return [];
  const rand = mulberry32(seed);
  const items: DiagnosticItem[] = [];
  const used = new Set<string>();
  for (let i = 0; i < DIAGNOSTIC_SIZE; i++) {
    const gi = Math.round((i * (groups.length - 1)) / (DIAGNOSTIC_SIZE - 1));
    const letter = shuffle(groups[gi]!.letters, rand).find((l) => !used.has(l.g));
    if (!letter) continue;
    used.add(letter.g);
    const ex = buildLetterExercise("letter_see", letterItemId(lang, letter.g), seed + i);
    if (ex?.options) items.push({ id: letterItemId(lang, letter.g), shown: ex.prompt, options: ex.options });
  }
  return items;
}

/**
 * Colocación tras el diagnóstico: los grupos anteriores al primer fallo se
 * dan por sabidos. Todo bien → ya sabe leer y se salta la Fase 0.
 */
export function placement(lang: LanguageCode, results: { id: string; correct: boolean }[]): { passedUnits: string[]; skipAll: boolean } {
  const groups = letterGroupsFor(lang);
  const groupOf = (id: string) => groups.findIndex((g) => g.letters.some((l) => letterItemId(lang, l.g) === id));
  const firstMiss = results.find((r) => !r.correct);
  if (!firstMiss && results.length >= DIAGNOSTIC_SIZE - 1) return { passedUnits: phaseZeroUnits(lang).map((u) => u.id), skipAll: true };
  const known = firstMiss ? Math.max(0, groupOf(firstMiss.id)) : groups.length;
  const knownGroups = new Set(groups.slice(0, known).map((g) => g.id));
  return { passedUnits: phaseZeroUnits(lang).filter((u) => u.kind === "letters" && knownGroups.has(u.groupId!)).map((u) => u.id), skipAll: false };
}
