import type { Metadata } from "next";
import Link from "next/link";
import { Settings } from "lucide-react";
import { navItems } from "@/components/app/nav-items";
import { countDue } from "@/lib/db/repositories";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Más" };

/** Todas las secciones en una sola pantalla (en móvil la barra inferior sólo tiene 5). */
export default async function MorePage() {
  const learner = await requireLearner();
  const due = await countDue(learner.ul.id, new Date());
  const items = navItems(due, learner.profile.simpleMode);
  return (
    <div className="space-y-6">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Todo</h1>
        <p className="mt-1 text-muted">Todas las secciones de la app.</p>
      </header>
      <ul className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[...items, { href: "/app/settings", label: "Configuración", icon: Settings, badge: null }]
          .filter((it, i, all) => all.findIndex((x) => x.href === it.href) === i)
          .map(({ href, label, icon: Icon, badge }) => (
            <li key={href}>
              <Link href={href} className="card lift relative flex h-full flex-col items-start gap-2 p-4 hover:border-primary">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={20} aria-hidden /></span>
                <span className="font-semibold">{label}</span>
                {badge ? <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">{badge}</span> : null}
              </Link>
            </li>
          ))}
      </ul>
      <form action="/auth/signout" method="post">
        <button className="w-full rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-muted hover:bg-surface-muted">Cerrar sesión</button>
      </form>
    </div>
  );
}
