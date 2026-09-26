/**
 * Ejercicios para aprender a leer: letras, reglas de lectura y primeras
 * palabras. Igual que el resto (`exercises.ts`), cada ejercicio tiene una key
 * estable y el servidor vuelve a resolverla para evaluar:
 *
 *   letter_see|ru:l:к        ver la letra → elegir cómo suena
 *   letter_hear|ru:l:к       oír la letra → elegir cuál es
 *   letter_pair|ru:l:ш|щ     contraste de dos letras que el alumno confunde
 *   rule_mc|ru:r:stress      mini ejercicio de una regla de lectura
 *   read_word|ru:w:мама      ver una palabra → elegir cómo se lee
 *   tone_pick|zh:w:你好       oír una palabra china → elegir sus tonos
 *
 * Puro y determinista (semilla).
 */
import { charBreakdown, transliterate, type Letter } from "../content/alphabets";
import { letterById, letterItemId, ruleById, ruleItemId } from "../content/phase-zero";
import { letterNameById, letterNameId, spellingOf, writingFor } from "../content/writing-system";
import { jamoOf } from "../hangul";
import type { LanguageCode, VocabItem } from "../content/types";
import { withInitial, decompose, CHO } from "../hangul";
import { translationOf } from "./exercises";
import type { Catalog, Exercise, ResolvedAnswer } from "./exercises";
import { hashString, mulberry32, shuffle } from "./random";

export const READING_TYPES = ["letter_see", "letter_hear", "letter_pair", "rule_mc", "read_word", "tone_pick", "letter_name", "spell_word", "accent_pick"] as const;
export type ReadingExerciseType = (typeof READING_TYPES)[number];

/** Dificultad fija (escala θ): leer letras es lo primero de todo. */
const DIFFICULTY: Record<ReadingExerciseType, number> = { letter_see: -3.2, letter_hear: -3, letter_pair: -2.9, rule_mc: -2.8, read_word: -2.8, tone_pick: -2.6, letter_name: -2.9, spell_word: -2.2, accent_pick: -2.4 };
const EXPECTED: Record<ReadingExerciseType, number> = { letter_see: 5000, letter_hear: 6000, letter_pair: 5000, rule_mc: 10000, read_word: 8000, tone_pick: 9000, letter_name: 6000, spell_word: 20000, accent_pick: 7000 };

const base = (type: ReadingExerciseType, lang: LanguageCode, id: string) => ({
  type,
  language: lang,
  itemIds: [id],
  difficulty: DIFFICULTY[type],
  expectedMs: EXPECTED[type],
  input: "choice" as const,
});

/** Qué leer en voz alta para una letra. */
export const letterSay = (l: Letter) => l.say ?? l.g;
/** La letra tal como se enseña (mayúscula y minúscula en cirílico). */
export const letterShown = (l: Letter) => (l.upper ? `${l.upper} ${l.g}` : l.g);

function distractorLetters(target: Letter, pool: Letter[], rand: () => number, n = 3, skip: (l: Letter) => boolean = () => false): Letter[] {
  const seen = new Set([target.r]);
  const out: Letter[] = [];
  for (const l of shuffle(pool, rand)) {
    if (out.length >= n) break;
    if (seen.has(l.r) || l.g === target.g || skip(l)) continue;
    seen.add(l.r);
    out.push(l);
  }
  return out;
}

/** Dos opciones (la buena y una mala) para cuando el alumno se atasca. */
function easyPair(answer: string, options: string[], rand: () => number): string[] {
  const wrong = shuffle(options.filter((o) => o !== answer), rand)[0];
  return wrong ? shuffle([answer, wrong], rand) : [answer];
}

export function buildLetterExercise(kind: "letter_see" | "letter_hear", id: string, seed = 0): Exercise | null {
  const ref = letterById(id);
  if (!ref) return null;
  const { letter: l, lang } = ref;
  // Opciones sólo con letras ya vistas; si aún son muy pocas, se completan con las siguientes.
  const pool = ref.seen.length >= 4 ? ref.seen : ref.pool;
  const rand = mulberry32(hashString(`${kind}|${id}|${seed}`));
  // Letras latinas: se oye una palabra (vous) y no vale como distractor otra letra que también esté en ella (u).
  const inWord = l.say && [...l.say].length > [...l.g].length ? l.say.toLowerCase() : "";
  const others = distractorLetters(l, pool, rand, 3, kind === "letter_hear" && inWord ? (o) => inWord.includes(o.g) : undefined);
  if (others.length < 1) return null;
  if (kind === "letter_see") {
    const options = shuffle([l.r, ...others.map((o) => o.r)], rand);
    return {
      ...base(kind, lang, id),
      key: `letter_see|${id}`,
      skill: "reading",
      instruction: [...l.g].length > 1 && !l.upper ? "¿Cómo suenan estas letras?" : "¿Cómo suena esta letra?",
      prompt: letterShown(l),
      options,
      easy: easyPair(l.r, options, rand),
      clue: l.ex ? `Aparece en «${l.ex.w}» (${l.ex.r})` : undefined,
      afterAudio: letterSay(l),
      optionsLang: "es",
    };
  }
  const options = shuffle([l.g, ...others.map((o) => o.g)], rand);
  return {
    ...base(kind, lang, id),
    key: `letter_hear|${id}`,
    skill: "listening",
    instruction: inWord && inWord.includes(l.g) ? "Escucha la palabra: ¿qué letras oyes en ella?" : "Escucha y elige la letra",
    prompt: "",
    audioText: letterSay(l),
    options,
    easy: easyPair(l.g, options, rand),
    clue: l.hint,
    optionsLang: "target",
  };
}

/** Contraste de dos letras que el alumno ha confundido: se oye una, se elige entre las dos. */
export function buildLetterPairExercise(id: string, other: string, seed = 0): Exercise | null {
  const ref = letterById(id);
  const alt = ref ? ref.pool.find((l) => l.g === other) : undefined;
  if (!ref || !alt || alt.g === ref.letter.g) return null;
  const rand = mulberry32(hashString(`letter_pair|${id}|${other}|${seed}`));
  return {
    ...base("letter_pair", ref.lang, id),
    key: `letter_pair|${id}|${other}`,
    skill: "listening",
    instruction: "Se parecen mucho: ¿cuál de las dos oyes?",
    prompt: "",
    audioText: letterSay(ref.letter),
    options: shuffle([ref.letter.g, alt.g], rand),
    clue: `${ref.letter.g}: ${ref.letter.hint ?? ref.letter.r} · ${alt.g}: ${alt.hint ?? alt.r}`,
    optionsLang: "target",
  };
}

export function buildRuleExercise(lang: LanguageCode, ruleId: string, seed = 0, ortho = false): Exercise | null {
  const id = ortho ? `${lang}:o:${ruleId}` : ruleItemId(lang, ruleId);
  const ref = ruleById(id);
  if (!ref) return null;
  const c = ref.rule.check;
  const rand = mulberry32(hashString(`rule_mc|${id}|${seed}`));
  const options = shuffle(c.options, rand);
  return {
    ...base("rule_mc", lang, id),
    key: `rule_mc|${id}`,
    skill: "reading",
    instruction: ref.rule.title,
    prompt: c.q,
    context: c.show,
    audioText: c.show?.replace(/́/g, ""),
    options,
    easy: easyPair(c.answer, options, rand),
    clue: ref.rule.explain,
    optionsLang: c.lang,
  };
}

/** Transcripción de una palabra del vocabulario (la respuesta de «¿cómo se lee?»). */
export function wordReading(v: VocabItem): string | null {
  return transliterate(v.language, v.lemma, v.reading);
}

/**
 * Transcripciones parecidas pero incorrectas: se cambia una letra de la
 * palabra por otra ya enseñada (мама → «maka»). Así el ejercicio obliga a
 * leer letra a letra, no a adivinar por la longitud.
 */
function nearMisses(v: VocabItem, taught: string[], rand: () => number, n: number): string[] {
  const right = wordReading(v);
  const out = new Set<string>();
  if (!right || v.language === "ar" || v.language === "zh") return [];
  const chars = [...v.lemma.normalize("NFC")];
  // Vocal por vocal y consonante por consonante: «rot» → «ret», «vot», nunca «rvt».
  const vowelish = (c: string) => /[aeiouyāēīōū]/.test(transliterate(v.language, c) ?? "");
  for (let tries = 0; tries < 40 && out.size < n; tries++) {
    const i = Math.floor(rand() * chars.length);
    const c = chars[i]!;
    let swapped: string | null = null;
    if (v.language === "ko") {
      const s = decompose(c);
      const cands = taught.filter((j) => CHO.includes(j) && s && CHO[s.cho] !== j);
      if (cands.length) swapped = withInitial(c, cands[Math.floor(rand() * cands.length)]!);
    } else {
      const kind = vowelish(c);
      const cands = taught.filter((t) => [...t].length === 1 && t !== c.toLowerCase() && vowelish(t) === kind && transliterate(v.language, t));
      if (cands.length) swapped = cands[Math.floor(rand() * cands.length)]!;
    }
    if (!swapped) continue;
    const word = [...chars.slice(0, i), swapped, ...chars.slice(i + 1)].join("");
    const r = transliterate(v.language, word);
    if (r && r !== right) out.add(r);
  }
  return [...out];
}

/**
 * «¿Cómo se lee?»: una palabra que ya puedes leer → su transcripción entre
 * otras parecidas. `pool` son otras palabras legibles (distractores de reserva).
 */
export function buildReadWordExercise(v: VocabItem, taught: string[], pool: VocabItem[], seed = 0): Exercise | null {
  const right = wordReading(v);
  if (!right) return null;
  const rand = mulberry32(hashString(`read_word|${v.id}|${seed}`));
  const opts = new Set(nearMisses(v, taught, rand, 3));
  for (const o of shuffle(pool, rand)) {
    if (opts.size >= 3) break;
    const r = o.id !== v.id ? wordReading(o) : null;
    if (r && r !== right) opts.add(r);
  }
  if (opts.size < 1) return null;
  const options = shuffle([right, ...[...opts].slice(0, 3)], rand);
  const pieces = charBreakdown(v.language, v.lemma);
  return {
    ...base("read_word", v.language, v.id),
    key: `read_word|${v.id}`,
    skill: "reading",
    instruction: "¿Cómo se lee esta palabra?",
    prompt: v.lemma,
    options,
    easy: easyPair(right, options, rand),
    clue: pieces.length ? pieces.map((p) => `${p.ch} = ${p.r ?? "?"}`).join(" · ") : undefined,
    afterAudio: v.lemma,
    audioUrl: v.audioUrl,
    optionsLang: "es",
  };
}

// ── Tonos del chino ───────────────────────────────────────────────────────
const TONES: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};
const TONE_OF = new Map(Object.entries(TONES).flatMap(([v, ts]) => ts.map((t, i) => [t, { v, tone: i }] as const)));

/** Pinyin con tildes de un ítem chino («shì (shi⁴)» → «shì»). */
export function pinyinOf(v: VocabItem): string | null {
  return v.language === "zh" ? transliterate("zh", v.lemma, v.reading) : null;
}

/** Variantes del mismo pinyin con otros tonos (nǐ hǎo → ní hǎo, nì hǎo…). */
export function toneVariants(pinyin: string, rand: () => number, n = 3): string[] {
  const chars = [...pinyin];
  const marked = chars.map((c, i) => (TONE_OF.has(c) ? i : -1)).filter((i) => i >= 0);
  if (!marked.length) return [];
  const out = new Set<string>();
  for (let tries = 0; tries < 30 && out.size < n; tries++) {
    const copy = [...chars];
    const changes = marked.length > 1 && rand() < 0.4 ? 2 : 1;
    for (const i of shuffle(marked, rand).slice(0, changes)) {
      const { v, tone } = TONE_OF.get(copy[i]!)!;
      const others = [0, 1, 2, 3].filter((t) => t !== tone);
      copy[i] = TONES[v]![others[Math.floor(rand() * others.length)]!]!;
    }
    const s = copy.join("");
    if (s !== pinyin) out.add(s);
  }
  return [...out];
}

/** Oír una palabra china y elegir su pinyin con los tonos bien puestos. */
export function buildTonePickExercise(v: VocabItem, seed = 0): Exercise | null {
  const right = pinyinOf(v);
  if (!right) return null;
  const rand = mulberry32(hashString(`tone_pick|${v.id}|${seed}`));
  const wrong = toneVariants(right, rand);
  if (!wrong.length) return null;
  const options = shuffle([right, ...wrong], rand);
  return {
    ...base("tone_pick", "zh", v.id),
    key: `tone_pick|${v.id}`,
    skill: "listening",
    instruction: "Escucha: ¿qué tonos tiene?",
    prompt: "",
    context: v.lemma,
    audioText: v.lemma,
    audioUrl: v.audioUrl,
    options,
    easy: easyPair(right, options, rand),
    clue: "1.º alto y plano (ā) · 2.º sube (á) · 3.º baja y sube (ǎ) · 4.º cae (à)",
    optionsLang: "es",
  };
}

// ── Escritura y ortografía ────────────────────────────────────────────────
/** Oír el nombre de una letra («effe») y elegir cuál es. */
export function buildLetterNameExercise(lang: LanguageCode, g: string, seed = 0): Exercise | null {
  const id = letterNameId(lang, g);
  const ref = letterNameById(id);
  if (!ref) return null;
  const rand = mulberry32(hashString(`letter_name|${id}|${seed}`));
  const shown = (a: { g: string }) => a.g.split(" ")[0]!;
  const others = shuffle(ref.alphabet.filter((a) => a !== ref.item), rand).slice(0, 3).map(shown);
  const options = shuffle([shown(ref.item), ...others], rand);
  return {
    ...base("letter_name", lang, id),
    key: `letter_name|${id}`,
    skill: "listening",
    instruction: "Escucha el nombre de la letra y elige cuál es",
    prompt: "",
    audioText: ref.item.say,
    options,
    easy: easyPair(shown(ref.item), options, rand),
    clue: `Se llama «${ref.item.name}».`,
    optionsLang: "target",
  };
}

/** Te deletrean una palabra (nombre a nombre) y la escribes. */
export function buildSpellExercise(v: VocabItem, native: LanguageCode): Exercise | null {
  const names = spellingOf(v.language, v.lemma, jamoOf);
  if (!names || names.length < 2 || names.length > 10) return null;
  return {
    ...base("spell_word", v.language, v.id),
    key: `spell_word|${v.id}`,
    skill: "listening",
    instruction: "Te la deletreamos: escribe la palabra",
    prompt: "",
    context: translationOf(v, native)[0],
    audioText: names.map((n) => n.say).join(", "),
    audioSeq: names.map((n) => n.say),
    input: "text",
    clue: names.map((n) => n.name).join(" · "),
    afterAudio: v.lemma,
  };
}

const ACCENT_SWAPS: Record<string, string[]> = {
  é: ["e", "è", "ê"], è: ["e", "é", "ê"], ê: ["e", "é", "è"], ë: ["e", "é"], à: ["a", "á", "â"], â: ["a", "à"], á: ["a", "à", "â"], ã: ["a", "â", "á"],
  ç: ["c", "s"], î: ["i", "ï"], ï: ["i", "î"], í: ["i", "ì"], ì: ["i", "í"], ô: ["o", "ó", "õ"], ó: ["o", "ò", "ô"], ò: ["o", "ó"], õ: ["o", "ô"],
  û: ["u", "ù"], ù: ["u", "ú"], ú: ["u", "ù"], ü: ["u", "ú"], ä: ["a", "å", "e"], ö: ["o", "ø"], å: ["a", "ä", "o"], ß: ["s", "sz"], œ: ["oe", "e"],
};

/** Variantes con otras tildes («été» → ete, èté, eté): para «¿cómo se escribe?». */
export function accentVariants(word: string, rand: () => number, n = 3): string[] {
  const chars = [...word.normalize("NFC")];
  const spots = chars.map((c, i) => (ACCENT_SWAPS[c.toLowerCase()] ? i : -1)).filter((i) => i >= 0);
  if (!spots.length) return [];
  const out = new Set<string>();
  // Siempre, la versión sin ninguna tilde (el error más común).
  out.add(chars.map((c) => ACCENT_SWAPS[c.toLowerCase()]?.[0] ?? c).join(""));
  for (let t = 0; t < 30 && out.size < n; t++) {
    const copy = [...chars];
    const i = spots[Math.floor(rand() * spots.length)]!;
    const alts = ACCENT_SWAPS[copy[i]!.toLowerCase()]!;
    copy[i] = alts[Math.floor(rand() * alts.length)]!;
    out.add(copy.join(""));
  }
  out.delete(word);
  return [...out].slice(0, n);
}

/** Oír una palabra con tildes o signos y elegir cómo se escribe. */
export function buildAccentExercise(v: VocabItem, native: LanguageCode, seed = 0): Exercise | null {
  if (!writingFor(v.language) || /[^\p{Script=Latin}\s'-]/u.test(v.lemma)) return null;
  const rand = mulberry32(hashString(`accent_pick|${v.id}|${seed}`));
  const wrong = accentVariants(v.lemma, rand);
  if (!wrong.length) return null;
  const options = shuffle([v.lemma, ...wrong], rand);
  return {
    ...base("accent_pick", v.language, v.id),
    key: `accent_pick|${v.id}`,
    skill: "vocabulary",
    instruction: "¿Cómo se escribe? Fíjate en los signos",
    prompt: translationOf(v, native)[0] ?? v.lemma,
    audioText: v.lemma,
    audioUrl: v.audioUrl,
    options,
    easy: easyPair(v.lemma, options, rand),
    optionsLang: "target",
  };
}

/** Resuelve las keys de lectura (sólo en el servidor). null si no es de este tipo. */
export function resolveReadingExercise(type: string, id: string, variant: string | undefined, catalog: Catalog): ResolvedAnswer | null {
  if (type === "letter_see" || type === "letter_hear" || type === "letter_pair") {
    const ref = letterById(id);
    if (!ref) return null;
    const l = ref.letter;
    if (type === "letter_pair" && !ref.pool.some((x) => x.g === variant)) return null;
    const display = `${letterShown(l)} = ${l.r}${l.hint ? ` (${l.hint})` : ""}`;
    return { accepted: [type === "letter_see" ? l.r : l.g], display, errorCategory: type === "letter_see" ? "letters" : "listening", mode: "choice", typos: false };
  }
  if (type === "rule_mc") {
    const ref = ruleById(id);
    if (!ref) return null;
    const c = ref.rule.check;
    return { accepted: [c.answer], display: c.answer, explanation: c.why ?? ref.rule.explain, errorCategory: "reading-rules", mode: "choice", typos: false };
  }
  if (type === "letter_name") {
    const ref = letterNameById(id);
    if (!ref) return null;
    const g = ref.item.g.split(" ")[0]!;
    return { accepted: [g], display: `${ref.item.g} se llama «${ref.item.name}»`, errorCategory: "letters", mode: "choice", typos: false };
  }
  if (type === "spell_word" || type === "accent_pick") {
    const v = catalog.vocabById(id);
    if (!v) return null;
    const tr = v.translations.es?.[0];
    return { accepted: [v.lemma], display: `${v.lemma}${tr ? ` («${tr}»)` : ""}`, errorCategory: type === "accent_pick" ? "accents" : "spelling", mode: type === "accent_pick" ? "choice" : "text", typos: false };
  }
  if (type === "read_word" || type === "tone_pick") {
    const v = catalog.vocabById(id);
    const right = v ? (type === "read_word" ? wordReading(v) : pinyinOf(v)) : null;
    if (!v || !right) return null;
    const tr = v.translations.es?.[0];
    return { accepted: [right], display: `${v.lemma} = ${right}${tr ? ` («${tr}»)` : ""}`, errorCategory: type === "read_word" ? "letters" : "listening", mode: "choice", typos: false };
  }
  return null;
}

/** La letra que el alumno eligió por error (para registrar la confusión), o null. */
export function confusedLetter(type: string, id: string, response: string): string | null {
  const ref = letterById(id);
  if (!ref || !response) return null;
  const hit = type === "letter_see" ? ref.pool.find((l) => l.r === response) : ref.pool.find((l) => l.g === response);
  return hit && hit.g !== ref.letter.g ? hit.g : null;
}

export { letterItemId, ruleItemId };
