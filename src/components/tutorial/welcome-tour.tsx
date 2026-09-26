"use client";
import { ArrowLeft, ArrowRight, BarChart3, Check, Headphones, Play, Repeat, Settings, Sparkles, Target, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { completeTutorialAction } from "@/app/app/actions";
import { Afi } from "@/components/afi/afi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Tutorial de bienvenida: 6 pasos que explican cómo funciona la app con
 * lenguaje sencillo y una vista previa de cada pantalla. Se muestra una vez
 * (se guarda en el perfil) y se puede repetir desde Configuración → Comodidad.
 * <dialog> nativo: atrapa el foco, se cierra con Esc y es accesible.
 */
interface Step {
  icon: typeof Play;
  color: string;
  title: string;
  body: string;
  preview: ReactNode;
}

function Preview({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-border bg-bg p-4" aria-hidden>{children}</div>;
}

function buildSteps(name: string | null, language: string, simple: boolean): Step[] {
  return [
    {
      icon: Sparkles,
      color: "var(--primary)",
      title: name ? `¡Bienvenido, ${name}!` : "¡Bienvenido!",
      body: `Vamos a aprender ${language.toLowerCase()} juntos. Esta app se adapta a ti: cada vez que practicas, conoce mejor qué sabes, qué se te olvida y qué te cuesta. En un minuto te enseño cómo funciona.`,
      preview: (
        <Preview>
          <div className="flex items-center gap-4">
            <Afi size={72} mood="waving" />
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2"><Check size={16} className="text-success-ink" /> Practicas unos minutos al día</p>
              <p className="flex items-center gap-2"><Check size={16} className="text-success-ink" /> La app elige qué te conviene</p>
              <p className="flex items-center gap-2"><Check size={16} className="text-success-ink" /> Ves tu progreso real</p>
            </div>
          </div>
        </Preview>
      ),
    },
    {
      icon: Play,
      color: "var(--skill-vocabulary)",
      title: "Un botón para empezar",
      body: simple
        ? "Cada día verás un botón grande: «Empezar». Tócalo y la app te dará ejercicios cortos, uno por uno. No tienes que decidir nada."
        : "«Tu sesión de hoy» reparte tus minutos entre repaso, vocabulario, gramática y escucha según lo que más te ayuda ahora. Pulsa «Empezar sesión» o elige otra duración.",
      preview: (
        <Preview>
          <p className="font-display font-extrabold">Tu sesión de hoy</p>
          <div className="mt-2 flex gap-1">
            <span className="h-2 flex-[6] rounded-full bg-[var(--skill-reading)]" />
            <span className="h-2 flex-[5] rounded-full bg-[var(--skill-vocabulary)]" />
            <span className="h-2 flex-[5] rounded-full bg-[var(--skill-grammar)]" />
            <span className="h-2 flex-[4] rounded-full bg-[var(--skill-listening)]" />
          </div>
          <div className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-on-primary">
            Empezar <ArrowRight size={16} />
          </div>
        </Preview>
      ),
    },
    {
      icon: Repeat,
      color: "var(--skill-reading)",
      title: "Repasa justo antes de olvidar",
      body: "Tu memoria olvida poco a poco. La app calcula cuándo estás a punto de olvidar cada palabra y te la vuelve a mostrar en ese momento. Así se queda para siempre con muy poco esfuerzo.",
      preview: (
        <Preview>
          <svg viewBox="0 0 240 80" className="w-full" role="img" aria-label="Curva del olvido">
            <line x1="8" y1="72" x2="232" y2="72" stroke="var(--border)" strokeWidth="1.5" />
            <path d="M12 12 C 40 58, 56 64, 70 66" fill="none" stroke="var(--skill-listening)" strokeWidth="3" strokeLinecap="round" />
            <path d="M70 12 C 106 46, 128 52, 150 54" fill="none" stroke="var(--skill-reading)" strokeWidth="3" strokeLinecap="round" />
            <path d="M150 12 C 186 30, 208 34, 232 36" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="5" fill="var(--primary)" />
            {[70, 150].map((x) => <circle key={x} cx={x} cy="12" r="5" fill="var(--success)" />)}
          </svg>
          <p className="mt-1 text-xs text-muted">Aprendes una palabra (punto morado) y cada repaso (verde) hace que el recuerdo dure más.</p>
        </Preview>
      ),
    },
    {
      icon: Target,
      color: "var(--danger)",
      title: "Aprende de tus errores",
      body: "Equivocarse es parte de aprender. La app no sólo marca «incorrecto»: entiende qué tipo de error fue y te propone practicar justo eso. Si aciertas pero no estabas seguro, toca «Adiviné» y lo repasarás antes.",
      preview: (
        <Preview>
          <div className="space-y-2 text-sm">
            {[["Pasado simple", 1], ["Artículos", 0.7], ["Preposiciones", 0.5]].map(([l, w]) => (
              <div key={l as string} className="flex items-center gap-2">
                <span className="w-28 shrink-0">{l}</span>
                <span className="h-2 flex-1 rounded-full bg-surface-muted"><span className="block h-2 rounded-full bg-danger" style={{ width: `${(w as number) * 100}%` }} /></span>
                <span className="text-xs font-semibold text-primary">Practicar</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2 text-xs">
            <span className="flex-1 text-muted">¿Lo sabías con seguridad?</span>
            <span className="rounded-full bg-surface px-2 py-0.5 font-semibold text-success-ink">Sí</span>
            <span className="rounded-full bg-surface px-2 py-0.5 font-semibold">Adiviné</span>
          </div>
        </Preview>
      ),
    },
    {
      icon: Headphones,
      color: "var(--skill-listening)",
      title: "Escucha cada palabra",
      body: "Toca el botón del altavoz para oír cómo se pronuncia. Si va muy rápido, elige 0,75× o activa «Audio más lento» en Configuración. Repite en voz alta: ayuda muchísimo.",
      preview: (
        <Preview>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-display text-2xl font-extrabold">although</p>
              <p className="text-xs text-muted">/ɔːlˈðoʊ/ · aunque</p>
            </div>
            <span className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary"><Volume2 size={20} /></span>
          </div>
          <div className="mt-3 flex gap-1.5 text-xs font-semibold">
            {["0,75×", "1×", "1,25×"].map((s, i) => <span key={s} className={cn("rounded-full px-2.5 py-1", i === 0 ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted")}>{s}</span>)}
          </div>
        </Preview>
      ),
    },
    {
      icon: Sparkles,
      color: "var(--skill-reading)",
      title: "Lee, escucha, habla y escribe",
      body: simple
        ? "En «Leer» hay noticias y artículos reales: toca cualquier palabra y verás qué significa. En «Escuchar» y «Hablar» entrenas el oído y la voz, a tu ritmo."
        : "Lecturas reales de Wikipedia (toca una palabra y la entiendes), escucha con dictado, pronunciación en voz alta y un editor que corrige lo que escribes. Y en tu perfil, un test de 2 minutos adapta los ejercicios a tu forma de aprender.",
      preview: (
        <Preview>
          <p className="text-sm leading-relaxed">
            The <span className="rounded bg-primary-soft px-1 font-semibold text-primary">harbour</span> was quiet that morning…
          </p>
          <p className="mt-2 rounded-lg bg-surface px-2 py-1 text-xs shadow-sm">harbour → <strong>puerto</strong></p>
          <div className="mt-3 flex gap-1.5 text-xs font-semibold">
            {["📖 Leer", "🎧 Escuchar", "🎙️ Hablar", "🖋️ Escribir"].map((x) => <span key={x} className="rounded-full bg-surface-muted px-2.5 py-1 text-muted">{x}</span>)}
          </div>
        </Preview>
      ),
    },
    {
      icon: BarChart3,
      color: "var(--skill-grammar)",
      title: "Mira cómo avanzas",
      body: simple
        ? "En «Progreso» verás cuántas palabras ya sabes y cuántos días llevas practicando. Si algo se ve pequeño, en Configuración → Comodidad puedes agrandar la letra. Y puedes volver a ver este tutorial cuando quieras."
        : "En «Progreso» verás tu nivel por habilidad, tu precisión, tus rachas y cómo se calcula cada número. En Configuración → Comodidad puedes cambiar el tamaño de letra, activar el modo sencillo o repetir este tutorial.",
      preview: (
        <Preview>
          <div className="space-y-2 text-sm">
            {[["Vocabulario", "B1", 0.6, "var(--skill-vocabulary)"], ["Gramática", "A2", 0.4, "var(--skill-grammar)"], ["Listening", "A2", 0.3, "var(--skill-listening)"]].map(([l, lvl, w, c]) => (
              <div key={l as string} className="flex items-center gap-2">
                <span className="w-24 shrink-0">{l}</span>
                <span className="rounded-full bg-primary-soft px-2 text-xs font-semibold text-primary">{lvl}</span>
                <span className="h-2 flex-1 rounded-full bg-surface-muted"><span className="block h-2 rounded-full" style={{ width: `${(w as number) * 100}%`, background: c as string }} /></span>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><Settings size={13} /> Configuración → Comodidad</p>
        </Preview>
      ),
    },
  ];
}

export function WelcomeTour({ name, language, simple, open: initiallyOpen }: { name: string | null; language: string; simple: boolean; open: boolean }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const steps = buildSteps(name, language, simple);
  const last = step === steps.length - 1;
  const current = steps[step]!;
  const Icon = current.icon;

  useEffect(() => {
    if (initiallyOpen && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [initiallyOpen]);

  const close = useCallback(
    (skipped: boolean) => {
      dialog.current?.close();
      void completeTutorialAction(skipped);
      // Quita ?tutorial=1 de la URL sin recargar datos innecesarios.
      if (window.location.search.includes("tutorial")) router.replace("/app", { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    const onCancel = (e: Event) => {
      e.preventDefault();
      close(true);
    };
    d.addEventListener("keydown", onKey);
    d.addEventListener("cancel", onCancel);
    return () => {
      d.removeEventListener("keydown", onKey);
      d.removeEventListener("cancel", onCancel);
    };
  }, [close, steps.length]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
      className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-[28px] border border-border bg-surface p-0 text-text shadow-[0_30px_80px_rgb(31_27_46/0.25)] backdrop:bg-[rgb(31_27_46/0.45)] backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[90dvh] flex-col overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl" style={{ color: current.color, background: `color-mix(in srgb, ${current.color} 14%, transparent)` }} aria-hidden>
            <Icon size={22} />
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Paso {step + 1} de {steps.length}</p>
          <button type="button" onClick={() => close(true)} className="ml-auto rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-text">
            Saltar
          </button>
        </div>

        <div key={step} className="animate-rise">
          <h2 id="tour-title" tabIndex={-1} autoFocus className="mt-5 font-display text-2xl font-extrabold tracking-tight outline-none sm:text-[28px]">{current.title}</h2>
          <p id="tour-body" className="mt-2 leading-relaxed text-muted">{current.body}</p>
          <div className="mt-5">{current.preview}</div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <span key={i} className={cn("h-2 rounded-full transition-all", i === step ? "w-6 bg-primary" : "w-2 bg-border")} />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)} aria-label="Paso anterior">
              <ArrowLeft size={18} aria-hidden />
            </Button>
          )}
          <Button size="lg" className="flex-1" onClick={() => (last ? close(false) : setStep((s) => s + 1))}>
            {last ? "¡A aprender!" : "Siguiente"} {!last && <ArrowRight size={18} aria-hidden />}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
