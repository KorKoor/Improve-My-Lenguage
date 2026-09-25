/**
 * Cognados y falsos amigos para hispanohablantes.
 *
 * Una palabra es cognado si, tras aplicar las correspondencias ortográficas
 * típicas entre idiomas (inglés -tion ↔ -ción, italiano -zione, portugués
 * -ção, francés -té ↔ -dad…), se parece mucho a una de sus propias
 * traducciones al español. Se aprenden casi gratis: señalarlas acelera el
 * vocabulario y da confianza. Los falsos amigos (parecen una palabra española
 * pero significan otra cosa) salen de una lista curada, porque ahí el
 * parecido engaña.
 */

export type CognateKind = "cognate" | "false_friend";

export interface CognateInfo {
  kind: CognateKind;
  /** Palabra española a la que se parece. */
  looksLike: string;
  /** Para falsos amigos: lo que de verdad significa. */
  means?: string;
}

const LATIN = new Set(["en", "fr", "it", "pt", "de", "nl", "sv"]);

export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Correspondencias ortográficas aproximadas hacia el español (al final de palabra sobre todo). */
const RULES: Record<string, [RegExp, string][]> = {
  en: [[/tion$/, "cion"], [/sion$/, "sion"], [/ty$/, "dad"], [/ous$/, "oso"], [/ic$/, "ico"], [/ical$/, "ico"], [/y$/, "ia"], [/ph/g, "f"], [/th/g, "t"], [/ch/g, "c"], [/k/g, "c"], [/mm/g, "m"], [/ss/g, "s"], [/ll/g, "l"], [/ize$/, "izar"], [/ist$/, "ista"], [/ism$/, "ismo"], [/ment$/, "mento"], [/ent$/, "ente"], [/ant$/, "ante"], [/ary$/, "ario"], [/ory$/, "orio"], [/al$/, "al"], [/ble$/, "ble"], [/^s(?=[ptc])/, "es"]],
  fr: [[/tion$/, "cion"], [/te$/, "dad"], [/eux$/, "oso"], [/euse$/, "osa"], [/ique$/, "ico"], [/isme$/, "ismo"], [/iste$/, "ista"], [/ment$/, "mento"], [/ph/g, "f"], [/th/g, "t"], [/ss/g, "s"], [/ll/g, "l"], [/mm/g, "m"], [/tt/g, "t"], [/eau/g, "el"], [/ou/g, "u"], [/^e(?=[stp])/, "es"], [/^s(?=[ptc])/, "es"], [/er$/, "ar"], [/ir$/, "ir"], [/e$/, ""]],
  it: [[/zione$/, "cion"], [/ta$/, "dad"], [/oso$/, "oso"], [/zz/g, "z"], [/ss/g, "s"], [/tt/g, "t"], [/ll/g, "l"], [/pp/g, "p"], [/cc/g, "c"], [/mm/g, "m"], [/nn/g, "n"], [/bb/g, "b"], [/gg/g, "g"], [/rr/g, "r"], [/ff/g, "f"], [/dd/g, "d"], [/^s(?=[ptc])/, "es"], [/are$/, "ar"], [/ere$/, "er"], [/ire$/, "ir"], [/ch/g, "c"], [/gh/g, "g"]],
  pt: [[/cao$/, "cion"], [/coes$/, "ciones"], [/dade$/, "dad"], [/vel$/, "ble"], [/lh/g, "ll"], [/nh/g, "n"], [/ss/g, "s"], [/^s(?=[ptc])/, "es"], [/o$/, "o"], [/m$/, "n"]],
  de: [[/tion$/, "cion"], [/itat$/, "idad"], [/ieren$/, "ar"], [/isch$/, "ico"], [/ik$/, "ica"], [/ph/g, "f"], [/th/g, "t"], [/k/g, "c"], [/z/g, "c"], [/ss/g, "s"], [/mm/g, "m"], [/ll/g, "l"], [/ie/g, "i"], [/ei/g, "i"]],
  nl: [[/tie$/, "cion"], [/iteit$/, "idad"], [/isch$/, "ico"], [/ph/g, "f"], [/th/g, "t"], [/k/g, "c"], [/ss/g, "s"], [/aa/g, "a"], [/ee/g, "e"], [/oo/g, "o"], [/uu/g, "u"]],
  sv: [[/tion$/, "cion"], [/itet$/, "idad"], [/isk$/, "ico"], [/k/g, "c"], [/ss/g, "s"], [/ll/g, "l"], [/mm/g, "m"], [/tt/g, "t"]],
};

const ES_RULES: [RegExp, string][] = [[/ll/g, "l"], [/rr/g, "r"], [/cc/g, "c"], [/h/g, ""], [/z/g, "c"], [/v/g, "b"]];

function toSpanishish(word: string, lang: string): string {
  let w = stripAccents(word).replace(/[^a-z]/g, "");
  for (const [re, to] of RULES[lang] ?? []) w = w.replace(re, to);
  for (const [re, to] of ES_RULES) w = w.replace(re, to);
  return w;
}

function spanishKey(word: string): string {
  let w = stripAccents(word).replace(/[^a-zñ]/g, "").replace(/ñ/g, "n");
  for (const [re, to] of ES_RULES) w = w.replace(re, to);
  return w;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length]!;
}

/** Parecido 0–1 entre una palabra extranjera y una española (tras las correspondencias). */
export function cognateScore(word: string, lang: string, spanish: string): number {
  const a = toSpanishish(word, lang);
  const b = spanishKey(spanish);
  if (a.length < 3 || b.length < 3) return 0;
  // Comparación también sin la vocal final (it/pt «-o/-a» frente al inglés sin vocal).
  const strip = (s: string) => s.replace(/[aeio]$/, "");
  // Palabras cortas: sin ese margen (evita «pas» ~ «paso», «cap» ~ «capa»).
  const d = a.length <= 4 ? levenshtein(a, b) : Math.min(levenshtein(a, b), levenshtein(strip(a), strip(b)));
  return 1 - d / Math.max(a.length, b.length);
}

// ── Falsos amigos (curados) ───────────────────────────────────────────────
/** lema → [parece…, significa…] */
export const FALSE_FRIENDS: Record<string, Record<string, [string, string]>> = {
  en: {
    actually: ["actualmente", "en realidad"], assist: ["asistir", "ayudar"], attend: ["atender", "asistir a"],
    embarrassed: ["embarazada", "avergonzado"], carpet: ["carpeta", "alfombra"], exit: ["éxito", "salida"],
    library: ["librería", "biblioteca"], sensible: ["sensible", "sensato"], constipated: ["constipado", "estreñido"],
    realize: ["realizar", "darse cuenta"], pretend: ["pretender", "fingir"], large: ["largo", "grande"],
    success: ["suceso", "éxito"], rope: ["ropa", "cuerda"], lecture: ["lectura", "conferencia"],
    fabric: ["fábrica", "tela"], argument: ["argumento", "discusión"], relatives: ["relativos", "parientes"],
    eventually: ["eventualmente", "finalmente"], sympathetic: ["simpático", "comprensivo"], parents: ["parientes", "padres"],
    notice: ["noticia", "aviso; notar"], topic: ["tópico", "tema"], casualty: ["casualidad", "víctima"],
    commodity: ["comodidad", "mercancía"], deception: ["decepción", "engaño"], disgust: ["disgusto", "asco"],
    exciting: ["excitante", "emocionante"], injury: ["injuria", "lesión"], resume: ["resumir", "reanudar"],
    record: ["recordar", "grabar; récord"], molest: ["molestar", "abusar de"], educated: ["educado", "culto, con estudios"],
    bizarre: ["bizarro", "extraño"], compromise: ["compromiso", "acuerdo mutuo"], contest: ["contestar", "concurso"],
    discussion: ["discusión", "conversación, debate"], vicious: ["vicioso", "cruel"], quiet: ["quieto", "silencioso"],
    advice: ["aviso", "consejo"], sensitive: ["sensitivo", "sensible"], sane: ["sano", "cuerdo"],
  },
  fr: {
    constipé: ["constipado", "estreñido"], salir: ["salir", "ensuciar"], rester: ["restar", "quedarse"],
    large: ["largo", "ancho"], entendre: ["entender", "oír"], attendre: ["atender", "esperar"],
    quitter: ["quitar", "dejar, irse de"], subir: ["subir", "sufrir, padecer"], embrasser: ["abrazar", "besar"],
    ranger: ["rango", "ordenar"], vase: ["vaso", "jarrón"], carte: ["carta", "mapa; tarjeta"], bizarre: ["bizarro", "raro"], cadre: ["cuadro", "marco; ejecutivo"],
    sale: ["sale", "sucio"], rat: ["rato", "rata"],
    crier: ["criar", "gritar"], tirer: ["tirar", "jalar, disparar"],
  },
  it: {
    burro: ["burro", "mantequilla"], caldo: ["caldo", "calor, caliente"], salire: ["salir", "subir"],
    guardare: ["guardar", "mirar"], aceto: ["aceite", "vinagre"], camera: ["cámara", "habitación"],
    subito: ["súbito", "enseguida"], gamba: ["gamba", "pierna"],
    largo: ["largo", "ancho"], morbido: ["morboso", "suave, blando"], imbarazzata: ["embarazada", "avergonzada"],
    fermare: ["firmar", "detener"], autista: ["autista", "conductor"], contestare: ["contestar", "protestar, impugnar"], pronto: ["pronto", "¿diga? (al teléfono); listo"],
    esposto: ["esposo", "expuesto"],
    tirare: ["tirar", "jalar, lanzar"], lampo: ["lámpara", "relámpago"], nudo: ["nudo", "desnudo"],
  },
  pt: {
    exquisito: ["exquisito", "raro, extraño"], esquisito: ["exquisito", "raro, extraño"], polvo: ["polvo", "pulpo"],
    embaraçada: ["embarazada", "avergonzada"], rato: ["rato", "ratón"], latir: ["latir", "ladrar"],
    borracha: ["borracha", "goma de borrar"], apelido: ["apellido", "apodo"], brincar: ["brincar", "jugar"],
    cena: ["cena", "escena"], salsa: ["salsa", "perejil"], copo: ["copo", "vaso"], oficina: ["oficina", "taller"],
    largo: ["largo", "ancho; plaza"], pegar: ["pegar", "coger, agarrar"], acordar: ["acordar", "despertar"],
    cadeira: ["cadera", "silla"], fechar: ["fechar", "cerrar"], presunto: ["presunto", "jamón"],
    tirar: ["tirar", "quitar, sacar"], logo: ["luego", "enseguida"], ninho: ["niño", "nido"], sobremesa: ["sobremesa", "postre"],
    assinatura: ["asignatura", "firma"], escritório: ["escritorio", "oficina"], talher: ["taller", "cubierto"],
  },
};

/** Información de cognado o falso amigo de una palabra (sólo para nativos de español). */
export function cognateInfo(lemma: string, lang: string, translations: string[], native = "es"): CognateInfo | null {
  if (native !== "es" || !LATIN.has(lang)) return null;
  const key = lemma.toLowerCase();
  const ff = FALSE_FRIENDS[lang]?.[key];
  if (ff) return { kind: "false_friend", looksLike: ff[0], means: ff[1] };
  let best: { t: string; s: number } | null = null;
  for (const raw of translations.slice(0, 4)) {
    const t = raw.replace(/\(.*?\)/g, "").trim();
    if (!t || t.includes(" ")) continue;
    const s = cognateScore(lemma, lang, t);
    if (!best || s > best.s) best = { t, s };
  }
  if (!best) return null;
  const len = stripAccents(lemma).length;
  const threshold = len <= 4 ? 0.99 : len <= 6 ? 0.8 : 0.72;
  return best.s >= threshold ? { kind: "cognate", looksLike: best.t } : null;
}
