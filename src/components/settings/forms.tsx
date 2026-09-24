"use client";
import { Check, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteAccountAction, updateSettingsAction } from "@/app/app/actions";
import { ThemeToggle, type ThemePref } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { Topic } from "@/lib/content/types";

interface Prefs {
  displayName: string;
  nativeLanguage: string;
  dailyMinutes: number;
  explanationDepth: "brief" | "balanced" | "detailed";
  preferredDifficulty: "easy" | "balanced" | "challenging";
  interests: string[];
  aiConsent: boolean;
}

export function PreferencesForm({ initial, topics, natives, aiAvailable }: { initial: Prefs; topics: Topic[]; natives: { code: string; name: string }[]; aiAvailable: boolean }) {
  const [v, setV] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<"idle" | "ok" | "error">("idle");
  const set = <K extends keyof Prefs>(k: K, val: Prefs[K]) => { setV((s) => ({ ...s, [k]: val })); setSaved("idle"); };
  const field = "h-11 w-full rounded-xl border border-border bg-surface px-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft";

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateSettingsAction(v);
          setSaved(res.ok ? "ok" : "error");
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Nombre
          <input className={cn(field, "mt-1.5")} value={v.displayName} maxLength={60} onChange={(e) => set("displayName", e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Idioma nativo (para traducciones y explicaciones)
          <select className={cn(field, "mt-1.5")} value={v.nativeLanguage} onChange={(e) => set("nativeLanguage", e.target.value)}>
            {natives.map((n) => <option key={n.code} value={n.code}>{n.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Minutos por día
          <select className={cn(field, "mt-1.5")} value={v.dailyMinutes} onChange={(e) => set("dailyMinutes", Number(e.target.value))}>
            {[5, 10, 15, 20, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Explicaciones
          <select className={cn(field, "mt-1.5")} value={v.explanationDepth} onChange={(e) => set("explanationDepth", e.target.value as Prefs["explanationDepth"])}>
            <option value="brief">Rápidas</option><option value="balanced">Equilibradas</option><option value="detailed">Detalladas</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Dificultad
          <select className={cn(field, "mt-1.5")} value={v.preferredDifficulty} onChange={(e) => set("preferredDifficulty", e.target.value as Prefs["preferredDifficulty"])}>
            <option value="easy">Suave</option><option value="balanced">Equilibrada</option><option value="challenging">Retadora</option>
          </select>
        </label>
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Intereses</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {topics.map((t) => {
            const on = v.interests.includes(t.id);
            return (
              <button key={t.id} type="button" aria-pressed={on} onClick={() => set("interests", on ? v.interests.filter((x) => x !== t.id) : [...v.interests, t.id])} className={cn("rounded-full border px-3 py-1.5 text-sm", on ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-muted")}>
                {t.emoji} {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className={cn("flex items-start gap-3 text-sm", !aiAvailable && "opacity-60")}>
        <input type="checkbox" checked={v.aiConsent} disabled={!aiAvailable} onChange={(e) => set("aiConsent", e.target.checked)} className="mt-0.5 size-5 accent-[var(--primary)]" />
        <span><strong>Tutor de IA</strong> — permitir enviar mis mensajes al tutor y un resumen de mi nivel al proveedor de IA.{!aiAvailable && " (No configurado en este servidor.)"}</span>
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" size={16} aria-hidden /> : null} Guardar cambios</Button>
        {saved === "ok" && <span role="status" className="flex items-center gap-1 text-sm text-success"><Check size={16} aria-hidden /> Guardado</span>}
        {saved === "error" && <span role="alert" className="text-sm text-danger">No se pudo guardar.</span>}
      </div>
    </form>
  );
}

export function ThemeSetting({ initial }: { initial: ThemePref }) {
  return <ThemeToggle initial={initial} onChange={(theme) => void updateSettingsAction({ theme })} />;
}

export function DangerZone() {
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <Card className="border-danger/40">
      <h2 className="font-display text-lg font-extrabold text-danger">Eliminar cuenta</h2>
      <p className="mt-1 text-sm text-muted">Se borrarán de forma permanente tu cuenta y todos tus datos de aprendizaje, en todos los idiomas. No se puede deshacer. Te recomendamos descargar tus datos antes.</p>
      <label className="mt-4 block text-sm font-medium">
        Escribe <strong>ELIMINAR</strong> para confirmar
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 h-11 w-full max-w-xs rounded-xl border border-border bg-surface px-3.5 outline-none focus:border-danger" />
      </label>
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      <Button
        variant="danger"
        className="mt-4"
        disabled={confirm.trim().toUpperCase() !== "ELIMINAR" || pending}
        onClick={() => start(async () => {
          const res = await deleteAccountAction(confirm);
          if (res && !res.ok) setError(res.error);
        })}
      >
        {pending ? <Loader2 className="animate-spin" size={16} aria-hidden /> : null} Eliminar mi cuenta para siempre
      </Button>
    </Card>
  );
}
