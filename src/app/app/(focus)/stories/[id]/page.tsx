import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryReader, type StoryToken } from "@/components/stories/story-reader";
import { vocabFor } from "@/lib/content";
import { getStory } from "@/lib/content/stories";
import { translationOf } from "@/lib/engine/exercises";
import { buildLookupIndex, tokenize, type LookupIndex } from "@/lib/reading/text";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Historia" };

const indexes = new Map<string, LookupIndex>();

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const learner = await requireLearner();
  const { id } = await params;
  const lang = learner.language;
  const story = getStory(lang.code, id);
  if (!story) notFound();
  let idx = indexes.get(lang.code);
  if (!idx) indexes.set(lang.code, (idx = buildLookupIndex(lang.code, vocabFor(lang.code))));
  const byId = new Map(vocabFor(lang.code).map((v) => [v.id, v]));
  // Cada frase en palabras «tocables»: lema y traducción del paquete para guardarlas.
  const tokens: StoryToken[][] = story.lines.map((l) =>
    tokenize(lang.code, l.t, idx!, lang.spaceSeparated).map((t) => {
      const v = t.id ? byId.get(t.id) : undefined;
      return v ? { t: t.t, id: v.id, lemma: v.lemma, tr: translationOf(v, learner.native).slice(0, 2).join(", ") } : { t: t.t };
    }),
  );
  return <StoryReader story={story} tokens={tokens} locale={lang.speechLocale} language={lang.code} languageName={lang.name} rtl={lang.rtl} />;
}
