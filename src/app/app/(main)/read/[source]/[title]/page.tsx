import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/reading/reader";
import { isWikiSource } from "@/lib/reading/wiki";
import { readerForArticle } from "@/lib/services/reading";
import { requireLearner } from "@/lib/services/viewer";

export async function generateMetadata({ params }: { params: Promise<{ title: string }> }): Promise<Metadata> {
  return { title: decodeURIComponent((await params).title).slice(0, 80) };
}

export default async function ArticlePage({ params }: { params: Promise<{ source: string; title: string }> }) {
  const learner = await requireLearner();
  const { source, title } = await params;
  if (!isWikiSource(source)) notFound();
  const data = await readerForArticle(learner, source, decodeURIComponent(title));
  if (!data) notFound();
  return <Reader data={data} />;
}
