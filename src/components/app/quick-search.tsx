"use client";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Buscador del encabezado: busca en el vocabulario. ⌘K / Ctrl+K lo enfoca. */
export function QuickSearch() {
  const input = useRef<HTMLInputElement>(null);
  const [shortcut, setShortcut] = useState("Ctrl K");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘K");
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <form action="/app/vocabulary" role="search" className="relative w-72">
      <label className="sr-only" htmlFor="quick-search">Buscar palabras</label>
      <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      <input
        ref={input}
        id="quick-search"
        name="q"
        placeholder="Buscar palabras, traducciones…"
        className="h-11 w-full rounded-2xl border border-border bg-surface pl-10 pr-14 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-soft"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted">{shortcut}</kbd>
    </form>
  );
}
