import type { Metadata } from "next";
import Link from "next/link";
import { Afi } from "@/components/afi/afi";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { LanguageMark } from "@/components/language-mark";
import { ButtonLink } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/content";
import { BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Acerca de Improve My Languages",
  description: "Qué es Improve My Languages, qué problema resuelve, cómo funciona su motor adaptativo, qué idiomas enseña y quién es Afi, su compañera de aprendizaje.",
  alternates: { canonical: "/about" },
  openGraph: { title: `Acerca de ${BRAND.name}`, url: "/about" },
};

const HOW: [string, string, string][] = [
  ["Diagnóstico adaptativo", "Un test que se ajusta a cada respuesta (modelo de Rasch) estima tu nivel MCER por habilidad.", "/guias/nivel-mcer"],
  ["Perfil de habilidades", "Vocabulario, gramática, lectura, escucha, escritura y habla tienen su propia estimación, que cambia con cada ejercicio.", "/guias/aprendizaje-adaptativo"],
  ["Repetición espaciada FSRS", "Cada palabra y tema vuelve cuando está a punto de olvidarse.", "/guias/repeticion-espaciada"],
  ["Inteligencia de errores", "Cada error se clasifica; los que se repiten se convierten en práctica dirigida.", "/guias/errores-recurrentes"],
  ["Sesiones que se arman solas", "Según tus minutos, tus repasos pendientes, tus debilidades y tus intereses, con el porqué de cada bloque.", "/features"],
];

export default function About() {
  const available = LANGUAGES.filter((l) => l.status !== "planned");
  const planned = LANGUAGES.filter((l) => l.status === "planned");
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ name: "Inicio", path: "/" }, { name: "Acerca de", path: "/about" }]} />
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight">Acerca de Improve My Languages</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        <strong className="text-text">Improve My Languages</strong> es una plataforma web de aprendizaje adaptativo de idiomas para hispanohablantes. Mide tu nivel por habilidad, programa los repasos con repetición espaciada, detecta los errores que repites y construye cada sesión a partir de esos datos. Su lema: <em>{BRAND.tagline}</em>
      </p>

      <section className="mt-12" aria-labelledby="problem">
        <h2 id="problem" className="font-display text-2xl font-extrabold">Qué problema resuelve</h2>
        <p className="mt-3 leading-relaxed text-muted">Los cursos fijos tratan igual a todo el mundo: repites lo que ya sabes y pasas de largo lo que te cuesta. Las apps de tarjetas repasan palabras sueltas pero no ven tus errores de gramática. Improve My Languages se pregunta qué necesita aprender cada persona <em>ahora mismo</em> para mejorar. {BRAND.philosophy}</p>
      </section>

      <section className="mt-12" aria-labelledby="how">
        <h2 id="how" className="font-display text-2xl font-extrabold">Cómo funciona</h2>
        <ol className="mt-4 space-y-3">
          {HOW.map(([t, d, href], i) => (
            <li key={t} className="card flex gap-4 p-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{i + 1}</span>
              <span><Link href={href} className="font-semibold hover:text-primary">{t}</Link><span className="block text-sm text-muted">{d}</span></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12" aria-labelledby="langs">
        <h2 id="langs" className="font-display text-2xl font-extrabold">Idiomas</h2>
        <p className="mt-3 text-muted">Disponibles hoy ({available.length}), con la interfaz y las explicaciones en español:</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {available.map((l) => (
            <li key={l.code}><Link href={`/languages/${l.code}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-primary"><LanguageMark code={l.code} size={20} /> {l.name}</Link></li>
          ))}
        </ul>
        {planned.length > 0 && <p className="mt-3 text-sm text-muted">En camino: {planned.map((l) => l.name.toLowerCase()).join(", ")} (aún sin contenido revisado).</p>}
      </section>

      <section className="mt-12" aria-labelledby="tech">
        <h2 id="tech" className="font-display text-2xl font-extrabold">Tecnología y datos</h2>
        <ul className="mt-4 space-y-2 leading-relaxed text-muted">
          <li>• <strong className="text-text">Medición</strong>: tests adaptativos (modelo de Rasch) y niveles del Marco Común Europeo (MCER).</li>
          <li>• <strong className="text-text">Memoria</strong>: FSRS, un algoritmo abierto de repetición espaciada.</li>
          <li>• <strong className="text-text">Contenido abierto</strong>: vocabulario de Wiktionary y wordfreq, frases de Tatoeba, lecturas de Wikipedia y Wikisource, orden de trazos de KanjiVG y Make Me a Hanzi. Detalle y licencias en <Link href="/creditos" className="text-primary underline underline-offset-4">créditos</Link>.</li>
          <li>• <strong className="text-text">Voz</strong>: grabaciones de personas (Wikimedia Commons, Lingua Libre), voces libres Piper y la voz de tu navegador; el reconocimiento de voz lo hace tu navegador.</li>
          <li>• <strong className="text-text">IA</strong>: sólo en el tutor de conversación y en la corrección de escritura, opcional y con tu consentimiento (<Link href="/guias/ia-en-idiomas" className="text-primary underline underline-offset-4">por qué</Link>).</li>
        </ul>
      </section>

      <section className="mt-12 card grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr]" aria-labelledby="afi">
        <Afi mood="happy" size={110} className="mx-auto" />
        <div>
          <h2 id="afi" className="font-display text-2xl font-extrabold">Afi</h2>
          <p className="mt-2 leading-relaxed text-muted">{BRAND.mascotLine} Traduce lo que el sistema aprende de ti en frases cortas, te acompaña en los aciertos y en los fallos, y nunca te castiga. <Link href="/afi" className="font-semibold text-primary underline underline-offset-4">Conoce a Afi</Link>.</p>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="origin">
        <h2 id="origin" className="font-display text-2xl font-extrabold">Origen y principios</h2>
        <div className="mt-3 space-y-3 leading-relaxed text-muted">
          <p>Improve My Languages nació como un proyecto personal: un sistema para aprender idiomas de forma autodidacta con el rigor de una plataforma profesional.</p>
          <p>La regla de cada función es una pregunta: <strong className="text-text">¿esto ayuda realmente a aprender?</strong> Por eso no hay rachas que castigan, ni gemas, ni ligas: hay un modelo de lo que sabes, de lo que estás olvidando y de los errores que repites. Es gratis, y tus datos se pueden exportar o borrar cuando quieras (<Link href="/privacy" className="text-primary underline underline-offset-4">privacidad</Link>).</p>
        </div>
      </section>

      <section id="creador" className="mt-12 scroll-mt-24 card flex flex-col gap-4 p-6 sm:flex-row sm:items-center" aria-labelledby="creator">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-soft font-display text-2xl font-extrabold text-primary" aria-hidden>K</span>
        <div className="flex-1">
          <h2 id="creator" className="font-display text-2xl font-extrabold">Quién está detrás</h2>
          <p className="mt-2 leading-relaxed text-muted">Improve My Languages lo crea y lo mantiene <strong className="text-text">KorKoor</strong>, como proyecto personal.</p>
        </div>
        <a href="https://github.com/KorKoor" target="_blank" rel="me noopener noreferrer" className="inline-flex h-11 items-center gap-2 self-start rounded-2xl border border-border px-4 font-semibold hover:bg-surface-muted sm:self-center">
          <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
          KorKoor en GitHub<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </section>

      <ButtonLink href="/login?mode=signup" size="lg" className="mt-12">Empieza tu diagnóstico</ButtonLink>
    </div>
  );
}
