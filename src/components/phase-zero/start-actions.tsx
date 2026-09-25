"use client";
import { ArrowRight, Ear, Gauge, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateSettingsAction } from "@/app/app/actions";
import { setPhaseZeroKnownAction } from "@/app/app/phase-actions";
import { Button } from "@/components/ui/button";

/**
 * «¿Por dónde empiezo?»: desde cero (lo recomendado) o, si ya sabe algo, la
 * prueba de un minuto. En modo accesible no hay prueba visual: basta decirlo.
 */
export function StartChoice({ firstHref, language, audioFirst }: { firstHref: string; language: string; audioFirst: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"zero" | "knows" | null>(null);
  const go = async (knows: boolean) => {
    setBusy(knows ? "knows" : "zero");
    const r = await setPhaseZeroKnownAction(knows);
    if (!r.ok) return setBusy(null);
    router.push(knows ? "/app/course" : firstHref);
  };
  return (
    <section className="card border-2 border-primary p-6" aria-labelledby="start-title">
      <h2 id="start-title" className="font-display text-2xl font-extrabold">¿Por dónde empiezas?</h2>
      <p className="mt-1 text-muted">Si nunca has estudiado {language.toLowerCase()}, empieza desde cero: vamos poco a poco y con audio en todo.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button size="lg" className="h-auto min-h-16 py-3 text-lg" onClick={() => void go(false)} disabled={busy !== null}>
          {busy === "zero" ? <Loader2 className="animate-spin" size={20} aria-hidden /> : null} Empiezo desde cero <ArrowRight size={20} aria-hidden />
        </Button>
        {audioFirst ? (
          <Button size="lg" variant="secondary" className="h-auto min-h-16 py-3 text-lg" onClick={() => void go(true)} disabled={busy !== null}>
            {busy === "knows" ? <Loader2 className="animate-spin" size={20} aria-hidden /> : null} Ya sé leer {language.toLowerCase()}
          </Button>
        ) : (
          <Link href="/app/start/check" className="flex min-h-16 items-center justify-center gap-2 rounded-[14px] border border-border bg-surface px-5 py-3 text-center text-lg font-semibold text-primary hover:bg-surface-muted">
            <Gauge size={20} aria-hidden /> Ya sé algo: prueba de 1 minuto
          </Link>
        )}
      </div>
    </section>
  );
}

/** Invitación a activar el modo accesible (lector de pantalla o poca vista). */
export function AccessibleInvite({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [pending, start] = useTransition();
  const toggle = () =>
    start(async () => {
      const r = await updateSettingsAction({ audioFirst: !on });
      if (r.ok) {
        setOn(!on);
        router.refresh();
      }
    });
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center" aria-labelledby="a11y-title">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary" aria-hidden><Ear size={22} /></span>
      <div className="flex-1">
        <h2 id="a11y-title" className="font-semibold">{on ? "Modo accesible activado" : "¿Usas lector de pantalla o ves poco?"}</h2>
        <p className="text-sm text-muted">
          {on
            ? "Aprendes de oído: sin ejercicios que dependan de ver las letras, con audio en cada paso y atajos de teclado (pulsa «?» durante una sesión)."
            : "Activa el modo accesible: aprenderás de oído, sin ejercicios que dependan de ver la forma de las letras."}
        </p>
      </div>
      <Button variant={on ? "secondary" : "primary"} onClick={toggle} disabled={pending} aria-pressed={on}>
        {on ? "Desactivar" : "Activar"}
      </Button>
    </section>
  );
}

/** Saltar la Fase 0 (ya sabe leer) o volver a ella. */
export function SkipPhase({ skipped }: { skipped: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const act = () =>
    start(async () => {
      if (!skipped && !window.confirm("¿Seguro? Si ya sabes leer y pronunciar bien, puedes ir directo al Camino guiado.")) return;
      const r = await setPhaseZeroKnownAction(!skipped);
      if (r.ok) router.refresh();
    });
  return (
    <button type="button" onClick={act} disabled={pending} className="text-sm font-semibold text-muted underline-offset-4 hover:text-text hover:underline">
      {skipped ? "Volver a aprender a leer paso a paso" : "Ya sé leer: saltar este paso"}
    </button>
  );
}
