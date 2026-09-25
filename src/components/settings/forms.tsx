"use client";
import { Check, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteAccountAction, updateSettingsAction } from "@/app/app/actions";
import { applyComfort } from "@/components/comfort";
import { ThemeToggle, type ThemePref } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { Topic } from "@/lib/content/types";
import type { TextSize } from "@/lib/db/types";

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
        <label className="block text-sm font-medium">Minutos por día (en total, repartidos entre tus idiomas)
          <select className={cn(field, "mt-1.5")} value={v.dailyMinutes} onChange={(e) => set("dailyMinutes", Number(e.target.value))}>
            {[...new Set([5, 10, 15, 20, 25, 30, 40, 45, 60, 90, 120, initial.dailyMinutes])].sort((a, b) => a - b).map((m) => <option key={m} value={m}>{m} min</option>)}
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

/** Comodidad: tamaño de letra, modo sencillo y audio lento. Se aplica al instante. */
export function ComfortSettings({ initial }: { initial: { textSize: TextSize; simpleMode: boolean; slowAudio: boolean; smartBreaks: boolean } }) {
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [, start] = useTransition();
  const save = (patch: Partial<typeof initial>) => {
    const next = { ...v, ...patch };
    setV(next);
    setSaved(false);
    applyComfort(next.textSize, next.slowAudio);
    start(async () => {
      const res = await updateSettingsAction(patch);
      setSaved(res.ok);
    });
  };
  const toggle = "flex w-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-primary/60";
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-medium">Tamaño de letra</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {([["normal", "Normal", "text-base"], ["large", "Grande", "text-lg"], ["xl", "Muy grande", "text-xl"]] as const).map(([val, label, size]) => (
            <button key={val} type="button" aria-pressed={v.textSize === val} onClick={() => save({ textSize: val })} className={cn("rounded-xl border py-3 font-semibold", size, v.textSize === val ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <button type="button" role="switch" aria-checked={v.simpleMode} onClick={() => save({ simpleMode: !v.simpleMode })} className={cn(toggle, v.simpleMode && "border-primary bg-primary-soft")}>
        <span className={cn("mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition", v.simpleMode ? "bg-primary" : "bg-border")}>
          <span className={cn("size-5 rounded-full bg-white shadow transition", v.simpleMode && "translate-x-5")} />
        </span>
        <span>
          <span className="block font-semibold">Modo sencillo</span>
          <span className="text-sm text-muted">Inicio con un solo botón grande, menos números y menos opciones en el menú. Ideal para empezar sin complicaciones.</span>
        </span>
      </button>
      <button type="button" role="switch" aria-checked={v.slowAudio} onClick={() => save({ slowAudio: !v.slowAudio })} className={cn(toggle, v.slowAudio && "border-primary bg-primary-soft")}>
        <span className={cn("mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition", v.slowAudio ? "bg-primary" : "bg-border")}>
          <span className={cn("size-5 rounded-full bg-white shadow transition", v.slowAudio && "translate-x-5")} />
        </span>
        <span>
          <span className="block font-semibold">Audio más lento</span>
          <span className="text-sm text-muted">Las palabras y frases se pronuncian un poco más despacio para entenderlas mejor.</span>
        </span>
      </button>
      <button type="button" role="switch" aria-checked={v.smartBreaks} onClick={() => save({ smartBreaks: !v.smartBreaks })} className={cn(toggle, v.smartBreaks && "border-primary bg-primary-soft")}>
        <span className={cn("mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition", v.smartBreaks ? "bg-primary" : "bg-border")}>
          <span className={cn("size-5 rounded-full bg-white shadow transition", v.smartBreaks && "translate-x-5")} />
        </span>
        <span>
          <span className="block font-semibold">Descansos inteligentes</span>
          <span className="text-sm text-muted">Te proponemos una pausa guiada cuando tu atención baja o llevas mucho rato seguido. Nunca interrumpen: sólo sugieren.</span>
        </span>
      </button>
      <div className="flex flex-wrap items-center gap-3">
        <a href="/app?tutorial=1" className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-border bg-surface px-5 text-[15px] font-semibold text-primary hover:bg-surface-muted">Ver el tutorial otra vez</a>
        {saved && <span role="status" className="flex items-center gap-1 text-sm text-success"><Check size={16} aria-hidden /> Guardado</span>}
      </div>
    </div>
  );
}
