import { ArrowRight, Check, Keyboard, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlphabetNames, SignCard, SpellYourName } from "@/components/writing-system/alphabet-tools";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { writingFor } from "@/lib/content/writing-system";
import { STROKE_LANGS } from "@/lib/engine/phase-zero";
import { writingHref, writingState } from "@/lib/services/orthography";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Escritura y ortografía" };

const KIND_LABEL: Record<string, string> = { alphabet: "Abecedario", signs: "Signos", punctuation: "Puntuación", capitals: "Mayúsculas y números", spelling: "Ortografía" };

/**
 * «Escritura y ortografía» para todo alumno A1–A2: el abecedario (con el
 * nombre de cada letra y un deletreador), los signos especiales, cómo
 * escribirlos y unidades cortas; la recomendada sale de tus propios errores.
 */
export default async function WritingSystemPage() {
  const learner = await requireLearner();
  const lang = learner.language;
  const w = writingFor(lang.code);
  if (!w) return <p className="card p-6">Todavía no hay contenido de escritura para {lang.name.toLowerCase()}.</p>;
  const st = await writingState(learner);
  const pick = st.pick;

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="font-display text-3xl font-extrabold">Escritura y ortografía</h1>
        <p className="mt-1 max-w-2xl text-muted">Cómo se escribe el {lang.name.toLowerCase()}: su abecedario, sus signos especiales, la puntuación y las reglas de ortografía que más fallan los hispanohablantes. Unidades de cinco minutos.</p>
      </header>

      {pick && (
        <section className="card flex flex-col gap-4 border-2 border-primary bg-primary-soft/40 p-5 sm:flex-row sm:items-center" aria-labelledby="pick-title">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-3xl shadow-sm" aria-hidden>✍️</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Te recomendamos</p>
            <h2 id="pick-title" className="font-display text-xl font-extrabold">{pick.unit.title}</h2>
            <p className="text-sm text-muted">{pick.reason}</p>
          </div>
          <ButtonLink href={writingHref(pick.unit.id)} size="lg">Empezar <ArrowRight size={18} aria-hidden /></ButtonLink>
        </section>
      )}

      <section aria-labelledby="units-title">
        <h2 id="units-title" className="font-display text-2xl font-extrabold">Unidades</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {st.units.map((u) => {
            const ok = st.done.has(u.id);
            return (
              <li key={u.id}>
                <Link href={writingHref(u.id)} className={cn("card lift flex items-center gap-3 p-3 hover:border-primary", pick?.unit.id === u.id && "border-2 border-primary")}>
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-xs font-extrabold", ok ? "bg-success-ink text-on-status" : "bg-surface-muted text-muted")}>{ok ? <Check size={18} aria-label="Hecha" /> : u.level}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{u.title}</span>
                    <span className="block text-xs text-muted">{KIND_LABEL[u.kind] ?? u.kind} · {u.level}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {w.alphabet && (
        <section aria-labelledby="abc-title" className="space-y-3">
          <h2 id="abc-title" className="font-display text-2xl font-extrabold">{w.spelling ? "El abecedario" : "El orden de la escritura"}</h2>
          <p className="max-w-2xl text-muted">{w.alphabetNote}</p>
          <AlphabetNames alphabet={w.alphabet} locale={lang.speechLocale} lang={lang.code} rtl={lang.rtl} />
          {w.spelling && <SpellYourName alphabet={w.alphabet} locale={lang.speechLocale} lang={lang.code} />}
        </section>
      )}

      <section aria-labelledby="signs-title">
        <h2 id="signs-title" className="font-display text-2xl font-extrabold">Signos especiales</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {w.signs.map((s) => <SignCard key={s.g} sign={s} locale={lang.speechLocale} lang={lang.code} rtl={lang.rtl} />)}
        </ul>
      </section>

      <section aria-labelledby="typing-title" className="card p-5">
        <h2 id="typing-title" className="font-display text-xl font-extrabold">Cómo escribirlo en tu móvil y tu ordenador</h2>
        <p className="mt-3 flex gap-3 text-sm"><Smartphone size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden /> <span><strong>Móvil:</strong> {w.typing.phone}</span></p>
        <p className="mt-3 flex gap-3 text-sm"><Keyboard size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden /> <span><strong>Ordenador:</strong> {w.typing.computer}</span></p>
        <p className="mt-3 text-sm text-muted">Y en los ejercicios de la app tienes siempre un teclado en pantalla con las letras que te faltan.</p>
      </section>

      {(STROKE_LANGS.has(lang.code) || lang.code === "ru") && (
        <section aria-labelledby="cal-title" className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 id="cal-title" className="font-display text-xl font-extrabold">Caligrafía</h2>
            <p className="text-sm text-muted">{lang.code === "ru" ? "La letra rusa escrita a mano cambia mucho: aprende a reconocerla." : "El orden y la dirección de los trazos, con animación y práctica de calcar."}</p>
          </div>
          <ButtonLink href="/app/writing-system/calligraphy" variant="secondary">Practicar trazos <ArrowRight size={16} aria-hidden /></ButtonLink>
        </section>
      )}
    </div>
  );
}
