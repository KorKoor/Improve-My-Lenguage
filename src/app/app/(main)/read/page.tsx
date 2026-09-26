import { ClipboardPaste, History, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { listReadings } from "@/lib/db/repositories";
import { classicReadings, gradedReadings, readingRecommendations } from "@/lib/services/reading";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Lecturas" };

function fitLabel(coverage: number): { text: string; tone: "success" | "warning" | "primary" | "muted" } {
  if (coverage >= 0.985) return { text: "Fácil", tone: "muted" };
  if (coverage >= 0.9) return { text: "Ideal para ti", tone: "success" };
  if (coverage >= 0.8) return { text: "Un reto", tone: "warning" };
  return { text: "Difícil", tone: "primary" };
}

export default async function ReadPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const learner = await requireLearner();
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80);
  const [{ cards }, history, graded, classics] = await Promise.all([
    readingRecommendations(learner, q),
    listReadings(learner.ul.id, 8),
    q ? Promise.resolve([]) : gradedReadings(learner),
    q ? Promise.resolve([]) : classicReadings(learner),
  ]);

  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Lecturas</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Textos reales de Wikipedia, Wikinoticias y Wikiviajes elegidos para tu nivel: lo ideal es entender alrededor del 95 % y aprender el resto tocando cada palabra.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <form role="search" action="/app/read" className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="read-q" className="sr-only">Buscar un tema</label>
          <input
            id="read-q"
            name="q"
            defaultValue={q}
            placeholder={`Busca un tema en ${learner.language.name.toLowerCase()}…`}
            className="h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft"
          />
        </form>
        <Link href="/app/read/own" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 font-semibold text-primary hover:bg-surface-muted">
          <ClipboardPaste size={18} aria-hidden /> Pegar mi texto
        </Link>
      </div>

      {graded.length > 0 && (
        <section aria-labelledby="graded-title" className="space-y-3">
          <div>
            <h2 id="graded-title" className="font-display text-xl font-extrabold">Lecturas graduadas</h2>
            <p className="text-sm text-muted">Frases reales escritas por personas, elegidas porque ya conoces casi todas sus palabras. Con traducción a un toque.</p>
          </div>
          <ul className="stagger flex gap-3 overflow-x-auto pb-2">
            {graded.map((g) => (
              <li key={g.topic} className="w-64 shrink-0">
                <Link href={`/app/read/graded/${g.topic}`} className="card lift flex h-full flex-col gap-2 bg-primary-soft p-5 hover:border-primary">
                  <div className="flex items-center gap-2"><Chip>{g.level}</Chip><Chip tone="success">Conoces ~{Math.round(g.coverage * 100)} %</Chip></div>
                  <p className="font-display text-lg font-extrabold">{g.title}</p>
                  <p className="text-sm text-muted">{g.sentences} frases · se renuevan cada día</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {classics.length > 0 && (
        <section aria-labelledby="classics-title" className="space-y-3">
          <div>
            <h2 id="classics-title" className="font-display text-xl font-extrabold">Clásicos de dominio público</h2>
            <p className="text-sm text-muted">Fábulas y cuentos originales de Wikisource, ordenados por lo bien que encajan con tu vocabulario. Algunos usan ortografía antigua.</p>
          </div>
          <ul className="stagger flex gap-3 overflow-x-auto pb-2">
            {classics.map((c) => {
              const fit = fitLabel(c.analysis.coverage);
              return (
                <li key={c.title} className="w-72 shrink-0">
                  <Link href={`/app/read/classic/${encodeURIComponent(c.title)}`} className="card lift flex h-full flex-col gap-2 p-5 hover:border-primary">
                    <div className="flex flex-wrap items-center gap-2"><Chip>{c.analysis.level}</Chip><Chip tone={fit.tone}>{fit.text}</Chip></div>
                    <p className="font-display text-lg font-extrabold leading-snug" lang={learner.language.code}>{c.title}</p>
                    <p className="text-xs text-muted">{c.author}{c.excerpt ? " · comienzo" : ""}</p>
                    <p className="line-clamp-3 text-sm text-muted" lang={learner.language.code}>{c.preview}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {cards.length > 0 && <h2 className="font-display text-xl font-extrabold">Artículos reales</h2>}
      {cards.length === 0 ? (
        <Card>
          <EmptyState title="No pudimos traer lecturas ahora">
            Las fuentes públicas no respondieron o no hay resultados para esa búsqueda. Prueba con otro tema o pega tu propio texto.
          </EmptyState>
        </Card>
      ) : (
        <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => {
            const fit = fitLabel(c.analysis.coverage);
            return (
              <li key={`${c.source}-${c.title}`}>
                <Link href={`/app/read/${c.source}/${encodeURIComponent(c.title)}`} className="card lift flex h-full flex-col gap-3 p-5 hover:border-primary">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip>{c.analysis.level}</Chip>
                    <Chip tone={fit.tone}>{fit.text}</Chip>
                    <span className="ml-auto text-xs text-muted">{c.sourceLabel}</span>
                  </div>
                  <h2 className="font-display text-lg font-extrabold leading-snug" lang={learner.language.code}>{c.title}</h2>
                  <p className="line-clamp-4 text-sm text-muted" lang={learner.language.code}>{c.extract}</p>
                  <p className="mt-auto text-xs text-muted">Conoces ~{Math.round(c.analysis.coverage * 100)} % · {c.analysis.newWords.length} palabras nuevas útiles</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader title="Leíste recientemente" icon={<History size={18} className="text-muted" aria-hidden />} />
          <ul className="divide-y divide-border/70">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-2.5 text-sm">
                <Chip tone="muted">{h.level}</Chip>
                <Link href={`/app/read/${h.source}/${encodeURIComponent(h.title)}`} className="flex-1 truncate font-medium hover:text-primary">{h.title}</Link>
                {h.total ? <span className="text-muted">{h.correct}/{h.total}</span> : null}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <p className="text-xs text-muted">Textos de proyectos Wikimedia bajo licencia CC BY-SA 4.0; los clásicos de Wikisource son de dominio público. Siempre enlazamos a la fuente original.</p>
    </div>
  );
}
