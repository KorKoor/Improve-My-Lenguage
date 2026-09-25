import { ArrowRight, Globe2 } from "lucide-react";
import Link from "next/link";
import { LanguageMark } from "@/components/language-mark";
import { ButtonLink } from "@/components/ui/button";
import type { LanguagesOverview } from "@/lib/services/multilang";

/** Inicio (varios idiomas): cómo se reparten hoy tus minutos. */
export function MultiLangToday({ o }: { o: LanguagesOverview }) {
  const names = Object.fromEntries(o.cards.map((c) => [c.code, c]));
  const total = o.allocation.reduce((a, x) => a + x.minutes, 0) || 1;
  return (
    <section className="card p-5" aria-labelledby="ml-title">
      <div className="flex items-center gap-2">
        <Globe2 size={18} className="text-primary" aria-hidden />
        <h2 id="ml-title" className="flex-1 font-semibold">Hoy entre tus idiomas</h2>
        <Link href="/app/languages" className="text-xs font-semibold text-primary hover:underline">Ajustar</Link>
      </div>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
        {o.allocation.map((a, i) => (
          <div key={a.code} style={{ width: `${(a.minutes / total) * 100}%`, background: ["var(--primary)", "var(--skill-listening)", "var(--skill-writing)", "var(--skill-grammar)"][i % 4] }} />
        ))}
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {o.allocation.map((a) => {
          const c = names[a.code]!;
          const done = c.minutesToday >= a.minutes;
          return (
            <li key={a.code} className="flex items-center gap-2.5">
              <LanguageMark code={a.code} size={26} />
              <span className="font-semibold">{c.name}</span>
              <span className="truncate text-xs text-muted">{a.mode === "review" ? "repaso" : "sesión"}{c.due ? ` · ${c.due} pendientes` : ""}</span>
              <span className={`ml-auto shrink-0 text-xs font-bold tabular-nums ${done ? "text-success" : "text-muted"}`}>{done ? "✓ " : ""}{Math.min(c.minutesToday, a.minutes)}/{a.minutes} min</span>
            </li>
          );
        })}
      </ul>
      <ButtonLink href="/app/study" size="sm" className="mt-4 w-full">Modo estudio con descansos <ArrowRight size={15} aria-hidden /></ButtonLink>
    </section>
  );
}
