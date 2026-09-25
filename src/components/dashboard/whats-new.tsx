"use client";

import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Aviso de novedades: se muestra hasta que lo cierras o lo visitas (por dispositivo). */
export function WhatsNew({ version, count }: { version: string; count: number }) {
  const [show, setShow] = useState(false);
  const key = `iml:whats-new:${version}`;
  useEffect(() => {
    try {
      setShow(localStorage.getItem(key) !== "seen");
    } catch {}
  }, [key]);
  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(key, "seen");
    } catch {}
  };
  if (!show) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary-soft to-surface px-4 py-3 animate-pop-in" role="status">
      <Sparkles className="shrink-0 text-primary" size={20} aria-hidden />
      <p className="flex-1 text-sm">
        <strong>{count} novedades</strong> te esperan: familia, verbos, misiones, escenarios, pronunciación…
      </p>
      <Link href="/app/novedades" onClick={dismiss} className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary hover:bg-primary-hover">
        Ver
      </Link>
      <button type="button" onClick={dismiss} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-muted" aria-label="Cerrar aviso">
        <X size={16} />
      </button>
    </div>
  );
}
