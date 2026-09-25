import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { WordActions } from "@/components/vocab/word-actions";
import { SpeakButton } from "@/components/speak-button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TOPICS, topicLabel, vocabFor } from "@/lib/content";
import { CEFR_LEVELS } from "@/lib/content/types";
import { translationOf } from "@/lib/engine/exercises";
import { mastery } from "@/lib/engine/progress";
import { normalize, stripDiacritics } from "@/lib/engine/evaluate";
import { getAllKnowledge } from "@/lib/db/repositories";
import { knowledgeToCard } from "@/lib/services/learning";
import { requireLearner } from "@/lib/services/viewer";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Vocabulario" };

const FILTERS = [
  ["all", "Todas"],
  ["learning", "Aprendiendo"],
  ["new", "Nuevas"],
  ["saved", "Guardadas"],
  ["difficult", "Difíciles"],
  ["known", "Sabidas"],
] as const;

export default async function VocabularyPage({ searchParams }: { searchParams: Promise<{ q?: string; topic?: string; level?: string; filter?: string; page?: string }> }) {
  const learner = await requireLearner();
  const sp = await searchParams;
  const now = new Date();
  const knowledge = new Map((await getAllKnowledge(learner.ul.id)).map((k) => [k.itemId, k]));
  const q = stripDiacritics(normalize(sp.q ?? ""));
  const filter = FILTERS.some(([f]) => f === sp.filter) ? sp.filter! : "all";

  const words = vocabFor(learner.language.code)
    .filter((v) => !sp.topic || v.topics.includes(sp.topic))
    .filter((v) => !sp.level || v.cefr === sp.level)
    .filter((v) => {
      if (!q) return true;
      const hay = stripDiacritics(normalize([v.lemma, v.reading ?? "", ...translationOf(v, learner.native)].join(" ")));
      return hay.includes(q);
    })
    .filter((v) => {
      const k = knowledge.get(v.id);
      switch (filter) {
        case "learning": return !!k && k.reps > 0 && k.status !== "known";
        case "new": return !k || k.reps === 0;
        case "saved": return k?.status === "saved";
        case "difficult": return k?.status === "difficult";
        case "known": return k?.status === "known";
        default: return true;
      }
    });

  const PAGE_SIZE = 48;
  const pages = Math.max(1, Math.ceil(words.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1));
  const shown = words.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    // Cambiar un filtro vuelve a la página 1.
    const merged = { q: sp.q, topic: sp.topic, level: sp.level, filter: sp.filter, page: undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/app/vocabulary?${p.toString()}`;
  };
  const topicsInLang = TOPICS.filter((t) => vocabFor(learner.language.code).some((v) => v.topics.includes(t.id)));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold">Vocabulario</h1>
        <p className="mt-1 text-muted">Cada palabra con contexto, pronunciación y su estado en tu memoria. Ordenadas por frecuencia de uso: las primeras son las que más vas a oír.</p>
      </header>

      <form role="search" className="flex gap-2" action="/app/vocabulary">
        <label className="relative flex-1">
          <span className="sr-only">Buscar palabra o traducción</span>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={sp.q} placeholder="Buscar palabra o traducción…" className="h-12 w-full rounded-2xl border border-border bg-surface pl-11 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft" />
        </label>
        {sp.topic && <input type="hidden" name="topic" value={sp.topic} />}
        {sp.level && <input type="hidden" name="level" value={sp.level} />}
        {sp.filter && <input type="hidden" name="filter" value={sp.filter} />}
      </form>

      <nav aria-label="Filtros" className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(([f, label]) => (
            <Link key={f} href={qs({ filter: f === "all" ? undefined : f })} aria-current={filter === f ? "true" : undefined} className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium", filter === f ? "bg-primary text-on-primary" : "bg-surface-muted text-muted hover:text-text")}>{label}</Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={qs({ level: undefined })} className={cn("rounded-full border px-3 py-1", !sp.level ? "border-primary text-primary" : "border-border text-muted")}>Todos los niveles</Link>
          {CEFR_LEVELS.map((l) => <Link key={l} href={qs({ level: l })} className={cn("rounded-full border px-3 py-1", sp.level === l ? "border-primary text-primary" : "border-border text-muted")}>{l}</Link>)}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={qs({ topic: undefined })} className={cn("rounded-full border px-3 py-1", !sp.topic ? "border-primary text-primary" : "border-border text-muted")}>Todos los temas</Link>
          {topicsInLang.map((t) => <Link key={t.id} href={qs({ topic: t.id })} className={cn("rounded-full border px-3 py-1", sp.topic === t.id ? "border-primary text-primary" : "border-border text-muted")}>{t.emoji} {t.label}</Link>)}
        </div>
      </nav>

      <p className="text-sm text-muted" role="status">
        {words.length.toLocaleString("es")} {words.length === 1 ? "palabra" : "palabras"}
        {pages > 1 ? ` · página ${page} de ${pages}` : ""}
      </p>

      {words.length === 0 ? (
        <Card><EmptyState title="Sin resultados">Prueba con otra búsqueda o quita algún filtro.</EmptyState></Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((v) => {
            const k = knowledge.get(v.id);
            const m = k ? mastery(knowledgeToCard(k, now), now) : 0;
            return (
              <li key={v.id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-start gap-2">
                  <Link href={`/app/vocabulary/${encodeURIComponent(v.id)}`} className="flex-1">
                    <p className="font-display text-xl font-extrabold hover:text-primary" lang={v.language}>{v.lemma}</p>
                    <p className="text-xs text-muted">{[v.reading, v.ipa].filter(Boolean).join(" · ")}</p>
                  </Link>
                  <SpeakButton text={v.lemma} audioUrl={v.audioUrl} locale={learner.language.speechLocale} size={34} />
                </div>
                <p className="text-sm font-medium">{translationOf(v, learner.native).join(", ")}</p>
                {v.examples[0] && <p className="line-clamp-2 text-sm text-muted" lang={v.language}>{v.examples[0].text}</p>}
                <div className="flex flex-wrap gap-1.5">
                  <Chip tone="muted">{v.cefr}</Chip>
                  {v.topics.slice(0, 2).map((t) => <Chip key={t} tone="muted">{topicLabel(t)}</Chip>)}
                </div>
                <div className="mt-auto space-y-3 pt-1">
                  {k && k.reps > 0 ? (
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="w-20">Dominio</span>
                      <ProgressBar value={m} color="var(--skill-vocabulary)" label={`Dominio de ${v.lemma}`} className="flex-1" />
                      <span className="w-9 text-right">{Math.round(m * 100)} %</span>
                    </div>
                  ) : null}
                  <WordActions id={v.id} status={k?.status ?? null} compact />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-center gap-2">
          {page > 1 ? (
            <Link href={qs({ page: String(page - 1) })} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-muted">← Anterior</Link>
          ) : null}
          <span className="px-2 text-sm text-muted">{page} / {pages}</span>
          {page < pages ? (
            <Link href={qs({ page: String(page + 1) })} className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-muted">Siguiente →</Link>
          ) : null}
        </nav>
      )}
    </div>
  );
}
