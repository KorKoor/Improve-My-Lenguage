import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/reading/reader";
import { readerForClassic } from "@/lib/services/reading";
import { requireLearner } from "@/lib/services/viewer";

export async function generateMetadata({ params }: { params: Promise<{ title: string }> }): Promise<Metadata> {
  return { title: decodeURIComponent((await params).title).slice(0, 80) };
}

/** Un clásico de dominio público (Wikisource) en el lector: tocar = traducir y oír. */
export default async function ClassicPage({ params }: { params: Promise<{ title: string }> }) {
  const learner = await requireLearner();
  const { title } = await params;
  const data = await readerForClassic(learner, decodeURIComponent(title));
  if (!data) notFound();
  return <Reader data={data} />;
}
