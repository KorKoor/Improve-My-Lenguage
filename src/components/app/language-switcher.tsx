"use client";
import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { setActiveLanguageAction } from "@/app/app/actions";
import { LanguageMark } from "@/components/language-mark";
import { cn } from "@/lib/cn";

export interface LangOption {
  code: string;
  name: string;
  level: string | null;
}

export function LanguageSwitcher({ options, active }: { options: LangOption[]; active: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="rounded-2xl bg-surface-muted p-3" aria-busy={pending}>
      <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-muted">Tus idiomas</p>
      <ul className="space-y-0.5">
        {options.map((o) => (
          <li key={o.code}>
            <button
              type="button"
              disabled={pending || o.code === active}
              onClick={() => start(async () => { await setActiveLanguageAction(o.code); })}
              className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition", o.code === active ? "font-semibold" : "text-muted hover:bg-surface")}
            >
              <LanguageMark code={o.code} size={22} />
              <span className="flex-1">{o.name}</span>
              {o.level ? <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", o.code === active ? "bg-primary-soft text-primary" : "bg-surface text-muted")}>{o.level}</span> : null}
              {o.code === active ? <Check size={14} className="text-primary" aria-label="Activo" /> : null}
            </button>
          </li>
        ))}
      </ul>
      <Link href="/app/onboarding?add=1" className="mt-2 flex items-center gap-1.5 px-2 text-xs font-semibold text-primary hover:underline">
        <Plus size={14} aria-hidden /> Añadir idioma
      </Link>
    </div>
  );
}
