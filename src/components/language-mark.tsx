import { cn } from "@/lib/cn";

/**
 * Marca de idioma: un glifo de su propia escritura sobre una tesela suave.
 * Sustituye a los emojis de bandera, que Windows no dibuja (muestra "GB") y
 * que además identifican países, no idiomas.
 */
const GLYPHS: Record<string, string> = {
  en: "En", es: "Es", fr: "Fr", de: "De", it: "It", pt: "Pt", nl: "Nl", sv: "Sv",
  ja: "あ", ko: "한", zh: "中", ru: "Ру", ar: "ع",
};

export function languageGlyph(code: string): string {
  return GLYPHS[code] ?? code.slice(0, 2).replace(/^./, (c) => c.toUpperCase());
}

export function LanguageMark({ code, size = 28, className }: { code: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      lang={code}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[30%] bg-primary-soft font-display font-extrabold leading-none text-primary", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {languageGlyph(code)}
    </span>
  );
}
