"use client";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Type } from "lucide-react";
import { LanguageMark } from "@/components/language-mark";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { applyComfort } from "@/components/comfort";
import { saveOnboarding, type OnboardingInput } from "@/app/app/actions";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { CefrLevel, Topic } from "@/lib/content/types";

interface LangOpt { code: string; name: string; nativeName: string; status: string; taken: boolean }
type Defaults = Pick<OnboardingInput, "displayName" | "nativeLanguage" | "dailyMinutes" | "interests" | "explanationDepth" | "preferredDifficulty" | "competitive" | "interactionPrefs" | "aiConsent" | "privacyAccepted">;

const LEVELS: { v: CefrLevel | "unknown"; label: string; hint: string }[] = [
  { v: "unknown", label: "No lo sé", hint: "El diagnóstico lo averigua" },
  { v: "A1", label: "A1 · Principiante", hint: "Conozco palabras sueltas" },
  { v: "A2", label: "A2 · Básico", hint: "Frases simples del día a día" },
  { v: "B1", label: "B1 · Intermedio", hint: "Me defiendo en situaciones comunes" },
  { v: "B2", label: "B2 · Intermedio alto", hint: "Converso con cierta fluidez" },
  { v: "C1", label: "C1 · Avanzado", hint: "Me expreso con soltura y matices" },
  { v: "C2", label: "C2 · Maestría", hint: "Casi como un nativo" },
];
const REASONS = ["Trabajo", "Viajar", "Estudios / certificación", "Entender series, música o juegos", "Mudarme a otro país", "Por gusto"];
const MINUTES = [5, 10, 15, 20, 30, 45, 60];
const PREFS = [
  ["examples", "Aprender con muchos ejemplos"],
  ["reading", "Leer textos"],
  ["music", "Escuchar música y audio"],
  ["conversation", "Conversar"],
  ["challenges", "Retos difíciles"],
] as const;

export function OnboardingWizard({ adding, languages, topics, defaults }: { adding: boolean; languages: LangOpt[]; topics: Topic[]; defaults: Defaults }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingInput>({
    ...defaults,
    language: languages.find((l) => !l.taken)?.code ?? "en",
    selfLevel: "unknown",
    targetLevel: "B2",
    months: 6,
    reason: "",
    timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Mexico_City",
    experience: adding ? undefined : "standard",
    textSize: "normal",
    ...(adding ? { adding: true, priority: "active" as const, dailyMinutes: 10 } : {}),
  });
  // Vista previa inmediata del tamaño de letra y del audio elegidos.
  useEffect(() => {
    if (data.experience) applyComfort(data.textSize ?? "normal", data.experience === "simple");
  }, [data.experience, data.textSize]);
  const chooseExperience = (e: "standard" | "simple") =>
    setData((d) => ({
      ...d,
      experience: e,
      textSize: e === "simple" ? "large" : "normal",
      // Modo sencillo: explicaciones completas y ejercicios suaves (se pueden cambiar después).
      explanationDepth: e === "simple" ? "detailed" : d.explanationDepth,
      preferredDifficulty: e === "simple" ? "easy" : d.preferredDifficulty,
    }));
  const set = <K extends keyof OnboardingInput>(k: K, v: OnboardingInput[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggle = (k: "interests" | "interactionPrefs", v: string) =>
    setData((d) => ({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] }));

  const steps = useMemo(() => {
    const all = ["language", "experience", "level", "goal", "time", "interests", "prefs", "consent"] as const;
    // Al añadir un idioma, el perfil general ya existe: sólo lo específico del idioma.
    return adding ? (["language", "level", "goal", "time"] as const) : all;
  }, [adding]);
  const current = steps[step]!;
  const lang = languages.find((l) => l.code === data.language);
  const canNext =
    current === "language" ? Boolean(lang && !lang.taken) :
    current === "consent" ? data.privacyAccepted :
    true;

  async function finish() {
    setBusy(true);
    setError(null);
    const res = await saveOnboarding({ ...data, privacyAccepted: adding ? true : data.privacyAccepted });
    if (!res.ok) { setBusy(false); setError(res.error); return; }
    router.push(res.data.next);
  }

  const option = (active: boolean) => cn("flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition", active ? "border-2 border-primary bg-primary-soft" : "border-border bg-surface hover:border-primary/60");

  return (
    <div className="flex flex-1 flex-col py-6">
      <div className="flex items-center gap-4">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} aria-label="Atrás" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-muted"><ArrowLeft size={20} /></button>
        ) : <span className="size-9" />}
        <ProgressBar value={(step + 1) / steps.length} label={`Paso ${step + 1} de ${steps.length}`} height={8} className="flex-1" />
        <span className="text-xs font-semibold text-muted">{step + 1}/{steps.length}</span>
      </div>

      <div key={current} className="mt-8 flex-1 animate-rise">
        {current === "language" && (
          <>
            {!adding && <Mascot size={84} />}
            <h1 className="mt-3 font-display text-3xl font-extrabold">{adding ? "¿Qué idioma quieres añadir?" : "¡Hola! ¿Qué idioma quieres aprender?"}</h1>
            {!adding && (
              <label className="mt-6 block">
                <span className="mb-1.5 block text-sm font-medium">¿Cómo te llamas? <span className="text-muted">(opcional)</span></span>
                <input value={data.displayName} onChange={(e) => set("displayName", e.target.value)} maxLength={60} autoComplete="given-name" className="h-12 w-full rounded-xl border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft" />
              </label>
            )}
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Idioma">
              {languages.map((l) => (
                <button key={l.code} type="button" role="radio" aria-checked={data.language === l.code} disabled={l.taken} onClick={() => set("language", l.code)} className={cn(option(data.language === l.code), l.taken && "opacity-50")}>
                  <LanguageMark code={l.code} size={40} />
                  <span className="flex-1"><span className="block font-semibold">{l.name}</span><span className="text-sm text-muted" lang={l.code}>{l.nativeName}</span></span>
                  {l.taken ? <span className="text-xs text-muted">Ya lo estudias</span> : l.status === "beta" ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted">Beta</span> : null}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">Más idiomas en camino: la plataforma está preparada para cualquier sistema de escritura.</p>
          </>
        )}

        {current === "experience" && (
          <>
            <h1 className="font-display text-3xl font-extrabold">¿Cómo te gustaría usar la app?</h1>
            <p className="mt-2 text-muted">Puedes cambiarlo cuando quieras en Configuración → Comodidad.</p>
            <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Experiencia">
              <button type="button" role="radio" aria-checked={data.experience === "standard"} onClick={() => chooseExperience("standard")} className={option(data.experience === "standard")}>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><Sparkles size={22} aria-hidden /></span>
                <span className="flex-1">
                  <span className="block font-semibold">Completa</span>
                  <span className="text-sm text-muted">Todas las estadísticas, gráficas y opciones a la vista.</span>
                </span>
                {data.experience === "standard" && <Check size={18} className="text-primary" aria-hidden />}
              </button>
              <button type="button" role="radio" aria-checked={data.experience === "simple"} onClick={() => chooseExperience("simple")} className={option(data.experience === "simple")}>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-success-soft text-success"><Type size={22} aria-hidden /></span>
                <span className="flex-1">
                  <span className="block font-semibold">Sencilla</span>
                  <span className="text-sm text-muted">Letra grande, audio más lento, explicaciones paso a paso y un solo botón para empezar. Ideal si no usas muchas apps.</span>
                </span>
                {data.experience === "simple" && <Check size={18} className="text-primary" aria-hidden />}
              </button>
            </div>
            <p className="mt-6 text-sm font-semibold">Tamaño de letra</p>
            <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tamaño de letra">
              {([["normal", "Normal", "text-base"], ["large", "Grande", "text-lg"], ["xl", "Muy grande", "text-xl"]] as const).map(([v, l, size]) => (
                <button key={v} type="button" role="radio" aria-checked={data.textSize === v} onClick={() => set("textSize", v)} className={cn("rounded-xl border py-3 font-semibold", size, data.textSize === v ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>
                  {l}
                </button>
              ))}
            </div>
          </>
        )}

        {current === "level" && (
          <>
            <h1 className="font-display text-3xl font-extrabold">¿Cuál crees que es tu nivel de {lang?.name.toLowerCase()}?</h1>
            <p className="mt-2 text-muted">Sólo es un punto de partida. El diagnóstico medirá tu nivel real.</p>
            <div className="mt-6 grid gap-2" role="radiogroup" aria-label="Nivel">
              {LEVELS.map((l) => (
                <button key={l.v} type="button" role="radio" aria-checked={data.selfLevel === l.v} onClick={() => set("selfLevel", l.v)} className={option(data.selfLevel === l.v)}>
                  <span className="flex-1"><span className="block font-semibold">{l.label}</span><span className="text-sm text-muted">{l.hint}</span></span>
                  {data.selfLevel === l.v && <Check size={18} className="text-primary" aria-hidden />}
                </button>
              ))}
            </div>
          </>
        )}

        {current === "goal" && (
          <>
            <h1 className="font-display text-3xl font-extrabold">¿Cuál es tu objetivo?</h1>
            <p className="mt-5 text-sm font-semibold">¿Por qué quieres aprenderlo?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button key={r} type="button" aria-pressed={data.reason === r} onClick={() => set("reason", r)} className={cn("rounded-full border px-3.5 py-2 text-sm font-medium", data.reason === r ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>{r}</button>
              ))}
            </div>
            <p className="mt-6 text-sm font-semibold">Nivel que quieres alcanzar</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["A2", "B1", "B2", "C1", "C2"] as CefrLevel[]).map((l) => (
                <button key={l} type="button" aria-pressed={data.targetLevel === l} onClick={() => set("targetLevel", l)} className={cn("h-11 w-14 rounded-xl border font-semibold", data.targetLevel === l ? "border-primary bg-primary text-on-primary" : "border-border bg-surface")}>{l}</button>
              ))}
            </div>
            <label className="mt-6 block">
              <span className="text-sm font-semibold">En cuánto tiempo: <span className="text-primary">{data.months} {data.months === 1 ? "mes" : "meses"}</span></span>
              <input type="range" min={1} max={24} value={data.months} onChange={(e) => set("months", Number(e.target.value))} className="mt-3 w-full accent-[var(--primary)]" />
            </label>
          </>
        )}

        {current === "time" && adding && (
          <>
            <h1 className="font-display text-3xl font-extrabold">¿Qué papel tendrá este idioma?</h1>
            <p className="mt-2 text-muted">Repartimos tu tiempo diario entre todos tus idiomas según esto. Podrás cambiarlo cuando quieras en «Mis idiomas».</p>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
              {([["main", "Principal", "Mi foco ahora"], ["active", "En progreso", "Avanzar sin ser el foco"], ["maintain", "Mantener", "Sólo repasos para no olvidarlo"]] as const).map(([v, label, hint]) => (
                <button key={v} type="button" aria-pressed={data.priority === v} onClick={() => set("priority", v)} className={cn("rounded-2xl border p-4 text-left", data.priority === v ? "border-2 border-primary bg-primary-soft" : "border-border bg-surface")}>
                  <span className={cn("block font-semibold", data.priority === v && "text-primary")}>{label}</span>
                  <span className="text-sm text-muted">{hint}</span>
                </button>
              ))}
            </div>
            <h2 className="mt-8 font-display text-xl font-extrabold">¿Cuántos minutos más al día para este idioma?</h2>
            <p className="mt-1 text-sm text-muted">Se suman a tu tiempo diario total.</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {[5, 10, 15, 20, 30].map((m) => (
                <button key={m} type="button" aria-pressed={data.dailyMinutes === m} onClick={() => set("dailyMinutes", m)} className={cn("rounded-2xl border py-3 text-center", data.dailyMinutes === m ? "border-2 border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>
                  <span className="block font-display text-xl font-extrabold">+{m}</span><span className="text-xs text-muted">min</span>
                </button>
              ))}
            </div>
          </>
        )}

        {current === "time" && !adding && (
          <>
            <h1 className="font-display text-3xl font-extrabold">¿Cuánto tiempo puedes estudiar al día?</h1>
            <p className="mt-2 text-muted">Mejor poco y constante que mucho de vez en cuando. Podrás cambiarlo en cada sesión.</p>
            <div className="mt-6 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {MINUTES.map((m) => (
                <button key={m} type="button" aria-pressed={data.dailyMinutes === m} onClick={() => set("dailyMinutes", m)} className={cn("rounded-2xl border py-4 text-center", data.dailyMinutes === m ? "border-2 border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>
                  <span className="block font-display text-2xl font-extrabold">{m}</span><span className="text-xs text-muted">min</span>
                </button>
              ))}
            </div>
          </>
        )}

        {current === "interests" && (
          <>
            <h1 className="font-display text-3xl font-extrabold">¿Qué temas te interesan?</h1>
            <p className="mt-2 text-muted">Elegiremos vocabulario y conversaciones relacionados. Elige los que quieras.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {topics.map((t) => (
                <button key={t.id} type="button" aria-pressed={data.interests.includes(t.id)} onClick={() => toggle("interests", t.id)} className={cn("rounded-full border px-4 py-2.5 text-sm font-medium transition", data.interests.includes(t.id) ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>
                  <span aria-hidden>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </>
        )}

        {current === "prefs" && (
          <>
            <h1 className="font-display text-3xl font-extrabold">¿Cómo prefieres aprender?</h1>
            <p className="mt-2 text-muted">Son preferencias de interacción, no un test de personalidad: puedes cambiarlas cuando quieras.</p>
            <p className="mt-6 text-sm font-semibold">Explicaciones</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([["brief", "Rápidas"], ["balanced", "Equilibradas"], ["detailed", "Detalladas"]] as const).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={data.explanationDepth === v} onClick={() => set("explanationDepth", v)} className={cn("rounded-xl border py-3 text-sm font-semibold", data.explanationDepth === v ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>{l}</button>
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold">Dificultad de los ejercicios</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([["easy", "Suave"], ["balanced", "Equilibrada"], ["challenging", "Retadora"]] as const).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={data.preferredDifficulty === v} onClick={() => set("preferredDifficulty", v)} className={cn("rounded-xl border py-3 text-sm font-semibold", data.preferredDifficulty === v ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>{l}</button>
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold">Te gusta…</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PREFS.map(([v, l]) => (
                <button key={v} type="button" aria-pressed={data.interactionPrefs.includes(v)} onClick={() => toggle("interactionPrefs", v)} className={cn("rounded-full border px-3.5 py-2 text-sm font-medium", data.interactionPrefs.includes(v) ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface")}>{l}</button>
              ))}
            </div>
            <label className="mt-5 flex items-center gap-3 text-sm">
              <input type="checkbox" checked={data.competitive} onChange={(e) => set("competitive", e.target.checked)} className="size-5 accent-[var(--primary)]" />
              Me motivan los retos y las metas medibles
            </label>
          </>
        )}

        {current === "consent" && (
          <>
            <h1 className="font-display text-3xl font-extrabold">Tus datos, bajo tu control</h1>
            <div className="card mt-6 space-y-3 p-5 text-sm text-muted">
              <p>Guardamos tus respuestas, errores y tiempo de estudio <strong className="text-text">sólo para personalizar tu aprendizaje</strong>. Puedes descargarlos o borrar tu cuenta cuando quieras desde Configuración.</p>
            </div>
            <label className="mt-5 flex items-start gap-3 text-sm">
              <input type="checkbox" checked={data.privacyAccepted} onChange={(e) => set("privacyAccepted", e.target.checked)} className="mt-0.5 size-5 accent-[var(--primary)]" />
              <span>He leído y acepto el <a href="/privacy" target="_blank" className="font-semibold text-primary underline">aviso de privacidad</a>.</span>
            </label>
            <label className="mt-4 flex items-start gap-3 text-sm">
              <input type="checkbox" checked={data.aiConsent} onChange={(e) => set("aiConsent", e.target.checked)} className="mt-0.5 size-5 accent-[var(--primary)]" />
              <span>Activar el <strong>tutor de IA</strong>. Los mensajes que le escribas y un resumen de tu nivel se envían al proveedor de IA para generar respuestas (nunca tu correo). <span className="text-muted">Opcional; puedes cambiarlo después.</span></span>
            </label>
          </>
        )}
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>}
      <div className="sticky bottom-0 mt-8 bg-bg pb-6 pt-3">
        {step < steps.length - 1 ? (
          <Button size="lg" className="w-full" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continuar <ArrowRight size={18} aria-hidden /></Button>
        ) : (
          <Button size="lg" className="w-full" disabled={!canNext || busy} onClick={() => void finish()}>
            {busy ? <Loader2 className="animate-spin" size={18} aria-hidden /> : null} Crear mi plan y hacer el diagnóstico
          </Button>
        )}
      </div>
    </div>
  );
}
