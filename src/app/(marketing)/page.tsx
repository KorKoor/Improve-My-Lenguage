import type { Metadata } from "next";
import { ArrowRight, Users, CircleHelp, Compass, Gauge, Headphones, MessageCircle, Mic, Newspaper, PenLine, Repeat, Snail, Sparkles, Target, Type, UserRound } from "lucide-react";
import { LanguageMark } from "@/components/language-mark";
import Link from "next/link";
import { Afi } from "@/components/afi/afi";
import { AfiMessage } from "@/components/afi/afi-message";
import { JsonLd } from "@/components/seo/json-ld";
import { GUIDES } from "@/lib/content/guides";
import { graph, webAppLd } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconBox } from "@/components/ui/icon-box";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LANGUAGES } from "@/lib/content";
import { LiveAfi } from "@/components/afi/live-afi";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const LOOP = ["Diagnóstico", "Perfil de habilidades", "Sesión adaptada", "Evaluación", "Actualización del perfil"];

const FEATURES = [
  { icon: Gauge, color: "var(--skill-vocabulary)", title: "Diagnóstico adaptativo", text: "Un test que se ajusta a cada respuesta (modelo de Rasch) para encontrar tu nivel real en pocos minutos, habilidad por habilidad." },
  { icon: Repeat, color: "var(--skill-reading)", title: "Repetición espaciada FSRS", text: "Cada palabra vuelve justo antes de que la olvides. El algoritmo usa tu velocidad, tus intentos y tu confianza." },
  { icon: Target, color: "var(--danger)", title: "Inteligencia de errores", text: "No sólo 'incorrecto': clasificamos cada error (pasado, artículos, traducción literal…) y detectamos los que repites." },
  { icon: Users, color: "var(--skill-speaking)", title: "Aprende en familia", text: "Crea un grupo con tu familia o amigos, mirad quién ya estudió hoy y mandaos ánimos. Cada uno con su idioma y su nivel." },
  { icon: MessageCircle, color: "var(--skill-speaking)", title: "Tutor personal", text: "Conversa con un tutor que conoce tu nivel, tus intereses y tus errores. Te da feedback al final, sin interrumpirte." },
  { icon: Compass, color: "var(--skill-listening)", title: "Recomendaciones explicadas", text: "\"Practica preposiciones: fallaste en 4 de tus últimas 6 sesiones.\" Siempre sabrás por qué." },
  { icon: Newspaper, color: "var(--skill-reading)", title: "Lecturas reales", text: "Artículos de Wikipedia, Wikinews y Wikivoyage ordenados según cuánto entiendes. Toca cualquier palabra y verás qué significa." },
  { icon: Headphones, color: "var(--skill-listening)", title: "Escucha y dictado", text: "Frases reales a la velocidad que elijas. Escribe lo que oyes y te marcamos palabra por palabra." },
  { icon: Mic, color: "var(--skill-pronunciation)", title: "Pronunciación", text: "Lee en voz alta y comprueba qué palabras se entienden. Sin grabar ni guardar tu voz." },
  { icon: PenLine, color: "var(--skill-writing)", title: "Escritura corregida", text: "Consignas de A1 a C1 y correcciones de ortografía, acentos y estilo al instante, con IA opcional." },
  { icon: UserRound, color: "var(--primary)", title: "Hecho a tu manera", text: "Un test de 2 minutos descubre cómo aprendes mejor y ajusta el ritmo, el reto y las explicaciones." },
  { icon: Sparkles, color: "var(--skill-vocabulary)", title: "Tus datos te hablan", text: "Qué parte de un texto real entiendes ya, cuándo llegarás al siguiente nivel y qué palabras se te resisten." },
];

export default function Landing() {
  const available = LANGUAGES.filter((l) => l.status !== "planned");
  return (
    <>
      <JsonLd data={graph(webAppLd(available.map((l) => l.name)))} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
        <div className="animate-rise">
          <Chip tone="primary"><Sparkles size={13} aria-hidden /> Aprendizaje adaptativo de idiomas</Chip>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Aprende idiomas con un curso
            <span className="block text-primary">que se adapta a ti.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Improve My Languages mide tu nivel en cada habilidad, detecta los errores que repites y programa tus repasos antes de que olvides. Con esos datos construye cada sesión: practicas lo que necesitas <em>ahora</em>, no lo que toca en un temario.
          </p>
          <ol className="mt-6 grid max-w-xl gap-2 text-sm sm:grid-cols-3">
            {["Diagnóstico de ~5 min", "Perfil por habilidad", "Sesiones a tu medida"].map((t, i) => (
              <li key={t} className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 font-semibold shadow-[var(--shadow)]"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs text-primary">{i + 1}</span>{t}</li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/login?mode=signup" size="lg">Descubre qué necesitas practicar <ArrowRight size={18} aria-hidden /></ButtonLink>
            <ButtonLink href="/features" variant="secondary" size="lg">Cómo funciona</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">Gratis · Sin tarjeta · {available.length} idiomas · Tus datos se pueden exportar o borrar cuando quieras</p>
        </div>

        {/* Vista previa del producto (HTML real, no una imagen) */}
        <div className="relative animate-rise [animation-delay:120ms]">
          <div className="card relative p-6">
            <LiveAfi size={96} mood="listening" motion="float" className="!absolute -top-12 right-6" />
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

      <section aria-labelledby="meet-afi" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="card grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[auto_1fr]">
          <LiveAfi mood="waving" size={150} className="mx-auto" />
          <div>
            <h2 id="meet-afi" className="font-display text-2xl font-extrabold sm:text-3xl">Conoce a Afi, tu compañera de aprendizaje</h2>
            <p className="mt-3 text-muted">El sistema mide y decide; Afi te lo cuenta. Cuando un error se repite, te dice «He notado que este error aparece varias veces. Vamos a practicarlo». Cuando fallas, no te castiga: «Este ejercicio nos ayuda a saber qué necesitas practicar».</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <AfiMessage mood="thinking" size={48}>Preposiciones: 4 errores en tus últimas sesiones. Hoy lo reforzamos un poco.</AfiMessage>
              <AfiMessage mood="proud" size={48}>Esto ya está empezando a consolidarse.</AfiMessage>
            </div>
            <Link href="/afi" className="mt-5 inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">Más sobre Afi <ArrowRight size={15} aria-hidden /></Link>
          </div>
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

      <section aria-labelledby="family" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="card grid items-center gap-8 overflow-hidden p-6 sm:p-10 md:grid-cols-2">
          <div>
            <Chip tone="success">Para toda la familia</Chip>
            <h2 id="family" className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">Fácil para quien nunca ha usado una app de idiomas</h2>
            <p className="mt-3 text-muted">Con el <strong className="text-text">modo sencillo</strong>, cualquier persona puede practicar sin perderse: un solo botón para empezar, frases claras en lugar de gráficas y ayuda siempre a mano.</p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Type, text: "Letra grande o muy grande en toda la app" },
                { icon: Snail, text: "Audio más lento para entender cada palabra" },
                { icon: CircleHelp, text: "Tutorial guiado al empezar, y siempre disponible" },
                { icon: Sparkles, text: "Explicaciones paso a paso en español" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success-ink" aria-hidden><Icon size={20} /></span>
                  <span className="font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Vista previa del modo sencillo */}
          <div className="rounded-[26px] bg-bg p-5 sm:p-6" aria-hidden>
            <div className="flex items-center gap-3">
              <Afi size={56} mood="waving" />
              <div>
                <p className="font-display text-2xl font-extrabold">Hola, Rosa</p>
                <p className="text-muted">Vamos a practicar inglés.</p>
              </div>
            </div>
            <div className="card mt-4 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Tu práctica de hoy</p>
              <p className="mt-1 font-display text-xl font-extrabold">10 minutos · uno por uno</p>
              <div className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-semibold text-on-primary">Empezar <ArrowRight size={20} /></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="card p-4"><p className="font-display text-2xl font-extrabold">6</p><p className="text-sm text-muted">días seguidos</p></div>
              <div className="card p-4"><p className="font-display text-2xl font-extrabold">48</p><p className="text-sm text-muted">palabras que ya sabes</p></div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="learn-more" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 id="learn-more" className="font-display text-2xl font-extrabold sm:text-3xl">Entiende cómo aprendes</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.slice(0, 6).map((g) => (
            <li key={g.slug}><Link href={`/guias/${g.slug}`} className="card lift flex h-full items-center justify-between gap-3 p-5 font-semibold hover:border-primary">{g.h1}<ArrowRight size={16} className="shrink-0 text-primary" aria-hidden /></Link></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="langs" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="card flex flex-col gap-6 p-8 md:flex-row md:items-center">
          <div className="flex-1">
            <h2 id="langs" className="font-display text-2xl font-extrabold">{available.length} idiomas, el mismo motor adaptativo</h2>
            <p className="mt-2 text-muted">Escrituras latinas, cirílico, árabe, hangul, kana, kanji y hanzi: si el idioma usa otro alfabeto, primero aprendes a leerlo. Disponibles: {available.map((l) => l.name.toLowerCase()).join(", ")}.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {available.map((l) => (
              <Link key={l.code} href={`/languages/${l.code}`} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-primary">
                <span className="inline-flex items-center gap-2"><LanguageMark code={l.code} size={20} /> {l.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 text-center sm:px-6">
        <LiveAfi size={100} mood="encouraging" className="mx-auto" />
        <h2 className="mt-4 font-display text-3xl font-extrabold">Learn smarter. Become better.</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">Unos 5 minutos de diagnóstico y tendrás tu primera sesión personalizada.</p>
        <ButtonLink href="/login?mode=signup" size="lg" className="mt-6">Crear mi cuenta gratis</ButtonLink>
      </section>
    </>
  );
}
