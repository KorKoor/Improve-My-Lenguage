import "server-only";
import { lookup } from "node:dns/promises";
import { checkPublicUrl, htmlToText, isPrivateAddress } from "../engine/world";

/**
 * Descarga una página que pega el alumno, con cuidado:
 *  • sólo http(s) a puertos estándar, sin credenciales ni hosts locales;
 *  • el nombre se resuelve y se rechaza si apunta a la red interna (SSRF),
 *    también en cada redirección (máximo 3, siempre comprobadas);
 *  • 8 s de espera, 1,5 MB como mucho, sólo HTML o texto;
 *  • el contenido se trata como texto plano (nunca se ejecuta ni se muestra el HTML).
 */
const MAX_BYTES = 1_500_000;

export class UrlRejectedError extends Error {}

async function assertPublic(u: URL): Promise<void> {
  const addrs = await lookup(u.hostname, { all: true, verbatim: true }).catch(() => []);
  if (!addrs.length) throw new UrlRejectedError("No encontramos esa dirección.");
  if (addrs.some((a) => isPrivateAddress(a.address))) throw new UrlRejectedError("Esa dirección no es una página pública.");
}

export async function fetchPublicPage(input: string): Promise<{ url: string; title: string; paragraphs: string[] }> {
  const first = checkPublicUrl(input);
  if (!first) throw new UrlRejectedError("Pega una dirección web pública que empiece por https://");
  let u: URL = first;
  for (let hop = 0; hop < 4; hop++) {
    await assertPublic(u);
    const res: Response = await fetch(u, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "ImproveMyLanguages/1.0 (+https://afi.korwork.org; aprende con el mundo)", accept: "text/html,text/plain;q=0.9" },
    });
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      const nu = next ? checkPublicUrl(new URL(next, u).toString()) : null;
      if (!nu) throw new UrlRejectedError("La página redirige a una dirección que no podemos abrir.");
      u = nu;
      continue;
    }
    if (!res.ok) throw new UrlRejectedError(`La página respondió con un error (${res.status}).`);
    const type = res.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml/i.test(type)) throw new UrlRejectedError("Esa dirección no es una página de texto.");
    const text = await readLimited(res);
    if (/text\/plain/i.test(type)) {
      return { url: u.toString(), title: u.hostname, paragraphs: text.split(/\n{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p.length >= 40).slice(0, 60) };
    }
    const page = htmlToText(text);
    return { url: u.toString(), title: page.title || u.hostname, paragraphs: page.paragraphs };
  }
  throw new UrlRejectedError("Demasiadas redirecciones.");
}

async function readLimited(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
}

/** Título y autor de un vídeo de YouTube (oEmbed público; no descarga el vídeo ni su transcripción). */
export async function youtubeInfo(id: string): Promise<{ title: string; author: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const d = (await res.json()) as { title?: string; author_name?: string };
    return d.title ? { title: String(d.title).slice(0, 200), author: String(d.author_name ?? "").slice(0, 100) } : null;
  } catch {
    return null;
  }
}
