import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryReader } from "@/components/stories/story-reader";
import { getStory } from "@/lib/content/stories";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Historia" };

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const learner = await requireLearner();
  const { id } = await params;
  const story = getStory(learner.language.code, id);
  if (!story) notFound();
  return <StoryReader story={story} locale={learner.language.speechLocale} language={learner.language.code} languageName={learner.language.name} rtl={learner.language.rtl} />;
}
