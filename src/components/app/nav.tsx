"use client";
import { BookOpen, ChevronDown, CircleHelp, Gamepad2, Home, LayoutGrid, MoreHorizontal, Play, Repeat, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export { navGroups, navItems, type NavGroup, type NavItem } from "./nav-items";
import { navGroups, type NavItem } from "./nav-items";

function isActive(path: string, href: string) {
  return href === "/app" ? path === "/app" : path === href || path.startsWith(href + "/");
}

const CLOSED_KEY = "iml-nav-closed";

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  const { href, label, icon: Icon, badge, soon, fresh } = item;
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-surface-muted hover:text-text",
      )}
    >
      {active && <span className="absolute inset-y-2 -left-1 w-1 rounded-full bg-primary" aria-hidden />}
      <Icon size={18} aria-hidden className="shrink-0 transition-transform group-hover:scale-110" />
      <span className="flex-1 truncate">{label}</span>
      {badge ? <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">{badge}</span> : null}
      {fresh ? <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning-ink">Nuevo</span> : null}
      {soon ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted">Pronto</span> : null}
    </Link>
  );
}

/**
 * Menú lateral por grupos (Hoy, Aprender, Practicar, Jugar, Tú). Cada grupo se
 * puede plegar (se recuerda en este dispositivo); el de la página actual
 * siempre está abierto.
 */
export function SidebarNav({ due, simple = false, alphabet = false }: { due: number; simple?: boolean; alphabet?: boolean }) {
  const path = usePathname();
  const [closed, setClosed] = useState<string[]>([]);
  useEffect(() => {
    try {
      setClosed(JSON.parse(localStorage.getItem(CLOSED_KEY) ?? "[]"));
    } catch {
      /* sin almacenamiento: todo abierto */
    }
  }, []);
  const toggle = (id: string) => {
    const next = closed.includes(id) ? closed.filter((x) => x !== id) : [...closed, id];
    setClosed(next);
    try {
      localStorage.setItem(CLOSED_KEY, JSON.stringify(next));
    } catch {
      /* ignorar */
    }
  };
  const groups = navGroups(due, simple, alphabet);
  return (
    <nav aria-label="Aplicación" className={cn("-mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-2", simple && "text-base")}>
      {groups.map((g) => {
        const hasActive = g.items.some((it) => isActive(path, it.href));
        const open = hasActive || !closed.includes(g.id);
        const listId = `nav-${g.id}`;
        return (
          <div key={g.id}>
            {g.id === "today" ? null : (
              <button
                type="button"
                onClick={() => toggle(g.id)}
                aria-expanded={open}
                aria-controls={listId}
                disabled={hasActive}
                className="flex w-full items-center gap-1 rounded-lg px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted hover:text-text disabled:cursor-default disabled:hover:text-muted"
              >
                <span className="flex-1 text-left">{g.label}</span>
                {!hasActive && <ChevronDown size={14} aria-hidden className={cn("transition-transform", !open && "-rotate-90")} />}
              </button>
            )}
            <ul id={listId} hidden={!open} className="flex flex-col gap-0.5">
              {g.items.map((it) => (
                <li key={it.href}>
                  <NavLink item={it} active={isActive(path, it.href)} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <div className="flex flex-col gap-0.5 border-t border-border/70 pt-3">
        <NavLink item={{ href: "/app/settings", label: "Configuración", icon: Settings }} active={isActive(path, "/app/settings")} />
        <NavLink item={{ href: "/app?tutorial=1", label: "Ayuda y tutorial", icon: CircleHelp }} active={false} />
      </div>
    </nav>
  );
}

export function TabBar({ due, simple = false }: { due: number; simple?: boolean }) {
  const path = usePathname();
  const tabs = simple
    ? [
        { href: "/app", label: "Inicio", icon: Home },
        { href: "/app/session", label: "Practicar", icon: Play },
        { href: "/app/review", label: "Repasar", icon: Repeat, badge: due },
        { href: "/app/vocabulary", label: "Palabras", icon: BookOpen },
        { href: "/app/more", label: "Más", icon: MoreHorizontal },
      ]
    : [
        { href: "/app", label: "Inicio", icon: Home },
        { href: "/app/explore", label: "Practicar", icon: LayoutGrid },
        { href: "/app/review", label: "Repaso", icon: Repeat, badge: due },
        { href: "/app/games", label: "Juegos", icon: Gamepad2 },
        { href: "/app/more", label: "Más", icon: MoreHorizontal },
      ];
  return (
    <nav aria-label="Aplicación" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(path, href);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("relative flex flex-col items-center gap-0.5 py-1 text-[11px]", active ? "font-bold text-primary" : "font-medium text-muted")}>
                <Icon size={21} aria-hidden />
                {label}
                {badge ? <span className="absolute right-[22%] top-0 min-w-4 rounded-full bg-primary px-1 text-center text-[9px] font-bold leading-4 text-on-primary">{badge > 99 ? "99+" : badge}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
