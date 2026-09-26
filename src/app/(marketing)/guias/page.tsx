import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Afi } from "@/components/afi/afi";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { GUIDES } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Guías para aprender idiomas",
  description: "Respuestas claras sobre aprendizaje adaptativo, niveles MCER, repetición espaciada, errores recurrentes, lectura a tu nivel y el uso de la IA al aprender idiomas.",
  alternates: { canonical: "/guias" },
  openGraph: { title: "Guías para aprender idiomas · Improve My Languages", url: "/guias" },
};

/** Base de conocimiento: preguntas reales sobre cómo se aprende un idioma y cómo lo aborda el producto. */
export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ name: "Inicio", path: "/" }, { name: "Guías", path: "/guias" }]} />
      <header className="mt-6 flex items-start gap-4">
        <div className="flex-1">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Guías para aprender idiomas</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">Preguntas que se hace cualquiera que aprende un idioma, con una respuesta corta y cómo lo resolvemos en Improve My Languages.</p>
        </div>
        <Afi mood="reading" size={96} className="hidden sm:block" />
      </header>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guias/${g.slug}`} className="card lift afi-host flex h-full flex-col gap-2 p-6 hover:border-primary">
              <h2 className="font-display text-lg font-extrabold leading-snug">{g.h1}</h2>
              <p className="text-sm text-muted">{g.description}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-primary">Leer la guía <ArrowRight size={15} aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
