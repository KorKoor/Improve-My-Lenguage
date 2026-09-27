import "server-only";
import { generate, parseJson } from "../ai/provider";
import { cacheGet, cacheKey, cacheSet } from "../db/limits";
import { sanitizeWorldPack, worldSystemPrompt, worldUserPrompt, youtubeId, type WorldKind, type WorldPack } from "../engine/world";
import { fetchPublicPage, UrlRejectedError, youtubeInfo } from "../reading/fetch-url";
import { fetchArticle, searchArticles } from "../reading/wiki";
import { buildLearnerContext, guardAi } from "./tutor";
import type { Learner } from "./viewer";

/** Las lecciones se guardan 30 días (por fuente, idioma, idioma nativo y nivel): repetir una no gasta cuota. */
const TTL = 30 * 86_400;

export class WorldInputError extends Error {}

interface Source {
  label: string;
  url?: string;
  license?: string;
  /** Texto de referencia (Wikipedia, página web, texto pegado). */
  text?: { title: string; text: string };
  /** Qué se le dice al modelo que es el tema. */
  topic: string;
}

async function resolveSource(learner: Learner, kind: WorldKind, input: string): Promise<Source> {
  const lang = learner.language.code;
  if (kind === "wikipedia") {
    const hit = (await searchArticles("wikipedia", lang, input, 3).catch(() => []))[0];
    const article = hit ? await fetchArticle("wikipedia", lang, hit.title).catch(() => null) : null;
    if (article && article.paragraphs.length) {
      return {
        label: `Wikipedia · ${article.title}`,
        url: article.url,
        license: article.license,
        text: { title: article.title, text: article.paragraphs.join("\n").slice(0, 6000) },
        topic: article.title,
      };
    }
    return { label: `Tema · ${input}`, topic: input };
  }
  if (kind === "url") {
    const yt = youtubeId(input);
    if (yt) return videoSource(yt, input);
    try {
      const page = await fetchPublicPage(input);
      if (page.paragraphs.join(" ").length < 200) throw new WorldInputError("No encontramos suficiente texto en esa página. Prueba con otra o pega el texto.");
      return { label: `${new URL(page.url).hostname} · ${page.title}`, url: page.url, text: { title: page.title, text: page.paragraphs.join("\n").slice(0, 6000) }, topic: page.title };
    } catch (err) {
      if (err instanceof UrlRejectedError || err instanceof WorldInputError) throw new WorldInputError(err.message);
      throw new WorldInputError("No pudimos abrir esa página. Prueba con otra o pega el texto.");
    }
  }
  if (kind === "video") {
    const yt = youtubeId(input);
    if (yt) return videoSource(yt, input);
    return { label: `Vídeo · ${input}`, topic: input };
  }
  if (kind === "text") return { label: "Tu texto", text: { title: "Texto del alumno", text: input.slice(0, 6000) }, topic: input.slice(0, 120) };
  const labels: Record<WorldKind, string> = { topic: "Tema", game: "Videojuego", song: "Canción", wikipedia: "Wikipedia", url: "Página", video: "Vídeo", text: "Texto" };
  return { label: `${labels[kind]} · ${input}`, topic: input };
}

async function videoSource(id: string, input: string): Promise<Source> {
  const info = await youtubeInfo(id);
  if (!info) throw new WorldInputError("No pudimos leer ese vídeo. Escribe de qué trata y lo preparamos igual.");
  return { label: `YouTube · ${info.title}`, url: input.trim(), topic: `${info.title}${info.author ? ` (${info.author})` : ""}` };
}

/** Crea (o recupera de la caché) la lección y devuelve su id. */
export async function createWorldLesson(learner: Learner, kind: WorldKind, rawInput: string): Promise<string> {
  const input = rawInput.trim();
  if (input.length < 2) throw new WorldInputError("Escribe un tema, un título o una dirección.");
  if (kind === "text" && input.length < 80) throw new WorldInputError("Pega un texto un poco más largo (al menos un párrafo).");
  const ctx = await buildLearnerContext(learner);
  const level = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(ctx.level) ? ctx.level : "A1";
  const id = cacheKey(["world-v1", learner.language.code, learner.native, level, kind, input.toLowerCase().replace(/\s+/g, " ")]);
  if (await cacheGet<WorldPack>(id)) return id;

  await guardAi(learner);
  const source = await resolveSource(learner, kind, input);
  const raw = await generate({
    tier: "smart",
    json: true,
    temperature: 0.5,
    maxTokens: 3000,
    system: worldSystemPrompt({
      languageName: learner.language.name,
      languageEnglishName: learner.language.englishName,
      nativeName: ctx.nativeLanguageName,
      level,
      nonLatin: ["ja", "zh", "ko", "ru", "ar"].includes(learner.language.code),
    }),
    messages: [{ role: "user", content: worldUserPrompt(kind, source.topic, source.text) }],
  });
  const pack = sanitizeWorldPack(parseJson(raw), level);
  if (!pack) throw new WorldInputError("Afi no pudo preparar una buena lección con eso. Prueba a escribirlo de otra forma.");
  pack.source = { kind, label: source.label.slice(0, 160), url: source.url, license: source.license };
  await cacheSet(id, pack, TTL);
  return id;
}

export async function getWorldLesson(id: string): Promise<WorldPack | null> {
  if (!/^[a-f0-9]{64}$/.test(id)) return null;
  return cacheGet<WorldPack>(id);
}
