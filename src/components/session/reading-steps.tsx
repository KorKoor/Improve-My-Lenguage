"use client";
import { ArrowRight, Snail, Volume2 } from "lucide-react";
import { useEffect, useId } from "react";
import { useSpeech } from "@/components/speak-button";
import { Stressed } from "@/components/stressed";
import { Button } from "@/components/ui/button";
import { arabicForms } from "@/lib/content/alphabets";
import type { LetterCard, RuleCard } from "@/lib/engine/session-builder";

const stripStress = (s: string) => s.replace(/́/g, "");

/**
 * Ficha de una letra nueva (Fase 0): grande, con su sonido explicado en
 * español, audio automático y una palabra de ejemplo. Con lector de pantalla,
 * el botón «Entendido» lleva toda la ficha como descripción.
 */
export function LetterStep({ letter: l, locale, language, rtl, onNext, gentle = false }: { letter: LetterCard; locale: string; language: string; rtl: boolean; onNext: () => void; gentle?: boolean }) {
  const { speak } = useSpeech(locale);
  const say = l.say ?? l.g;
  const descId = useId();
  useEffect(() => {
    speak(say, gentle ? 0.7 : 0.85);
  }, [speak, say, gentle]);
  const forms = language === "ar" && [...l.g].length === 1 ? arabicForms(l.g) : null;
  const shown = l.upper ? `${l.upper} ${l.g}` : l.g;
  return (
    <div>
      <p className="text-sm font-semibold text-muted">{[...l.g].length > 1 && !l.upper ? "Letras nuevas" : "Letra nueva"}</p>
      <div className="card mt-3 p-6" id={descId}>
        <div className="flex items-start gap-4">
          <p className="font-display text-7xl font-extrabold leading-none" lang={language} dir={rtl ? "rtl" : "ltr"}>{shown}</p>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">Suena</p>
            <p className="text-3xl font-extrabold text-primary">{l.r}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => speak(say, 0.85)} className="grid size-12 place-items-center rounded-full bg-primary text-on-primary active:scale-95" aria-label={`Escuchar ${l.g}`}>
              <Volume2 size={22} aria-hidden />
            </button>
            <button type="button" onClick={() => speak(say, 0.55)} className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary active:scale-95" aria-label="Escuchar muy despacio">
              <Snail size={20} aria-hidden />
            </button>
          </div>
        </div>
        {l.hint && <p className="mt-4 text-lg">{l.hint}</p>}
        {forms && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted">Cómo cambia al unirse</p>
            <div className="mt-1.5 grid grid-cols-4 gap-2 text-center" dir="rtl">
              {forms.map((f, i) => (
                <div key={i} className="rounded-xl bg-surface-muted p-2">
                  <p className="text-3xl" lang="ar">{f}</p>
                  <p className="text-[11px] text-muted" dir="ltr">{["sola", "al principio", "en medio", "al final"][i]}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {l.ex && (
          <button type="button" onClick={() => speak(l.ex!.w, 0.8)} className="mt-5 flex w-full flex-wrap items-center gap-3 rounded-2xl bg-surface-muted p-4 text-start transition hover:brightness-95">
            <Volume2 size={18} className="shrink-0 text-primary" aria-hidden />
            <span className="text-2xl font-bold" lang={language} dir={rtl ? "rtl" : "ltr"}>{l.ex.w}</span>
            <span className="text-sm text-muted">{l.ex.r} · «{l.ex.es}»</span>
            <span className="sr-only">. Toca para escuchar la palabra de ejemplo.</span>
          </button>
        )}
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={onNext} autoFocus aria-describedby={descId}>
        Entendido <ArrowRight size={18} aria-hidden />
      </Button>
    </div>
  );
}

/** Ficha de una regla de lectura: una idea, ejemplos que suenan al tocarlos. */
export function RuleStep({ rule, locale, language, rtl, onNext }: { rule: RuleCard; locale: string; language: string; rtl: boolean; onNext: () => void }) {
  const { speak } = useSpeech(locale);
  const descId = useId();
  return (
    <div>
      <p className="text-sm font-semibold text-muted">Regla para leer bien</p>
      <div className="card mt-3 p-6" id={descId}>
        <h2 className="font-display text-2xl font-extrabold">{rule.title}</h2>
        <p className="mt-3 text-lg leading-relaxed">{rule.explain}</p>
        <ul className="mt-5 space-y-2" aria-label="Ejemplos">
          {rule.examples.map((e) => (
            <li key={e.w}>
              <button type="button" onClick={() => speak(e.say ?? stripStress(e.w), 0.8)} className="flex w-full flex-wrap items-center gap-3 rounded-2xl bg-surface-muted p-4 text-start transition hover:brightness-95">
                <Volume2 size={18} className="shrink-0 text-primary" aria-hidden />
                <span className="text-2xl font-bold" lang={language} dir={rtl ? "rtl" : "ltr"}><Stressed text={e.w} /></span>
                {e.r && <span className="font-semibold text-primary" lang="es">{e.r}</span>}
                {e.es && <span className="text-sm text-muted">«{e.es}»</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={onNext} autoFocus aria-describedby={descId}>
        A probarlo <ArrowRight size={18} aria-hidden />
      </Button>
    </div>
  );
}
