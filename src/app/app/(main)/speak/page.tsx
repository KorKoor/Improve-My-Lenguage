import type { Metadata } from "next";
import { SpeakingRunner } from "@/components/speaking/runner";
import { requireLearner } from "@/lib/services/viewer";
import { PairsTrainer } from "@/components/speaking/pairs-trainer";
import { pairSetsFor } from "@/lib/content/minimal-pairs";
import { ToneTrainer, type ToneItem } from "@/components/speaking/tone-trainer";
import { alphabetFor } from "@/lib/content/alphabets";
import { vocabFor } from "@/lib/content";
import { translationOf } from "@/lib/engine/exercises";
import { pinyinTone } from "@/lib/pitch";

/** Sílabas para entrenar tonos: mā má mǎ mà y palabras frecuentes de una sílaba. */
function toneItems(): ToneItem[] {
  const out: ToneItem[] = [];
  for (const l of alphabetFor("zh")?.groups.find((g) => g.id === "zh-tones")?.letters ?? []) {
    const t = pinyinTone(l.r);
    if (t) out.push({ hanzi: l.g, pinyin: l.r, tone: t, es: (l.hint ?? "").split(" = ").pop() ?? "" });
  }
  const seen = new Set(out.map((x) => x.hanzi));
  for (const v of vocabFor("zh").slice(0, 400)) {
    if ([...v.lemma].length !== 1 || seen.has(v.lemma) || "的了吗呢吧啊".includes(v.lemma)) continue;
    const py = v.reading?.split(" (")[0]?.trim() ?? "";
    const t = pinyinTone(py);
    if (!t) continue;
    seen.add(v.lemma);
    out.push({ hanzi: v.lemma, pinyin: py, tone: t, es: translationOf(v, "es").slice(0, 2).join(", ") });
    if (out.length >= 16) break;
  }
  return out;
}

export const metadata: Metadata = { title: "Pronunciación" };

export default async function SpeakPage() {
  const learner = await requireLearner();
  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Pronunciación</h1>
        <p className="mt-1 max-w-2xl text-muted">Lee frases reales en voz alta y comprueba qué se entiende. Perder el miedo a hablar empieza aquí.</p>
      </header>
      <SpeakingRunner languageName={learner.language.name} />
      {learner.language.code === "zh" && (
        <section aria-labelledby="tones-title" className="space-y-3">
          <h2 id="tones-title" className="font-display text-xl font-extrabold">Los tonos, con tu propia voz</h2>
          <p className="max-w-2xl text-sm text-muted">Escucha la sílaba, grábate diciéndola y compara tu curva de tono con la del modelo: ¿sube, baja o se queda plana?</p>
          <ToneTrainer items={toneItems()} locale={learner.language.speechLocale} />
        </section>
      )}
      {pairSetsFor(learner.language.code).length > 0 && (
        <section aria-labelledby="pairs-title" className="space-y-3">
          <h2 id="pairs-title" className="font-display text-xl font-extrabold">Entrena el oído: pares mínimos</h2>
          <p className="max-w-2xl text-sm text-muted">Dos palabras que sólo cambian en un sonido que en español no existe. Si tu oído las distingue, tu boca aprenderá a decirlas.</p>
          <PairsTrainer sets={pairSetsFor(learner.language.code)} locale={learner.language.speechLocale} language={learner.language.code} />
        </section>
      )}
    </div>
  );
}
