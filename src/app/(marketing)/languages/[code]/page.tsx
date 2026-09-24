import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { getLanguage, grammarFor, LANGUAGES, vocabFor } from "@/lib/content";

export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ code: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const l = getLanguage(code);
  if (!l) return {};
  return {
    title: `Aprender ${l.name.toLowerCase()}`,
    description: `Aprende ${l.name.toLowerCase()} (${l.nativeName}) con diagnóstico adaptativo, repetición espaciada y análisis de errores.`,
    alternates: { canonical: `/languages/${l.code}` },
  };
}

const WRITING: Record<string, string> = { latin: "latino", cyrillic: "cirílico", arabic: "árabe", hangul: "hangul", hiragana: "hiragana", katakana: "katakana", kanji: "kanji", hanzi: "hanzi", greek: "griego", devanagari: "devanagari" };

export default async function LanguagePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const l = getLanguage(code);
  if (!l) notFound();
  const words = vocabFor(l.code).slice(0, 6);
  const grammar = grammarFor(l.code);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="text-5xl" aria-hidden>{l.flagEmoji}</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">Aprender {l.name.toLowerCase()}</h1>
      <p className="mt-1 text-lg text-muted" lang={l.code} dir={l.rtl ? "rtl" : "ltr"}>{l.nativeName}</p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-4"><dt className="text-xs text-muted">Familia</dt><dd className="font-semibold">{l.family}</dd></div>
        <div className="card p-4"><dt className="text-xs text-muted">Escritura</dt><dd className="font-semibold">{l.writingSystems.map((w) => WRITING[w] ?? w).join(", ")}{l.rtl ? " · derecha a izquierda" : ""}</dd></div>
        <div className="card p-4"><dt className="text-xs text-muted">Dificultad para hispanohablantes</dt><dd className="font-semibold">{"●".repeat(l.difficulty)}{"○".repeat(5 - l.difficulty)} <span className="sr-only">{l.difficulty} de 5</span></dd></div>
      </dl>

      {l.status === "planned" ? (
        <div className="card mt-8 p-6">
          <Chip tone="muted">Próximamente</Chip>
          <p className="mt-3 text-muted">Estamos preparando el contenido de {l.name.toLowerCase()}. La arquitectura ya lo soporta; falta el material revisado por personas.</p>
        </div>
      ) : (
        <>
          {words.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-extrabold">Palabras de ejemplo</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {words.map((w) => (
                  <li key={w.id} className="card p-4">
                    <p className="font-display text-lg font-extrabold" lang={l.code}>{w.lemma} {w.reading ? <span className="text-sm font-medium text-muted">{w.reading}</span> : null}</p>
                    <p className="text-sm text-muted">{w.translations.es?.join(", ")}</p>
                    {w.examples[0] && <p className="mt-2 text-sm" lang={l.code}>“{w.examples[0].text}”</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {grammar.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-extrabold">Temas de gramática</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {grammar.map((g) => <li key={g.id}><Chip tone="primary">{g.cefr} · {g.title}</Chip></li>)}
              </ul>
            </section>
          )}
          <ButtonLink href="/login?mode=signup" size="lg" className="mt-10">Empezar con {l.name.toLowerCase()}</ButtonLink>
        </>
      )}
    </div>
  );
}
