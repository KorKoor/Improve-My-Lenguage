import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LanguageMark } from "@/components/language-mark";
import { LANGUAGES } from "@/lib/content";
import { recordingsByAuthor } from "@/lib/content/audio-credits";
import { PREGEN_VOICES } from "@/lib/audio-key";

export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l = LANGUAGES.find((x) => x.code === lang);
  return { title: l ? `Audio en ${l.name.toLowerCase()}: créditos` : "Créditos de audio" };
}

/** Quién grabó cada pronunciación humana de un idioma, con su licencia y el archivo original. */
export default async function AudioCreditsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = LANGUAGES.find((x) => x.code === lang);
  if (!l) notFound();
  const groups = recordingsByAuthor(lang);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const voice = PREGEN_VOICES[lang];
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="text-sm"><Link href="/creditos" className="text-primary underline-offset-4 hover:underline">← Créditos y licencias</Link></p>
      <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
        <LanguageMark code={l.code} size={32} /> Audio en {l.name.toLowerCase()}
      </h1>
      <p className="mt-3 text-muted">
        {total.toLocaleString("es")} grabaciones de personas reales (Wikimedia Commons y Lingua Libre) suenan primero.
        {voice
          ? ` Lo que no tiene grabación suena con la voz libre ${voice.voice} (${voice.license}), generada por nosotros con Piper.`
          : " Lo que no tiene grabación suena con la voz de tu dispositivo: todavía no hay una voz libre de uso comercial para este idioma."}
      </p>
      {groups.length === 0 ? (
        <p className="mt-8 card p-6">Aún no hay grabaciones humanas para este idioma.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {groups.map((g) => (
            <li key={`${g.author}|${g.license}`} className="card p-5">
              <h2 className="font-display text-lg font-extrabold">{g.author}</h2>
              <p className="text-sm text-muted">Licencia: {g.license} · {g.items.length} {g.items.length === 1 ? "grabación" : "grabaciones"}</p>
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm" lang={lang} dir={l.rtl ? "rtl" : "ltr"}>
                {g.items.map((r) => (
                  <a key={r.text} href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(r.file.replace(/ /g, "_"))}`} className="underline-offset-4 hover:underline" rel="noopener noreferrer" target="_blank" title={r.file}>
                    {r.text}
                  </a>
                ))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
