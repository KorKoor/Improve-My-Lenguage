"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type ThemePref = "light" | "dark" | "system";

/** Script inline que aplica el tema antes del primer pintado (evita parpadeo). */
export const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark|system)/);var p=m?m[1]:'system';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({ initial = "system", onChange }: { initial?: ThemePref; onChange?: (p: ThemePref) => void }) {
  const [pref, setPref] = useState<ThemePref>(initial);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )theme=(light|dark|system)/);
    if (m) setPref(m[1] as ThemePref);
  }, []);
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => apply("system");
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [pref]);

  const choose = (p: ThemePref) => {
    setPref(p);
    document.cookie = `theme=${p}; path=/; max-age=31536000; samesite=lax`;
    apply(p);
    onChange?.(p);
  };
  const opts: { v: ThemePref; label: string; Icon: typeof Sun }[] = [
    { v: "light", label: "Claro", Icon: Sun },
    { v: "dark", label: "Oscuro", Icon: Moon },
    { v: "system", label: "Sistema", Icon: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label="Tema" className="inline-flex rounded-xl bg-surface-muted p-1">
      {opts.map(({ v, label, Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={pref === v}
          onClick={() => choose(v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            pref === v ? "bg-surface text-text shadow-sm" : "text-muted hover:text-text",
          )}
        >
          <Icon size={15} aria-hidden /> {label}
        </button>
      ))}
    </div>
  );
}
