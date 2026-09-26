"use client";
import { Play, Volume2 } from "lucide-react";
import { useState } from "react";
import { useSpeech } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import type { AlphabetName, SpecialSign } from "@/lib/content/writing-system";
import { cn } from "@/lib/cn";

/** El abecedario con el nombre de cada letra: tocar = oír el nombre. */
export function AlphabetNames({ alphabet, locale, lang, rtl }: { alphabet: AlphabetName[]; locale: string; lang: string; rtl: boolean }) {
  const { speak, speakSeq } = useSpeech(locale);
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" dir={rtl ? "rtl" : "ltr"}>
        {alphabet.map((a) => (
          <button key={a.g} type="button" onClick={() => speak(a.say, 0.85)} className="card lift flex flex-col items-center px-1 py-2 transition active:scale-95">
            <span className="font-display text-2xl font-extrabold" lang={lang}>{a.g}</span>
            <span className="text-center text-xs text-muted" lang="es" dir="ltr">{a.name}</span>
          </button>
        ))}
      </div>
      <Button variant="secondary" size="sm" className="mt-3" onClick={() => speakSeq(alphabet.map((a) => a.say), 0.9)}>
        <Play size={16} aria-hidden /> Escuchar el abecedario entero
      </Button>
    </div>
  );
}

/**
 * «Deletrea tu nombre»: escribe cualquier palabra (tu nombre, tu correo) y se
 * deletrea en voz alta con los nombres de las letras del idioma.
 */
export function SpellYourName({ alphabet, locale, lang }: { alphabet: AlphabetName[]; locale: string; lang: string }) {
  const { speakSeq } = useSpeech(locale);
  const [text, setText] = useState("");
  const byLetter = new Map<string, AlphabetName>();
  for (const a of alphabet) for (const f of a.g.split(" ")) byLetter.set(f, a);
  const parts = [...text.normalize("NFD").replace(/\p{M}/gu, "")].filter((c) => /\p{L}/u.test(c)).map((c) => ({ c, a: byLetter.get(c) ?? byLetter.get(c.toUpperCase()) }));
  const known = parts.filter((p) => p.a);
  return (
    <div className="card p-5">
      <h3 className="font-display text-lg font-extrabold">Deletrea tu nombre</h3>
      <p className="text-sm text-muted">Escribe tu nombre o tu correo y escucha cómo se deletrea. Muy útil en el hotel, el médico o por teléfono.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label htmlFor="spell-input" className="sr-only">Palabra para deletrear</label>
        <input id="spell-input" value={text} onChange={(e) => setText(e.target.value.slice(0, 40))} placeholder="Por ejemplo: Carmen" className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3" autoComplete="off" />
        <Button onClick={() => speakSeq(known.map((p) => p.a!.say), 0.85)} disabled={!known.length}>
          <Volume2 size={16} aria-hidden /> Deletrear
        </Button>
      </div>
      {parts.length > 0 && (
        <ol className="mt-3 flex flex-wrap gap-1.5" aria-label="Deletreo">
          {parts.map((p, i) => (
            <li key={i} className={cn("rounded-lg px-2 py-1 text-sm", p.a ? "bg-primary-soft" : "bg-surface-muted text-muted")}>
              <strong lang={lang}>{p.c.toUpperCase()}</strong> <span lang="es">{p.a ? p.a.name : "?"}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Tarjeta de un signo especial: el ejemplo suena al tocarlo. */
export function SignCard({ sign, locale, lang, rtl }: { sign: SpecialSign; locale: string; lang: string; rtl: boolean }) {
  const { speak } = useSpeech(locale);
  return (
    <li className="card p-4">
      <p className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-extrabold" lang={lang} dir={rtl ? "rtl" : "ltr"}>{sign.g}</span>
        <span className="font-semibold">{sign.name}</span>
      </p>
      <p className="mt-1 text-sm text-muted">{sign.use}</p>
      <button type="button" onClick={() => speak(sign.ex.w, 0.85)} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-1.5 text-start hover:brightness-95">
        <Volume2 size={15} className="text-primary" aria-hidden />
        <span className="font-semibold" lang={lang} dir={rtl ? "rtl" : "ltr"}>{sign.ex.w}</span>
        <span className="text-sm text-muted">«{sign.ex.es}»</span>
      </button>
    </li>
  );
}
