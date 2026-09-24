import type { Metadata } from "next";
import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { LANGUAGES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Idiomas",
  description: "Idiomas disponibles en Improve My Languages: inglés, francés, japonés y más en camino.",
};

const STATUS = { available: ["Disponible", "success"], beta: ["Beta", "primary"], planned: ["Próximamente", "muted"] } as const;

export default function LanguagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold">Idiomas</h1>
      <p className="mt-3 max-w-2xl text-muted">La plataforma es agnóstica al idioma: el mismo motor adaptativo funciona con cualquier sistema de escritura. Estos son los idiomas con contenido y los que vienen.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANGUAGES.map((l) => {
          const [label, tone] = STATUS[l.status];
          return (
            <li key={l.code}>
              <Link href={`/languages/${l.code}`} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5">
                <span className="text-3xl" aria-hidden>{l.flagEmoji}</span>
                <span className="flex-1">
                  <span className="block font-display text-lg font-extrabold">{l.name}</span>
                  <span className="block text-sm text-muted" lang={l.code}>{l.nativeName}</span>
                </span>
                <Chip tone={tone}>{label}</Chip>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
