"use client";

import { Flag, Loader2 } from "lucide-react";
import { useState } from "react";
import { reportContentAction } from "@/app/app/report-actions";
import { cn } from "@/lib/cn";

const KINDS = [
  ["translation", "La traducción está mal"],
  ["audio", "El audio suena mal"],
  ["example", "El ejemplo es raro"],
  ["other", "Otra cosa"],
] as const;

/** «Reportar»: avisa de una traducción, audio o ejemplo incorrectos. Nos ayuda a mejorar el contenido. */
export function ReportButton({ itemId, className }: { itemId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<(typeof KINDS)[number][0]>("translation");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (state === "sent") return <span className={cn("text-xs font-semibold text-success", className)}>✓ ¡Gracias! Lo revisaremos.</span>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-muted hover:bg-surface-muted hover:text-text", className)}>
        <Flag size={12} aria-hidden /> Reportar un error
      </button>
    );
  }
  return (
    <form
      className={cn("mt-2 w-full rounded-2xl border border-border bg-surface p-3 text-left text-sm", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        const r = await reportContentAction(itemId, kind, note);
        if (r.ok) setState("sent");
        else {
          setState("error");
          setMsg(r.error);
        }
      }}
    >
      <fieldset>
        <legend className="mb-2 font-semibold">¿Qué está mal?</legend>
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map(([k, label]) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={cn("rounded-full px-3 py-1 text-xs font-semibold", kind === k ? "bg-primary text-on-primary" : "bg-surface-muted text-muted")}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mt-2 block text-xs text-muted">
        Cómo debería ser (opcional)
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="mt-1 h-9 w-full rounded-xl border border-border bg-bg px-3 text-sm text-text" placeholder="p. ej. «tu» significa «tú», no «callar»" />
      </label>
      {state === "error" && <p className="mt-2 text-xs text-danger">{msg}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted">Cancelar</button>
        <button type="submit" disabled={state === "sending"} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary">
          {state === "sending" && <Loader2 size={12} className="animate-spin" aria-hidden />} Enviar
        </button>
      </div>
    </form>
  );
}
