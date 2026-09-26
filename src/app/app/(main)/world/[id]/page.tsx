import type { Metadata } from "next";
import Link from "next/link";
import { Afi } from "@/components/afi/afi";
import { WorldLesson } from "@/components/world/lesson";
import { readerForWorld } from "@/lib/services/reading";
import { requireLearner } from "@/lib/services/viewer";
import { getWorldLesson } from "@/lib/services/world";

export const metadata: Metadata = { title: "Tu lección", robots: { index: false } };

export default async function WorldLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const learner = await requireLearner();
  const pack = await getWorldLesson(id);
  if (!pack) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <Afi size={110} mood="confused" />
        <h1 className="font-display text-2xl font-extrabold">Esta lección ya no está</h1>
        <p className="text-muted">Las lecciones se guardan 30 días. Créala otra vez en un momento.</p>
        <Link href="/app/world" className="font-semibold text-primary underline underline-offset-4">Aprende con el mundo</Link>
      </div>
    );
  }
  const reader = await readerForWorld(learner, pack.title, pack.reading, pack.source?.label ?? "Afi");
  return (
    <WorldLesson
      id={id}
      pack={pack}
      reader={reader}
      lang={learner.language.code}
      locale={learner.language.speechLocale}
      dir={learner.language.rtl ? "rtl" : "ltr"}
    />
  );
}
