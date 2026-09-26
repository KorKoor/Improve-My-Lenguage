"use client";
import { BarChart3, BookOpen, CircleHelp, Home, LayoutGrid, MoreHorizontal, Play, Repeat, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export { navItems, type NavItem } from "./nav-items";
import { navItems } from "./nav-items";

function isActive(path: string, href: string) {
  return href === "/app" ? path === "/app" : path === href || path.startsWith(href + "/");
}

export function SidebarNav({ due, simple = false, alphabet = false }: { due: number; simple?: boolean; alphabet?: boolean }) {
  const path = usePathname();
  return (
    <nav aria-label="Aplicación" className={cn("flex flex-col gap-1", simple && "text-base")}>
      {navItems(due, simple, alphabet).map(({ href, label, icon: Icon, badge, soon }) => {
        const active = isActive(path, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-surface-muted hover:text-text",
            )}
          >
            <Icon size={18} aria-hidden />
            <span className="flex-1">{label}</span>
            {badge ? <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">{badge}</span> : null}
            {soon ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted">Pronto</span> : null}
          </Link>
        );
      })}
      <Link
        href="/app/settings"
        aria-current={isActive(path, "/app/settings") ? "page" : undefined}
        className={cn(
          "mt-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
          isActive(path, "/app/settings") ? "bg-primary-soft font-semibold text-primary" : "text-muted hover:bg-surface-muted hover:text-text",
        )}
      >
        <Settings size={18} aria-hidden /> Configuración
      </Link>
      <Link
        href="/app?tutorial=1"
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-text"
      >
        <CircleHelp size={18} aria-hidden /> Ayuda y tutorial
      </Link>
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
        { href: "/app/progress", label: "Progreso", icon: BarChart3 },
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
