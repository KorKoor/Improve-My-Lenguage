import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/reading/reader";
import { TOPICS } from "@/lib/content";
import { readerForGraded } from "@/lib/services/reading";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Lectura graduada" };

export default async function GradedPage({ params }: { params: Promise<{ topic: string }> }) {
  const learner = await requireLearner();
  const { topic } = await params;
  if (topic !== "all" && !TOPICS.some((t) => t.id === topic)) notFound();
  const data = await readerForGraded(learner, topic);
  if (!data) notFound();
  return <Reader data={data} />;
}
