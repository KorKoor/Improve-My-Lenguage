import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListenGame } from "@/components/games/listen";
import { MemoryGame } from "@/components/games/memory";
import { OrderGame } from "@/components/games/order";
import { RainGame } from "@/components/games/rain";
import { gameMeta } from "@/lib/engine/games";
import { LATIN_OPTIONAL } from "@/lib/engine/phase-zero";
import { gamePool } from "@/lib/services/games";
import { requireLearner } from "@/lib/services/viewer";
import type { LanguageCode } from "@/lib/content/types";

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }): Promise<Metadata> {
  const g = gameMeta((await params).game);
  return { title: g ? g.title : "Minijuego" };
}

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const meta = gameMeta((await params).game);
  if (!meta) notFound();
  const learner = await requireLearner();
  const { words, sentences } = await gamePool({
    ulId: learner.ul.id,
    language: learner.language.code,
    native: learner.native as LanguageCode,
    latin: Boolean(learner.profile.latinScript) && LATIN_OPTIONAL.has(learner.language.code),
  });
  const props = { lang: learner.language.code, locale: learner.language.speechLocale, dir: learner.language.rtl ? ("rtl" as const) : ("ltr" as const) };
  return (
    <div className="flex flex-1 flex-col pb-6">
      {meta.id === "memory" && <MemoryGame words={words} {...props} />}
      {meta.id === "rain" && <RainGame words={words} {...props} />}
      {meta.id === "listen" && <ListenGame words={words} {...props} />}
      {meta.id === "order" && <OrderGame sentences={sentences} {...props} />}
    </div>
  );
}
