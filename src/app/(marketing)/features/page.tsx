import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "El motor adaptativo de Improve My Languages: diagnóstico CAT, vector de habilidades, FSRS, inteligencia de errores y recomendaciones explicadas.",
};

const SECTIONS = [
  ["1. Diagnóstico que no asume tu nivel", "Empezamos con preguntas de dificultad media. Si aciertas, sube; si fallas, baja. Con 8–18 preguntas estimamos tu nivel con un margen de error conocido, separado por vocabulario, gramática y lectura."],
  ["2. Tu nivel es un vector, no una letra", "Puedes ser B2 leyendo y A2 hablando. Cada habilidad tiene su propia estimación, que se actualiza con cada ejercicio y se vuelve más estable con el tiempo."],
  ["3. Repetición espaciada (FSRS)", "Cada palabra y cada tema de gramática tienen una 'memoria' calculada: cuánto aguanta y cuándo está a punto de olvidarse. Te lo mostramos justo en ese momento."],
  ["4. Errores clasificados", "“She go to school yesterday” no es sólo un fallo: es pasado simple. “I have 20 years” es traducción literal del español. Así detectamos patrones y los atacamos."],
  ["5. Sesiones que se arman solas", "Dinos cuántos minutos tienes. El planificador reparte el tiempo entre repaso, tus debilidades, vocabulario nuevo de tus intereses y listening, y explica cada decisión."],
  ["6. IA sólo donde aporta", "La IA conversa contigo y analiza lo que escribes. Todo lo demás es lógica determinista: más barata, más rápida y sin inventar reglas ni definiciones."],
];

export default function Features() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold">Cómo funciona</h1>
      <p className="mt-3 text-lg text-muted">La plataforma no se pregunta sólo “¿qué quiere estudiar?”, sino “¿qué necesita aprender esta persona ahora mismo para mejorar?”.</p>
      <div className="mt-10 space-y-5">
        {SECTIONS.map(([t, d]) => (
          <section key={t} className="card p-6">
            <h2 className="font-display text-xl font-extrabold">{t}</h2>
            <p className="mt-2 leading-relaxed text-muted">{d}</p>
          </section>
        ))}
      </div>
      <ButtonLink href="/login?mode=signup" size="lg" className="mt-10">Probarlo gratis</ButtonLink>
    </div>
  );
}
