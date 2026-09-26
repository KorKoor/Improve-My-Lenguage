import type { Metadata } from "next";
import { LanguageMark } from "@/components/language-mark";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { getLanguage, grammarFor, LANGUAGES, vocabFor } from "@/lib/content";
import Link from "next/link";
import { AfiMessage } from "@/components/afi/afi-message";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { alphabetFor } from "@/lib/content/alphabets";
import { humanRecordings } from "@/lib/content/audio-credits";
import { classicsFor } from "@/lib/content/classics";
import { packMeta } from "@/lib/content/packs";
import { writingFor } from "@/lib/content/writing-system";
import { PREGEN_VOICES } from "@/lib/audio-key";

export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ code: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const l = getLanguage(code);
  if (!l) return {};
  return {
    title: `Aprender ${l.name.toLowerCase()} con un curso adaptativo`,
    description: `Aprende ${l.name.toLowerCase()} (${l.nativeName}) desde el español: diagnóstico de nivel por habilidad, repetición espaciada, análisis de tus errores${alphabetFor(l.code) ? " y, si empiezas de cero, a leer su escritura" : ""}.`,
    openGraph: { title: `Aprender ${l.name.toLowerCase()} · Improve My Languages`, url: `/languages/${l.code}` },
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
  const alphabet = alphabetFor(l.code);
  const writing = writingFor(l.code);
  const meta = packMeta(l.code);
  const human = humanRecordings(l.code).length;
  const voice = PREGEN_VOICES[l.code];
  const classics = classicsFor(l.code);
  const name = l.name.toLowerCase();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ name: "Inicio", path: "/" }, { name: "Idiomas", path: "/languages" }, { name: l.name, path: `/languages/${l.code}` }]} />
      <div className="mt-6"><LanguageMark code={l.code} size={64} /></div>
      <h1 className="mt-3 font-display text-4xl font-extrabold">Aprender {name} con un curso que se adapta a ti</h1>
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
          <section className="mt-10" aria-labelledby="start">
            <h2 id="start" className="font-display text-2xl font-extrabold">{alphabet ? `Si empiezas desde cero: ${alphabet.name.charAt(0).toLowerCase()}${alphabet.name.slice(1)}` : "Cómo empiezas"}</h2>
            <p className="mt-3 leading-relaxed text-muted">
              {alphabet
                ? `${alphabet.intro} Antes de las lecciones aprendes a leer: letras con su sonido, ${l.writingSystems.some((w) => ["hanzi", "kanji", "hiragana", "katakana", "hangul", "arabic"].includes(w)) ? "el orden de los trazos, " : ""}reglas de lectura y tus primeras palabras, con un teclado en pantalla para escribir sin instalar nada.`
                : `${writing?.alphabetNote ?? ""} Antes de las lecciones repasas los sonidos que no existen en español y los signos especiales${writing?.signs.length ? ` (${writing.signs.map((x) => x.g).join(" · ")})` : ""}, y cómo escribirlos en tu móvil o tu ordenador.`}{" "}
              <Link href="/guias/leer-otro-alfabeto" className="text-primary underline underline-offset-4">Cómo funciona la fase de lectura</Link>.
            </p>
            <p className="mt-3 leading-relaxed text-muted">
              ¿Ya sabes algo? Un <Link href="/guias/nivel-mcer" className="text-primary underline underline-offset-4">diagnóstico adaptativo</Link> de unos 5 minutos estima tu nivel en vocabulario, gramática y lectura por separado, y a partir de ahí cada sesión combina tus repasos pendientes, tus errores recurrentes y vocabulario nuevo de tus intereses.
            </p>
          </section>

          {meta && (
            <section className="mt-10" aria-labelledby="vocab-levels">
              <h2 id="vocab-levels" className="font-display text-2xl font-extrabold">Vocabulario por nivel</h2>
              <p className="mt-2 text-sm text-muted">Palabras de {name} con traducción al español, ordenadas por frecuencia de uso real (fuentes abiertas: Wiktionary, wordfreq, Tatoeba).</p>
              <dl className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {(["A1", "A2", "B1", "B2", "C1"] as const).map((c) => (
                  <div key={c} className="card p-3 text-center"><dt className="text-xs text-muted">{c}</dt><dd className="font-display text-lg font-extrabold tabular-nums">{(meta.levels[c] ?? 0).toLocaleString("es")}</dd></div>
                ))}
                <div className="card bg-primary-soft/60 p-3 text-center"><dt className="text-xs text-muted">Total</dt><dd className="font-display text-lg font-extrabold tabular-nums">{meta.count.toLocaleString("es")}</dd></div>
              </dl>
            </section>
          )}

          <section className="mt-10" aria-labelledby="sound">
            <h2 id="sound" className="font-display text-2xl font-extrabold">Cómo suena</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Cada palabra se puede escuchar. Primero suenan grabaciones de personas reales ({human.toLocaleString("es")} en {name}, de Wikimedia Commons y Lingua Libre)
              {voice ? `; lo demás, con una voz libre (${voice.voice})` : "; lo demás, con la voz de tu dispositivo"}. <Link href={`/creditos/audio/${l.code}`} className="text-primary underline underline-offset-4">Quién grabó cada audio</Link>.
            </p>
          </section>

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
          {classics.length > 0 && (
            <section className="mt-10" aria-labelledby="classics">
              <h2 id="classics" className="font-display text-2xl font-extrabold">Clásicos para leer en {name}</h2>
              <p className="mt-2 text-sm text-muted">Textos originales de dominio público (Wikisource), con traducción al tocar cada palabra.</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {classics.map((c) => (
                  <li key={c.title} className="card px-4 py-3 text-sm"><span className="font-semibold" lang={l.code}>{c.title}</span><span className="block text-muted">{c.author}</span></li>
                ))}
              </ul>
            </section>
          )}
          <div className="card mt-10 p-6">
            <AfiMessage mood="waving" size={60}>¿Empezamos con {name}? Primero vemos qué sabes; después, cada sesión va a lo que necesitas.</AfiMessage>
            <ButtonLink href="/login?mode=signup" size="lg" className="mt-4">Empezar con {name}</ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}
