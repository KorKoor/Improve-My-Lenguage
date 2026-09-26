"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import type { Tone } from "@/lib/pitch";
import { PitchCompare } from "./pitch-compare";

export interface ToneItem {
  hanzi: string;
  pinyin: string;
  tone: Tone;
  es: string;
}

/** Tonos del chino: escucha, di la sílaba y mira si tu curva sube, baja o se queda plana. */
export function ToneTrainer({ items, locale }: { items: ToneItem[]; locale: string }) {
  const [i, setI] = useState(0);
  const it = items[i]!;
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-muted">Sílaba {i + 1} de {items.length}</p>
      <div className="mt-2 flex items-center gap-4">
        <span className="font-display text-5xl font-extrabold" lang="zh">{it.hanzi}</span>
        <span>
          <span className="block font-display text-2xl font-extrabold text-primary" lang="zh-Latn">{it.pinyin}</span>
          <span className="block text-sm text-muted">{it.es}</span>
        </span>
        <SpeakButton text={it.hanzi} locale={locale} className="ml-auto" label={`Escuchar ${it.pinyin}`} />
      </div>
      <PitchCompare key={it.hanzi} text={it.hanzi} lang="zh" tone={it.tone} className="mt-4" />
      <div className="mt-4 flex justify-between">
        <Button size="sm" variant="ghost" onClick={() => setI(i - 1)} disabled={i === 0}><ArrowLeft size={15} aria-hidden /> Anterior</Button>
        <Button size="sm" variant="secondary" onClick={() => setI((i + 1) % items.length)}>Siguiente <ArrowRight size={15} aria-hidden /></Button>
      </div>
    </div>
  );
}
