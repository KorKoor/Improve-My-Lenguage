import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpeakButton } from "@/components/speak-button";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { getGrammar } from "@/lib/content";
import { requireLearner } from "@/lib/services/viewer";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const g = getGrammar(decodeURIComponent((await params).id));
  return { title: g?.title ?? "Gramática" };
}

export default async function GrammarDetail({ params }: { params: Promise<{ id: string }> }) {
  const learner = await requireLearner();
  const g = getGrammar(decodeURIComponent((await params).id));
  if (!g || g.language !== learner.language.code) notFound();
  const lang = g.language;
  const locale = learner.language.speechLocale;
  const practice = `/app/session?focus=grammar:${encodeURIComponent(g.id)}&minutes=5`;
  const verbose = learner.profile.explanationDepth !== "brief";

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/app/grammar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text"><ArrowLeft size={16} aria-hidden /> Gramática</Link>
      <header>
        <Chip>{g.cefr}</Chip>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{g.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">{g.summary}</p>
        <ButtonLink href={practice} className="mt-5">Practicar 5 min <ArrowRight size={16} aria-hidden /></ButtonLink>
      </header>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Cuándo usarlo</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">{g.whenToUse.map((w) => <li key={w}>{w}</li>)}</ul>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Cómo se forma</h2>
        <ul className="mt-3 space-y-2">{g.formation.map((f) => <li key={f} className="rounded-xl bg-surface-muted px-4 py-2.5 font-medium">{f}</li>)}</ul>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Errores comunes</h2>
        <ul className="mt-4 space-y-4">
          {g.commonMistakes.map((m) => (
            <li key={m.wrong} className="grid gap-2 sm:grid-cols-2">
              <p className="rounded-xl bg-danger-soft px-4 py-3" lang={lang}><span className="font-bold text-danger-ink">✗ </span>{m.wrong}</p>
              <p className="rounded-xl bg-success-soft px-4 py-3" lang={lang}><span className="font-bold text-success-ink">✓ </span>{m.right}</p>
              {verbose && <p className="text-sm text-muted sm:col-span-2">{m.why}</p>}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-extrabold">Ejemplos</h2>
        <ul className="mt-4 space-y-3">
          {g.examples.map((e) => (
            <li key={e.text} className="flex items-start gap-3 rounded-2xl bg-surface-muted p-4">
              <div className="flex-1">
                <p className="text-lg" lang={lang}>{e.text}</p>
                {e.reading && <p className="text-sm text-muted">{e.reading}</p>}
                {e.translation?.[learner.native] && <p className="text-sm text-muted">{e.translation[learner.native]}</p>}
              </div>
              <SpeakButton text={e.text} locale={locale} size={36} label="Escuchar ejemplo" />
            </li>
          ))}
        </ul>
      </Card>

      {g.contrasts.length > 0 && (
        <Card>
          <h2 className="font-display text-xl font-extrabold">Contraste</h2>
          <ul className="mt-4 space-y-4">
            {g.contrasts.map((c) => (
              <li key={c.a}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <p className="rounded-xl border border-border px-4 py-3" lang={lang}>{c.a}</p>
                  <p className="rounded-xl border border-border px-4 py-3" lang={lang}>{c.b}</p>
                </div>
                <p className="mt-2 text-sm text-muted">{c.explanation}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="flex flex-col items-start gap-3 bg-primary-soft sm:flex-row sm:items-center">
        <p className="flex-1 font-semibold">{g.exercises.length} ejercicios adaptados a tu nivel te esperan.</p>
        <ButtonLink href={practice}>Practicar ahora</ButtonLink>
      </Card>
    </article>
  );
}
