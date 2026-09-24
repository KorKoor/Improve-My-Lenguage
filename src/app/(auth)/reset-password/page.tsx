"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const { error } = await createSupabaseBrowser().auth.updateUser({ password });
    setState(error ? "error" : "done");
    if (!error) setTimeout(() => window.location.assign("/app"), 1200);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="font-display text-3xl font-extrabold">Nueva contraseña</h1>
      <input type="password" required minLength={8} autoComplete="new-password" aria-label="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft" />
      {state === "error" && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">El enlace caducó o no es válido. Solicita otro.</p>}
      {state === "done" && <p role="status" className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">Contraseña actualizada. Entrando…</p>}
      <Button type="submit" size="lg" className="w-full" disabled={state === "busy"}>Guardar contraseña</Button>
    </form>
  );
}
