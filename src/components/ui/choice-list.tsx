"use client";
import { Check, Loader2, Volume2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSpeech } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Opciones de respuesta con confirmación: tocar una opción (o pulsar 1–9)
 * sólo la selecciona y, si está en el idioma que aprendes, la hace sonar.
 * Así puedes escuchar todas antes de decidir; la respuesta se envía con
 * «Comprobar» (o Intro). Después de responder, tocar una opción la vuelve a
 * leer en voz alta.
 */
export function ChoiceList({
  options,
  onConfirm,
  result,
  answered = false,
  busy = false,
  disabled = false,
  locale,
  lang,
  dir = "ltr",
  listen = true,
  optionClassName,
  gridClassName,
  confirmLabel = "Comprobar",
  shortcuts = true,
  speakOption,
  info,
  readingMode = "show",
  meaningBefore = false,
  latin = false,
}: {
  options: string[];
  onConfirm: (option: string) => void;
  /** Tras responder: cómo marcar cada opción. */
  result?: (option: string) => "ok" | "bad" | null;
  answered?: boolean;
  busy?: boolean;
  disabled?: boolean;
  /** Locale de voz; sin él, las opciones no suenan. */
  locale?: string;
  lang?: string;
  dir?: "ltr" | "rtl";
  /** false: no suenan antes de responder (cuando oírlas regalaría la respuesta). */
  listen?: boolean;
  optionClassName?: string;
  gridClassName?: string;
  confirmLabel?: string;
  /** Atajos 1–9 e Intro (desactívalos si la pantalla ya tiene los suyos). */
  shortcuts?: boolean;
  /** Cómo suena una opción, si no basta con leer su texto (p. ej. el sonido de una letra). */
  speakOption?: (option: string) => void;
  /** Opciones en otra escritura: lectura en letras latinas y significado. */
  info?: Record<string, { reading?: string; meaning?: string }>;
  /**
   * Lectura antes de responder: «show» visible, «dim» tenue, «tap»/«after»
   * oculta (el alumno ya lee la escritura, o el ejercicio es justo leerla).
   * Después de responder se ven siempre la lectura y el significado.
   */
  readingMode?: "show" | "dim" | "tap" | "after";
  /** Mostrar el significado antes de responder (sólo si no regala la respuesta). */
  meaningBefore?: boolean;
  /** Sólo letras latinas: la lectura (rōmaji, pinyin) como texto principal y el original pequeño. */
  latin?: boolean;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const { speak } = useSpeech(locale ?? "es-ES");
  const audible = Boolean(locale || speakOption);
  const canHear = audible && (listen || answered);

  // Opciones nuevas (otra pregunta o menos opciones al atascarse): selección a cero.
  const key = options.join("\u0000");
  useEffect(() => setChosen(null), [key]);

  const select = (o: string) => {
    if (!answered) setChosen(o);
    if (canHear) (speakOption ? speakOption(o) : speak(o, 0.9));
  };
  const confirm = () => {
    if (chosen && !answered && !busy && !disabled) onConfirm(chosen);
  };

  useEffect(() => {
    if (!shortcuts) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= options.length && !disabled) {
        e.preventDefault();
        select(options[n - 1]!);
      } else if (e.key === "Enter" && chosen && !answered && !(t instanceof HTMLButtonElement)) {
        e.preventDefault();
        confirm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      <div className={cn("grid gap-2.5", gridClassName)} role="radiogroup" aria-label="Opciones">
        {options.map((o, i) => {
          const state = answered ? result?.(o) ?? null : null;
          const isChosen = chosen === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={isChosen}
              disabled={disabled && !answered}
              aria-keyshortcuts={shortcuts && i < 9 ? String(i + 1) : undefined}
              onClick={() => select(o)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-base font-medium transition",
                state === "ok" && "border-2 border-success bg-success-soft text-success-ink",
                state === "bad" && "border-2 border-danger bg-danger-soft text-danger-ink",
                !state && isChosen && "border-2 border-primary bg-primary-soft/60",
                !state && !isChosen && "border-border bg-surface hover:border-primary hover:bg-primary-soft/40",
                answered && !state && "opacity-60",
                optionClassName,
              )}
            >
              {shortcuts && i < 9 && <kbd className="hidden size-6 shrink-0 place-items-center rounded-md border border-border text-[11px] text-muted sm:grid" aria-hidden>{i + 1}</kbd>}
              <OptionLabel text={o} lang={lang} dir={dir} info={info?.[o]} answered={answered} readingMode={readingMode} meaningBefore={meaningBefore} latin={latin} />
              {canHear && <Volume2 size={16} className="shrink-0 text-muted" aria-hidden />}
              {state === "ok" && <Check size={18} aria-hidden />}
              {state === "bad" && <X size={18} aria-hidden />}
            </button>
          );
        })}
      </div>
      {!answered && (
        <Button size="lg" className="mt-4 w-full" onClick={confirm} disabled={!chosen || busy || disabled}>
          {busy ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} {confirmLabel}
        </Button>
      )}
      {!answered && audible && listen && <p className="mt-2 text-center text-xs text-muted">Toca cada opción para oírla; tu respuesta se envía al pulsar «{confirmLabel}».</p>}
    </div>
  );
}

function OptionLabel({ text, lang, dir, info, answered, readingMode, meaningBefore, latin }: { text: string; lang?: string; dir: "ltr" | "rtl"; info?: { reading?: string; meaning?: string }; answered: boolean; readingMode: "show" | "dim" | "tap" | "after"; meaningBefore: boolean; latin: boolean }) {
  const showMeaningLatin = (answered || meaningBefore) && info?.meaning;
  if (latin && info?.reading && info.reading !== text) {
    return (
      <span className="flex min-w-0 flex-1 flex-col">
        <span lang={lang ? `${lang}-Latn` : undefined}>{info.reading}</span>
        <span className="text-sm font-normal text-muted" lang="es" dir="ltr">
          <span lang={lang} dir={dir}>{text}</span>
          {showMeaningLatin ? <> · <span className="italic">«{info.meaning}»</span></> : null}
        </span>
      </span>
    );
  }
  const showReading = info?.reading && info.reading !== text && (answered || readingMode === "show" || readingMode === "dim");
  const showMeaning = (answered || meaningBefore) && info?.meaning;
  return (
    <span className="flex min-w-0 flex-1 flex-col">
      <span lang={lang} dir={dir}>{text}</span>
      {(showReading || showMeaning) && (
        <span className={cn("text-sm font-normal text-muted", !answered && readingMode === "dim" && "opacity-60")} lang="es" dir="ltr">
          {showReading ? info!.reading : null}
          {showReading && showMeaning ? " · " : null}
          {showMeaning ? <span className="italic">«{info!.meaning}»</span> : null}
        </span>
      )}
    </span>
  );
}
