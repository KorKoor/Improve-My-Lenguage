/**
 * «Aprende con el mundo»: el alumno trae algo que le interesa (un tema, una
 * página de Wikipedia, una noticia o artículo por URL, un videojuego, una
 * canción, un vídeo o un texto pegado) y Afi lo convierte en una lección a su
 * nivel: vocabulario, lectura, preguntas, escucha, conversación y escritura.
 *
 * Aquí sólo hay lógica pura (se prueba sin red): tipos de fuente, prompts,
 * validación de la respuesta del modelo y comprobaciones de URL.
 */

export type WorldKind = "topic" | "wikipedia" | "url" | "game" | "song" | "video" | "text";

export interface WorldKindMeta {
  id: WorldKind;
  label: string;
  emoji: string;
  placeholder: string;
  /** Qué escribe el alumno: un tema/título, una URL o un texto largo. */
  input: "short" | "url" | "long";
}

export const WORLD_KINDS: WorldKindMeta[] = [
  { id: "topic", label: "Tema", emoji: "💡", placeholder: "Minecraft, el espacio, cocina japonesa…", input: "short" },
  { id: "wikipedia", label: "Wikipedia", emoji: "📚", placeholder: "Torre Eiffel, Frida Kahlo, fotosíntesis…", input: "short" },
  { id: "url", label: "Noticia o artículo", emoji: "📰", placeholder: "https://…", input: "url" },
  { id: "game", label: "Videojuego", emoji: "🎮", placeholder: "Minecraft, Zelda, FIFA…", input: "short" },
  { id: "song", label: "Canción", emoji: "🎵", placeholder: "«Imagine» de John Lennon", input: "short" },
  { id: "video", label: "Vídeo", emoji: "🎬", placeholder: "https://youtu.be/… o de qué trata", input: "short" },
  { id: "text", label: "Texto", emoji: "📝", placeholder: "Pega aquí un texto (mejor en el idioma que aprendes)", input: "long" },
];

export function worldKind(id: string): WorldKindMeta | undefined {
  return WORLD_KINDS.find((k) => k.id === id);
}

export interface WorldVocab {
  term: string;
  /** Lectura en letras latinas o kana si la escritura no es latina. */
  reading?: string;
  meaning: string;
  example: string;
}

export interface WorldQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface WorldPack {
  title: string;
  /** De qué trata, en el idioma del alumno (una frase). */
  summary: string;
  level: string;
  vocabulary: WorldVocab[];
  /** Texto de lectura en el idioma que aprende, a su nivel. */
  reading: string[];
  questions: WorldQuestion[];
  /** Frases cortas para escuchar y entender (con su traducción). */
  listening: { text: string; meaning: string }[];
  /** Preguntas para conversar sobre el tema con el tutor. */
  conversation: string[];
  /** Tarea de escritura, en el idioma del alumno. */
  writing: string;
  source?: { kind: WorldKind; label: string; url?: string; license?: string };
}

export interface WorldContext {
  languageName: string;
  languageEnglishName: string;
  nativeName: string;
  level: string;
  nonLatin: boolean;
}

/** Qué pedimos al modelo según el nivel: longitud del texto y complejidad. */
export function readingLength(level: string): { words: string; sentences: string } {
  if (level === "A1" || level === "desconocido") return { words: "60–90", sentences: "frases muy cortas, presente, vocabulario básico" };
  if (level === "A2") return { words: "90–140", sentences: "frases cortas, presente y pasado simple" };
  if (level === "B1") return { words: "140–200", sentences: "frases variadas, conectores sencillos" };
  return { words: "180–260", sentences: "frases naturales con algo de subordinación" };
}

export function worldSystemPrompt(ctx: WorldContext): string {
  const len = readingLength(ctx.level);
  return [
    `You are Afi, a warm language-learning companion. You turn something the learner loves into a short, accurate lesson in ${ctx.languageEnglishName} (${ctx.languageName}).`,
    `Learner: native language ${ctx.nativeName}; level in ${ctx.languageEnglishName}: ${ctx.level} (CEFR).`,
    "Rules:",
    `- The reading text must be ORIGINAL, written by you in ${ctx.languageEnglishName}, ${len.words} words, ${len.sentences}. 2–4 short paragraphs.`,
    "- Be factually careful. If you are not sure about a fact, stay general. Never invent quotes, statistics or dates.",
    "- Never reproduce song lyrics, poems or copyrighted text, not even one line. For songs, write about the song's theme, story and context instead.",
    "- When a source text is given, base the lesson on it (summarise and adapt), do not copy long passages.",
    "- Vocabulary: 8 useful words or short phrases that appear in your reading text, with meanings in the learner's native language and a short example sentence in the target language.",
    ctx.nonLatin ? "- For each vocabulary item include 'reading' (kana/pinyin/romanization)." : "- Omit 'reading'.",
    "- Questions: 4 multiple-choice comprehension questions about your reading, written in the learner's native language; 4 options each; exactly one correct.",
    `- Listening: 4 short, natural sentences in ${ctx.languageEnglishName} about the topic (max 12 words), with their meaning in the native language.`,
    `- Conversation: 3 open questions in ${ctx.languageEnglishName} to talk about the topic, at the learner's level.`,
    "- Writing: one short writing task in the learner's native language, connected to the topic and their level.",
    "- title and summary in the learner's native language.",
    'Respond ONLY with JSON: {"title":string,"summary":string,"vocabulary":[{"term":string,"reading"?:string,"meaning":string,"example":string}],"reading":[string],"questions":[{"question":string,"options":[string,string,string,string],"answer":0-3,"explanation":string}],"listening":[{"text":string,"meaning":string}],"conversation":[string],"writing":string}',
  ].join("\n");
}

export function worldUserPrompt(kind: WorldKind, input: string, source?: { title: string; text: string }): string {
  const what: Record<WorldKind, string> = {
    topic: "Topic chosen by the learner",
    wikipedia: "Wikipedia article",
    url: "Web page (news or article)",
    game: "Video game",
    song: "Song (do NOT quote its lyrics)",
    video: "Video",
    text: "Text pasted by the learner",
  };
  const lines = [`${what[kind]}: ${input.slice(0, 300)}`];
  if (source) lines.push(`Title: ${source.title.slice(0, 200)}`, "Source text (for reference; adapt, do not copy):", source.text.slice(0, 6000));
  return lines.join("\n");
}

const clip = (s: unknown, n: number): string => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, n) : "");

/**
 * Valida y recorta la respuesta del modelo. Lo que no cumple el formato se
 * descarta; si falta lo esencial (lectura o vocabulario), devuelve null.
 */
export function sanitizeWorldPack(raw: unknown, level: string): WorldPack | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const reading = (Array.isArray(r.reading) ? r.reading : typeof r.reading === "string" ? r.reading.split(/\n+/) : [])
    .map((p) => clip(p, 1200))
    .filter((p) => p.length >= 15)
    .slice(0, 5);
  const vocabulary = (Array.isArray(r.vocabulary) ? r.vocabulary : [])
    .map((v) => {
      const o = (v ?? {}) as Record<string, unknown>;
      const reading = clip(o.reading, 80);
      return { term: clip(o.term, 60), ...(reading ? { reading } : {}), meaning: clip(o.meaning, 80), example: clip(o.example, 200) };
    })
    .filter((v, i, all) => v.term && v.meaning && all.findIndex((x) => x.term.toLowerCase() === v.term.toLowerCase()) === i)
    .slice(0, 10);
  if (reading.length === 0 || vocabulary.length < 3) return null;
  const questions = (Array.isArray(r.questions) ? r.questions : [])
    .map((q) => {
      const o = (q ?? {}) as Record<string, unknown>;
      const options = (Array.isArray(o.options) ? o.options : []).map((x) => clip(x, 140)).filter(Boolean);
      const answer = typeof o.answer === "number" ? Math.trunc(o.answer) : Number.NaN;
      return { question: clip(o.question, 240), options, answer, explanation: clip(o.explanation, 300) };
    })
    .filter((q) => q.question && q.options.length >= 2 && q.options.length <= 5 && new Set(q.options).size === q.options.length && q.answer >= 0 && q.answer < q.options.length)
    .slice(0, 6);
  const listening = (Array.isArray(r.listening) ? r.listening : [])
    .map((l) => {
      const o = (l ?? {}) as Record<string, unknown>;
      return { text: clip(o.text, 160), meaning: clip(o.meaning, 200) };
    })
    .filter((l) => l.text && l.meaning)
    .slice(0, 6);
  const conversation = (Array.isArray(r.conversation) ? r.conversation : []).map((c) => clip(c, 200)).filter(Boolean).slice(0, 4);
  return {
    title: clip(r.title, 90) || "Tu lección",
    summary: clip(r.summary, 240),
    level,
    vocabulary,
    reading,
    questions,
    listening,
    conversation,
    writing: clip(r.writing, 400),
  };
}

// ── URLs ─────────────────────────────────────────────────────────────────

/** ¿Es una dirección IP que no debe consultarse desde el servidor (red interna, local, metadatos)? */
export function isPrivateAddress(ip: string): boolean {
  const v = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (v.includes(":")) {
    if (v === "::" || v === "::1") return true;
    if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
    return /^(fc|fd|fe[89ab])/.test(v) || v.startsWith("64:ff9b:") || v.startsWith("2001:db8");
  }
  const p = v.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p as [number, number, number, number];
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

/** URL aceptable para descargar: http(s), puerto estándar, sin credenciales ni hosts locales. */
export function checkPublicUrl(input: string): URL | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password) return null;
  if (u.port && u.port !== "80" && u.port !== "443") return null;
  const h = u.hostname.toLowerCase();
  if (!h.includes(".") || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return null;
  if (/^[\d.]+$/.test(h) || h.includes(":")) {
    if (isPrivateAddress(h)) return null;
  }
  return u;
}

export function youtubeId(input: string): string | null {
  try {
    const u = new URL(input.trim());
    const h = u.hostname.replace(/^www\.|^m\./, "");
    if (h === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (h === "youtube.com" || h === "music.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/);
      return m ? m[1]! : null;
    }
  } catch {
    /* no es URL */
  }
  return null;
}

/** Texto legible de una página HTML: sin scripts, estilos, menús ni pies; párrafos limpios. */
export function htmlToText(html: string): { title: string; paragraphs: string[] } {
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim()).slice(0, 200);
  const body = (html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html)
    .replace(/<(script|style|noscript|nav|footer|header|aside|form|svg|figure)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const paragraphs = [...body.matchAll(/<(p|h[1-3]|li)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((m) => decode(m[2]!.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 40);
  return { title, paragraphs: paragraphs.slice(0, 60) };
}

function decode(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => codePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => codePoint(parseInt(n, 16)));
}

function codePoint(n: number): string {
  return Number.isInteger(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : " ";
}
