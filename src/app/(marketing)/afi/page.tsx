import type { Metadata } from "next";
import Link from "next/link";
import { Afi, type AfiMood } from "@/components/afi/afi";
import { AfiMessage } from "@/components/afi/afi-message";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/seo";
import { LiveAfi } from "@/components/afi/live-afi";

export const metadata: Metadata = {
  title: "Afi, tu compañera de aprendizaje",
  description: `${BRAND.mascotLine} Te acompaña en el diagnóstico, en cada sesión y en los días difíciles, y traduce lo que el sistema aprende de ti en frases claras.`,
  alternates: { canonical: "/afi" },
  openGraph: { title: `Afi · ${BRAND.name}`, url: "/afi" },
};

const MOMENTS: { mood: AfiMood; when: string; says: string }[] = [
  { mood: "curious", when: "En el diagnóstico", says: "Te acompaña mientras el test busca tu nivel real, sin presión." },
  { mood: "thinking", when: "Cuando un error se repite", says: "«He notado que este error aparece varias veces. Vamos a practicarlo.»" },
  { mood: "studying", when: "Con los repasos", says: "Te avisa de cuántos repasos están en su punto justo (repetición espaciada)." },
  { mood: "supportive", when: "Cuando fallas", says: "«No pasa nada. Este ejercicio nos ayuda a saber qué necesitas practicar.»" },
  { mood: "proud", when: "Cuando algo se consolida", says: "«Esto ya está empezando a consolidarse.»" },
  { mood: "error", when: "Si algo falla técnicamente", says: "Te lo dice con calma y muestra el identificador del error." },
];

const GALLERY: AfiMood[] = ["happy", "curious", "studying", "listening", "writing", "celebrating", "supportive", "sleepy"];
const NAMES: Record<string, string> = { happy: "Feliz", curious: "Curiosa", studying: "Estudiando", listening: "Escuchando", writing: "Escribiendo", celebrating: "¡Lo lograste!", supportive: "Siempre contigo", sleepy: "Descansando" };

export default function AfiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ name: "Inicio", path: "/" }, { name: "Afi", path: "/afi" }]} />
      <header className="mt-6 grid items-center gap-8 sm:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Conoce a Afi</h1>
          <p className="mt-3 text-lg text-muted">{BRAND.mascotLine} Es una nube pequeña con audífonos y una estrella dorada en cada lado: escucha cómo aprendes y te acompaña.</p>
          <p className="mt-3 text-muted">El motor adaptativo es la parte racional: mide, calcula y decide. Afi es la parte humana: te cuenta lo que el sistema ha visto de ti en una frase corta y tranquila.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <LiveAfi mood="waving" size={180} className="mx-auto mt-16 sm:mt-10" />
          <p className="text-sm text-muted">Tócala: tiene cosquillas en los audífonos.</p>
        </div>
      </header>

      <section aria-labelledby="story" className="card mt-14 p-6 sm:p-8">
        <h2 id="story" className="font-display text-2xl font-extrabold">Quién es Afi</h2>
        <div className="mt-4 grid gap-5 leading-relaxed text-muted sm:grid-cols-3">
          <p><strong className="text-text">Una nube que escucha.</strong> Afi flota por encima de todos los idiomas y cada uno le llueve un poco en los audífonos. Por eso nunca se los quita.</p>
          <p><strong className="text-text">Estrellas que se encienden.</strong> Las dos estrellas doradas brillan un poco más cada vez que aprendes algo. Cuando una sesión sale muy bien, se nota.</p>
          <p><strong className="text-text">Sus manías.</strong> Colecciona palabras que suenan bonito («mariposa», «Schmetterling»), parpadea a su ritmo, te sigue con la mirada y, si la dejas sola un rato, se queda dormida.</p>
        </div>
      </section>

      <section aria-labelledby="does" className="mt-14">
        <h2 id="does" className="font-display text-2xl font-extrabold">Qué hace Afi en la aplicación</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {MOMENTS.map((m) => (
            <li key={m.when} className="card p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{m.when}</p>
              <AfiMessage mood={m.mood} size={52} className="mt-3">{m.says}</AfiMessage>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="mt-14 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 id="how" className="font-display text-2xl font-extrabold">Cómo habla</h2>
          <p className="mt-3 leading-relaxed text-muted">Cálida, tranquila y breve. Nunca te castiga ni exagera: prefiere «Hoy podemos reforzar esto un poco más» a los gritos de ánimo. Todo lo que dice sale de datos que tú también puedes ver en tu perfil.</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold">Accesible</h2>
          <p className="mt-3 leading-relaxed text-muted">Afi nunca es necesaria para entender nada: lo que dice está siempre en texto, los lectores de pantalla la anuncian como «Afi» y, si prefieres menos movimiento, se queda quieta.</p>
        </div>
      </section>

      <section aria-labelledby="faces" className="mt-14">
        <h2 id="faces" className="font-display text-2xl font-extrabold">Sus expresiones</h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {GALLERY.map((m) => (
            <li key={m} className="card afi-host flex flex-col items-center gap-2 p-4">
              <Afi mood={m} size={92} />
              <span className="text-sm font-semibold">{NAMES[m]}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="card mt-14 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <p className="flex-1 text-lg">¿Empezamos? Afi te acompaña desde el primer minuto. Si quieres saber cómo decide el sistema, lee <Link href="/guias/aprendizaje-adaptativo" className="font-semibold text-primary underline underline-offset-4">qué es el aprendizaje adaptativo</Link>.</p>
        <ButtonLink href="/login?mode=signup" size="lg">Empezar gratis</ButtonLink>
      </div>
    </div>
  );
}
