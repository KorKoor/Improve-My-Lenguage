import type { Metadata } from "next";
import Link from "next/link";
import { CircleHelp, Settings } from "lucide-react";
import { navGroups } from "@/components/app/nav-items";
import { hasAlphabet } from "@/lib/content/alphabets";
import { countDue } from "@/lib/db/repositories";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Más" };

/** Todas las secciones, por grupos y con una línea que dice para qué sirve cada una (en móvil la barra inferior sólo tiene 5). */
export default async function MorePage() {
  const learner = await requireLearner();
  const due = await countDue(learner.ul.id, new Date());
  const groups = navGroups(due, learner.profile.simpleMode, hasAlphabet(learner.language.code));
  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Todo</h1>
        <p className="mt-1 text-muted">Todas las secciones de la app, por lo que quieras hacer.</p>
      </header>
      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`more-${g.id}`}>
          <h2 id={`more-${g.id}`} className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">{g.label}</h2>
          <ul className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map(({ href, label, icon: Icon, badge, fresh, hint }) => (
              <li key={href}>
                <Link href={href} className="card lift flex h-full items-center gap-3 p-4 hover:border-primary">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={20} aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-semibold">
                      {label}
                      {fresh ? <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning-ink">Nuevo</span> : null}
                    </span>
                    {hint ? <span className="block text-sm text-muted">{hint}</span> : null}
                  </span>
                  {badge ? <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">{badge}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section aria-labelledby="more-account" className="grid gap-3 sm:grid-cols-2">
        <h2 id="more-account" className="sr-only">Cuenta</h2>
        <Link href="/app/settings" className="card lift flex items-center gap-3 p-4 hover:border-primary">
          <Settings size={20} aria-hidden className="text-muted" /> <span className="font-semibold">Configuración</span>
        </Link>
        <Link href="/app?tutorial=1" className="card lift flex items-center gap-3 p-4 hover:border-primary">
          <CircleHelp size={20} aria-hidden className="text-muted" /> <span className="font-semibold">Ayuda y tutorial</span>
        </Link>
      </section>
      <form action="/auth/signout" method="post">
        <button className="w-full rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-muted hover:bg-surface-muted">Cerrar sesión</button>
      </form>
    </div>
  );
}
