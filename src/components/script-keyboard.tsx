"use client";
import { Delete, Keyboard, Space } from "lucide-react";
import { useState } from "react";
import { useSpeech } from "@/components/speak-button";
import { keyboardFor } from "@/lib/content/alphabets";
import { cn } from "@/lib/cn";
import { backspaceJamo, typeJamo } from "@/lib/hangul";

/**
 * Teclado en pantalla para escribir en cirílico, árabe, hangul o kana: con el
 * teclado del móvil o del ordenador en español es imposible. Cada tecla suena
 * al pulsarla, así se repasan las letras mientras se escribe. En coreano las
 * letras se juntan solas en sílabas (ㅎ + ㅏ + ㄴ → 한).
 */
export function ScriptKeyboard({ lang, locale, value, onChange, disabled = false, defaultOpen = true, romanOk = true }: { lang: string; locale: string; value: string; onChange: (v: string) => void; disabled?: boolean; defaultOpen?: boolean; /** ¿Se acepta la respuesta en letras latinas? */ romanOk?: boolean }) {
  const layouts = keyboardFor(lang);
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState(0);
  const { speak } = useSpeech(locale);
  if (!layouts) {
    if (lang !== "zh") return null;
    return <p className="mt-2 text-xs text-muted">{romanOk ? "Puedes escribir en pinyin (con o sin tildes), por ejemplo «nihao»." : "Para escribir caracteres, usa el teclado chino (pinyin) de tu dispositivo."}</p>;
  }
  const layout = layouts[Math.min(tab, layouts.length - 1)]!;
  const press = (k: string) => {
    onChange(lang === "ko" ? typeJamo(value, k) : value + k);
    speak(lang === "ko" ? typeJamo("", k).slice(-1) : k, 0.9);
  };
  const back = () => onChange(lang === "ko" ? backspaceJamo(value) : [...value].slice(0, -1).join(""));

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-muted hover:text-text">
          <Keyboard size={14} aria-hidden /> {open ? "Ocultar teclado" : "Mostrar teclado"}
        </button>
        {open && layouts.length > 1 && layouts.map((l, i) => (
          <button key={l.label} type="button" onClick={() => setTab(i)} aria-pressed={tab === i} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", tab === i ? "bg-primary text-on-primary" : "bg-surface-muted text-muted")}>
            {l.label}
          </button>
        ))}
        {romanOk && <span className="text-xs text-muted">También puedes escribir en letras latinas.</span>}
      </div>
      {open && (
        <div className="mt-2 space-y-1.5 rounded-2xl bg-surface-muted p-2" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} role="group" aria-label="Teclado en pantalla">
          {layout.rows.map((row, i) => (
            <div key={i} className="flex justify-center gap-1">
              {row.map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={disabled}
                  onClick={() => press(k)}
                  className="h-10 min-w-0 max-w-11 flex-1 rounded-lg border border-border bg-surface text-lg font-medium shadow-sm transition active:scale-95 active:bg-primary-soft disabled:opacity-50"
                >
                  {k}
                </button>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-1" dir="ltr">
            <button type="button" disabled={disabled} onClick={() => onChange(value + " ")} className="flex h-10 flex-[3] items-center justify-center rounded-lg border border-border bg-surface text-muted active:scale-95" aria-label="Espacio">
              <Space size={18} aria-hidden />
            </button>
            <button type="button" disabled={disabled || !value} onClick={back} className="flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-surface text-muted active:scale-95 disabled:opacity-50" aria-label="Borrar">
              <Delete size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
