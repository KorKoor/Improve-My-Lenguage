import { BookOpen, Check, Gauge, Layers, Lock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { learnerPath } from "@/lib/services/path";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Tu camino a C1" };

const LEVEL_TEXT: Record<string, { name: string; can: string }> = {
  A1: { name: "Acceso", can: "Presentarte, pedir cosas básicas y entender frases muy sencillas." },
  A2: { name: "Plataforma", can: "Hablar de tu día, tu familia y tus planes; resolver trámites sencillos." },
  B1: { name: "Umbral", can: "Viajar sin ayuda, contar experiencias y dar tu opinión con razones." },
  B2: { name: "Avanzado", can: "Conversar con fluidez con nativos y entender artículos y series." },
  C1: { name: "Dominio operativo", can: "Usar el idioma con soltura en el trabajo, los estudios y la vida social." },
};

function Ring({ value, status }: { value: number; status: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width={64} height={64} className="-rotate-90" aria-hidden>
      <circle cx={32} cy={32} r={r} fill="none" stroke="var(--surface-muted)" strokeWidth={6} />
      <circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        stroke={status === "done" ? "var(--success)" : "var(--primary)"}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
      />
    </svg>
  );
}

export default async function PathPage() {
  const learner = await requireLearner();
  const path = await learnerPath(learner);
  const current = path.find((l) => l.status === "current");
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Tu camino a C1</h1>
        <p className="mt-1 text-muted">
          Cada nivel se completa con tres cosas medibles: el vocabulario del nivel, sus temas de gramática y que tus habilidades lo alcancen.
        </p>
      </header>

      <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[31px] before:top-6 before:w-1 before:rounded-full before:bg-surface-muted">
        {path.map((l, i) => {
          const t = LEVEL_TEXT[l.level]!;
          const pct = Math.round(l.progress * 100);
          const active = l.status === "current";
          return (
            <li key={l.level} className="relative flex gap-4 animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="relative z-10 grid size-16 shrink-0 place-items-center rounded-full bg-bg">
                <Ring value={l.progress} status={l.status} />
                <span className={cn("absolute font-display text-lg font-extrabold", l.status === "locked" && "text-muted")}>
                  {l.status === "done" ? <Check className="text-success-ink" strokeWidth={3} /> : l.level}
                </span>
              </div>
              <section className={cn("card flex-1 p-5", active && "border-primary shadow-[0_10px_30px_rgb(91_95_214/0.15)]", l.status === "locked" && "opacity-70")}>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-extrabold">{l.level} · {t.name}</h2>
                  {l.status === "done" && <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success-ink">Completado</span>}
                  {active && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">Estás aquí · {pct} %</span>}
                  {l.status === "locked" && <Lock size={14} className="text-muted" aria-label="Más adelante" />}
                </div>
                <p className="mt-1 text-sm text-muted">{t.can}</p>
                <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  <Metric icon={BookOpen} label="Palabras" done={l.vocab.done} total={l.vocab.total} color="var(--skill-vocabulary)" />
                  <Metric icon={Layers} label="Gramática" done={l.grammar.done} total={l.grammar.total} color="var(--skill-grammar)" hint={l.grammar.practiced > l.grammar.done ? `${l.grammar.practiced - l.grammar.done} en práctica` : undefined} />
                  <Metric icon={Gauge} label="Destrezas" done={l.skills.done} total={l.skills.total} color="var(--skill-listening)" />
                </dl>
                {active && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {l.vocab.done < l.vocab.total && (
                      <Link href="/app/session?focus=new_words" className={buttonClass("primary", "sm")}>
                        <Sparkles size={14} aria-hidden /> Palabras de {l.level}
                      </Link>
                    )}
                    {l.grammar.done < l.grammar.total && (
                      <Link href={`/app/grammar?level=${l.level}`} className={buttonClass("secondary", "sm")}>Gramática de {l.level}</Link>
                    )}
                    <Link href="/app/explore" className={buttonClass("ghost", "sm")}>Practicar habilidades</Link>
                  </div>
                )}
              </section>
            </li>
          );
        })}
      </ol>
      {current && (
        <p className="text-center text-xs text-muted">
          Criterios: palabra aprendida = repasada con memoria estable (FSRS) o marcada como sabida · tema de gramática = practicado con memoria ≥ 7 días · habilidad = tu nivel estimado ya está en la banda de {current.level}.
        </p>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, done, total, color, hint }: { icon: typeof BookOpen; label: string; done: number; total: number; color: string; hint?: string }) {
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div className="min-w-0 rounded-2xl bg-surface-muted p-2.5 sm:p-3">
      <dt className="flex items-center gap-1.5 truncate text-[11px] text-muted sm:text-xs"><Icon size={13} className="hidden shrink-0 sm:block" aria-hidden /> {label}</dt>
      <dd className="mt-1 font-display text-base font-extrabold tabular-nums sm:text-lg">
        {done}<span className="text-sm font-semibold text-muted">/{total}</span>
      </dd>
      <dd className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </dd>
      {hint && <dd className="mt-1 hidden text-[11px] text-muted sm:block">{hint}</dd>}
    </div>
  );
}
