import Link from "next/link";
import { POS_ES } from "@/components/app/labels";
import { SpeakButton } from "@/components/speak-button";
import { WordActions } from "@/components/vocab/word-actions";
import type { WordCard } from "@/lib/engine/session-builder";

/** Palabra del día: nueva, justo por encima de tu nivel, con ejemplo real. */
export function WordOfDay({ word, locale, language }: { word: WordCard; locale: string; language: string }) {
  return (
    <section className="card relative overflow-hidden p-5" aria-labelledby="wotd-title">
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-[var(--skill-vocabulary)] opacity-10" />
      <p id="wotd-title" className="text-[11px] font-bold uppercase tracking-wider text-muted">✨ Palabra del día</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <Link href={`/app/vocabulary/${encodeURIComponent(word.id)}`} lang={language} className="font-display text-2xl font-extrabold hover:text-primary">
            {word.lemma}
          </Link>
          <p className="text-xs text-muted">
            {[word.reading, word.ipa, POS_ES[word.pos] ?? word.pos].filter(Boolean).join(" · ")}
          </p>
        </div>
        <SpeakButton text={word.lemma} locale={locale} audioUrl={word.audioUrl} size={44} label={`Escuchar «${word.lemma}»`} />
      </div>
      <p className="mt-2 font-semibold">{word.translation.slice(0, 3).join(", ")}</p>
      {word.example && (
        <blockquote className="mt-3 rounded-xl bg-surface-muted p-3 text-sm">
          <p lang={language}>{word.example.text}</p>
          {word.example.translation && <p className="mt-1 text-muted">{word.example.translation}</p>}
        </blockquote>
      )}
      <div className="mt-3">
        <WordActions id={word.id} status={null} compact />
      </div>
    </section>
  );
}
