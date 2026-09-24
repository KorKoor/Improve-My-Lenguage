"use client";
import { Bookmark, Check, Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { setWordStatusAction } from "@/app/app/actions";
import { cn } from "@/lib/cn";

type Status = "known" | "difficult" | "saved" | "learning";

export function WordActions({ id, status, compact = false }: { id: string; status: Status | null; compact?: boolean }) {
  const [current, setCurrent] = useState<Status | null>(status);
  const [pending, start] = useTransition();
  const set = (s: Status) => {
    const nextStatus = current === s ? "learning" : s;
    setCurrent(nextStatus); // actualización optimista (reversible)
    start(async () => {
      const res = await setWordStatusAction(id, nextStatus);
      if (!res.ok) setCurrent(current);
    });
  };
  const btn = (s: Status, label: string, Icon: typeof Check, activeCls: string) => (
    <button
      type="button"
      aria-pressed={current === s}
      disabled={pending}
      onClick={() => set(s)}
      title={label}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition", current === s ? activeCls : "border-border bg-surface text-muted hover:text-text")}
    >
      <Icon size={14} aria-hidden /> {compact ? <span className="sr-only">{label}</span> : label}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {btn("saved", "Guardar", Bookmark, "border-primary bg-primary-soft text-primary")}
      {btn("known", "Ya la sé", Check, "border-success bg-success-soft text-success")}
      {btn("difficult", "Difícil", Flag, "border-warning bg-warning-soft text-warning")}
    </div>
  );
}
