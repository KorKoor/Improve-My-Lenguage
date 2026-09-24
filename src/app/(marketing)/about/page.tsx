import type { Metadata } from "next";
import { Mascot } from "@/components/mascot";

export const metadata: Metadata = { title: "Acerca de", description: "Por qué existe Improve My Languages y qué principios lo guían." };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Mascot size={96} />
      <h1 className="mt-4 font-display text-4xl font-extrabold">Acerca de</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
        <p>Improve My Languages nació como un proyecto personal: un sistema para aprender idiomas de forma autodidacta con el rigor de una plataforma profesional.</p>
        <p>La regla de oro de cada función es una sola pregunta: <strong className="text-text">¿esto ayuda realmente a aprender?</strong> Si la respuesta es no, no entra.</p>
        <p>Por eso no hay rachas que castigan, ni gemas, ni ligas. Hay un modelo de lo que sabes, de lo que estás olvidando y de los errores que repites, y sesiones construidas a partir de ese modelo.</p>
      </div>
    </div>
  );
}
