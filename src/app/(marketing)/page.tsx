import { ArrowRight, Brain, Compass, Gauge, MessageCircle, Repeat, Sparkles, Target } from "lucide-react";
import { LanguageMark } from "@/components/language-mark";
import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconBox } from "@/components/ui/icon-box";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LANGUAGES } from "@/lib/content";

const LOOP = ["Diagnóstico", "Perfil de habilidades", "Sesión adaptada", "Evaluación", "Actualización del perfil"];

const FEATURES = [
  { icon: Gauge, color: "var(--skill-vocabulary)", title: "Diagnóstico adaptativo", text: "Un test que se ajusta a cada respuesta (modelo de Rasch) para encontrar tu nivel real en pocos minutos, habilidad por habilidad." },
  { icon: Repeat, color: "var(--skill-reading)", title: "Repetición espaciada FSRS", text: "Cada palabra vuelve justo antes de que la olvides. El algoritmo usa tu velocidad, tus intentos y tu confianza." },
  { icon: Target, color: "var(--danger)", title: "Inteligencia de errores", text: "No sólo 'incorrecto': clasificamos cada error (pasado, artículos, traducción literal…) y detectamos los que repites." },
  { icon: Brain, color: "var(--skill-grammar)", title: "Vector de habilidades", text: "Tu nivel no es una letra: vocabulario, gramática, listening, speaking… cada una con su propio CEFR." },
  { icon: MessageCircle, color: "var(--skill-speaking)", title: "Tutor personal", text: "Conversa con un tutor que conoce tu nivel, tus intereses y tus errores. Te da feedback al final, sin interrumpirte." },
  { icon: Compass, color: "var(--skill-listening)", title: "Recomendaciones explicadas", text: "\"Practica preposiciones: fallaste en 4 de tus últimas 6 sesiones.\" Siempre sabrás por qué." },
];

export default function Landing() {
  const available = LANGUAGES.filter((l) => l.status !== "planned");
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
        <div className="animate-rise">
          <Chip tone="primary"><Sparkles size={13} aria-hidden /> Aprendizaje adaptativo, no un curso fijo</Chip>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            El usuario no se adapta al curso.
            <span className="block text-primary">El curso se adapta a ti.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Improve My Languages averigua qué necesitas aprender <em>ahora mismo</em>: evalúa tu nivel real, detecta tus errores recurrentes y construye cada sesión para que mejores de verdad.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/login?mode=signup" size="lg">Empieza tu diagnóstico <ArrowRight size={18} aria-hidden /></ButtonLink>
            <ButtonLink href="/features" variant="secondary" size="lg">Cómo funciona</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">Gratis · Sin tarjeta · Tus datos se pueden exportar o borrar cuando quieras</p>
        </div>

        {/* Vista previa del producto (HTML real, no una imagen) */}
        <div className="relative animate-rise [animation-delay:120ms]">
          <div className="card relative p-6">
            <Mascot size={96} className="absolute -top-10 right-6" />
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Tu sesión de hoy · 20 min</p>
            <div className="mt-4 flex gap-1" aria-hidden>
              {[6, 5, 5, 4].map((m, i) => (
                <span key={i} className="h-2.5 rounded-full" style={{ flex: m, background: ["var(--skill-reading)", "var(--skill-grammar)", "var(--skill-vocabulary)", "var(--skill-listening)"][i] }} />
              ))}
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["Repaso", "12 palabras en su punto óptimo", "6 min"],
                ["Gramática · pasado simple", "Error en 4 de tus últimas 6 sesiones", "5 min"],
                ["Vocabulario · programación", "De tus intereses", "5 min"],
                ["Listening", "Tu habilidad con más margen", "4 min"],
              ].map(([t, why, m]) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 rounded-full bg-primary" aria-hidden />
                  <span className="flex-1"><span className="font-semibold">{t}</span><span className="block text-muted">{why}</span></span>
                  <span className="text-muted">{m}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-surface-muted p-3"><p className="text-muted">Gramática</p><p className="font-display text-xl font-extrabold">B1</p><ProgressBar value={0.55} color="var(--skill-grammar)" label="Progreso de gramática" /></div>
              <div className="rounded-2xl bg-surface-muted p-3"><p className="text-muted">Listening</p><p className="font-display text-xl font-extrabold">A2</p><ProgressBar value={0.7} color="var(--skill-listening)" label="Progreso de listening" /></div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="loop" className="border-y border-border/60 bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="loop" className="font-display text-2xl font-extrabold sm:text-3xl">Un ciclo que te conoce un poco mejor en cada sesión</h2>
          <ol className="mt-8 grid gap-3 sm:grid-cols-5">
            {LOOP.map((step, i) => (
              <li key={step} className="card flex items-center gap-3 p-4 sm:flex-col sm:items-start">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{i + 1}</span>
                <span className="font-semibold">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="features" className="font-display text-2xl font-extrabold sm:text-3xl">Diseñado para que aprendas, no para que acumules puntos</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="card p-6">
              <IconBox icon={f.icon} color={f.color} size={44} />
              <h3 className="mt-4 font-display text-lg font-extrabold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="langs" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="card flex flex-col gap-6 p-8 md:flex-row md:items-center">
          <div className="flex-1">
            <h2 id="langs" className="font-display text-2xl font-extrabold">Agnóstico al idioma desde el primer día</h2>
            <p className="mt-2 text-muted">Escrituras latinas, kana y kanji, derecha a izquierda… el motor es el mismo. Empieza con {available.map((l) => l.name.toLowerCase()).join(", ")}; más idiomas en camino.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.slice(0, 8).map((l) => (
              <Link key={l.code} href={`/languages/${l.code}`} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-primary">
                <span className="inline-flex items-center gap-2"><LanguageMark code={l.code} size={20} /> {l.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 text-center sm:px-6">
        <Mascot size={100} mood="cheer" className="mx-auto" />
        <h2 className="mt-4 font-display text-3xl font-extrabold">Pequeños pasos, grandes logros</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">5 minutos de diagnóstico y tendrás tu primera sesión personalizada.</p>
        <ButtonLink href="/login?mode=signup" size="lg" className="mt-6">Crear mi cuenta gratis</ButtonLink>
      </section>
    </>
  );
}
