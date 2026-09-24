import { ArrowLeft, Lightbulb } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WordActions } from "@/components/vocab/word-actions";
import { SpeakButton } from "@/components/speak-button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getVocab, topicLabel } from "@/lib/content";
import { translationOf } from "@/lib/engine/exercises";
import { currentRetrievability } from "@/lib/engine/fsrs";
import { mastery } from "@/lib/engine/progress";
import { getKnowledge } from "@/lib/db/repositories";
import { knowledgeToCard } from "@/lib/services/learning";
import { requireLearner } from "@/lib/services/viewer";

const POS_ES: Record<string, string> = { noun: "sustantivo", verb: "verbo", adjective: "adjetivo", adverb: "adverbio", pronoun: "pronombre", preposition: "preposición", conjunction: "conjunción", determiner: "determinante", interjection: "interjección", phrase: "expresión", particle: "partícula" };
const REGISTER_ES: Record<string, string> = { neutral: "neutro", formal: "formal", informal: "informal", technical: "técnico", slang: "coloquial" };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const v = getVocab(decodeURIComponent((await params).id));
  return { title: v ? v.lemma : "Palabra" };
}

export default async function WordPage({ params }: { params: Promise<{ id: string }> }) {
  const learner = await requireLearner();
  const v = getVocab(decodeURIComponent((await params).id));
  if (!v || v.language !== learner.language.code) notFound();
  const [k] = await getKnowledge(learner.ul.id, [v.id]);
  const now = new Date();
  const card = knowledgeToCard(k, now);
  const locale = learner.language.speechLocale;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/app/vocabulary" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text"><ArrowLeft size={16} aria-hidden /> Vocabulario</Link>
      <Card className="p-7">
        <div className="flex items-start gap-4">
          <div className="flex-1" lang={v.language} dir={learner.language.rtl ? "rtl" : "ltr"}>
            <h1 className="font-display text-5xl font-extrabold">{v.lemma}</h1>
            <p className="mt-2 text-muted">{[v.reading, v.ipa, POS_ES[v.pos] ?? v.pos].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="flex gap-2">
            <SpeakButton text={v.lemma} locale={locale} size={52} />
            <SpeakButton text={v.lemma} locale={locale} rate={0.6} size={40} label="Escuchar despacio" />
          </div>
        </div>
        <p className="mt-5 text-2xl font-semibold text-primary">{translationOf(v, learner.native).join(", ")}</p>
        {v.definition && <p className="mt-2 text-muted" lang={v.language}>{v.definition}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip>{v.cefr}</Chip>
          <Chip tone="muted">Registro {REGISTER_ES[v.register]}</Chip>
          {v.topics.map((t) => <Chip key={t} tone="muted">{topicLabel(t)}</Chip>)}
        </div>
        <div className="mt-6"><WordActions id={v.id} status={k?.status ?? null} /></div>
      </Card>

      {v.usageNote && (
        <Card className="flex gap-3 bg-warning-soft"><Lightbulb className="mt-0.5 shrink-0 text-warning" aria-hidden /><p>{v.usageNote}</p></Card>
      )}

      <Card>
        <h2 className="font-display text-lg font-extrabold">En contexto</h2>
        <ul className="mt-4 space-y-4">
          {v.examples.map((e) => (
            <li key={e.text} className="flex items-start gap-3 rounded-2xl bg-surface-muted p-4">
              <div className="flex-1">
                <p className="text-lg" lang={v.language}>{e.text}</p>
                {e.reading && <p className="text-sm text-muted">{e.reading}</p>}
                {e.translation?.[learner.native] && <p className="mt-1 text-sm text-muted">{e.translation[learner.native]}</p>}
              </div>
              <SpeakButton text={e.text} locale={locale} size={36} label="Escuchar ejemplo" />
            </li>
          ))}
        </ul>
        {(v.synonyms?.length || v.antonyms?.length) ? (
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {v.synonyms?.length ? <div><dt className="font-semibold">Sinónimos</dt><dd className="text-muted" lang={v.language}>{v.synonyms.join(", ")}</dd></div> : null}
            {v.antonyms?.length ? <div><dt className="font-semibold">Antónimos</dt><dd className="text-muted" lang={v.language}>{v.antonyms.join(", ")}</dd></div> : null}
          </dl>
        ) : null}
      </Card>

      <Card>
        <h2 className="font-display text-lg font-extrabold">En tu memoria</h2>
        {k && k.reps > 0 ? (
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="text-muted">Dominio</dt><dd className="mt-1"><ProgressBar value={mastery(card, now)} color="var(--skill-vocabulary)" label="Dominio" /><span className="text-xs text-muted">{Math.round(mastery(card, now) * 100)} %</span></dd></div>
            <div><dt className="text-muted">Probabilidad de recordarla hoy</dt><dd className="font-display text-xl font-extrabold">{Math.round(currentRetrievability(card, now) * 100)} %</dd></div>
            <div><dt className="text-muted">Próximo repaso</dt><dd className="font-display text-xl font-extrabold">{k.dueAt <= now ? "Hoy" : new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: learner.profile.timezone }).format(k.dueAt)}</dd></div>
            <div><dt className="text-muted">Aciertos / fallos</dt><dd className="font-semibold">{k.correctCount} / {k.incorrectCount}</dd></div>
            <div><dt className="text-muted">Estabilidad</dt><dd className="font-semibold">{card.stability < 1 ? "< 1 día" : `${Math.round(card.stability)} días`}</dd></div>
            <div><dt className="text-muted">Tiempo medio de respuesta</dt><dd className="font-semibold">{k.avgResponseMs ? `${(k.avgResponseMs / 1000).toFixed(1)} s` : "—"}</dd></div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted">Aún no la has practicado. Guárdala y aparecerá en tus próximas sesiones.</p>
        )}
      </Card>
    </div>
  );
}
