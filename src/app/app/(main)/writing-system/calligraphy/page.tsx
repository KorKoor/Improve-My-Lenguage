import type { Metadata } from "next";
import Link from "next/link";
import { StrokesTrainer } from "@/components/phase-zero/strokes-trainer";
import { ButtonLink } from "@/components/ui/button";
import { alphabetFor, arabicForms } from "@/lib/content/alphabets";
import { calligraphyGroups, KO_BLOCKS, RU_CURSIVE, strokeSet, type CalligraphyGroup } from "@/lib/content/calligraphy";
import { strokesFor } from "@/lib/content/strokes";
import { requireLearner } from "@/lib/services/viewer";

export const metadata: Metadata = { title: "Caligrafía" };

const PAGE = 10;
const HREF = "/app/writing-system/calligraphy";

/**
 * Caligrafía: orden de trazos real (KanjiVG, Make Me a Hanzi) con animación y
 * práctica de calcar; formas del árabe, bloques del coreano y la letra
 * rusa escrita a mano.
 */
export default async function CalligraphyPage({ searchParams }: { searchParams: Promise<{ set?: string; page?: string }> }) {
  const learner = await requireLearner();
  const lang = learner.language;
  const sp = await searchParams;
  const groups: CalligraphyGroup[] = calligraphyGroups(lang.code);
  const basic = strokesFor(lang.code);
  if (basic.length && !groups.length) groups.push({ id: "basic", title: "Trazos básicos", chars: basic });

  const group = groups.find((g) => g.id === sp.set);
  if (group) {
    const page = Math.max(0, Math.min(Math.floor(Number(sp.page) || 0), Math.ceil(group.chars.length / PAGE) - 1));
    const chars = group.chars.slice(page * PAGE, page * PAGE + PAGE);
    const more = (page + 1) * PAGE < group.chars.length;
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-sm"><Link href={HREF} className="text-primary underline-offset-4 hover:underline">← Caligrafía</Link> · {group.title} · {page * PAGE + 1}–{page * PAGE + chars.length} de {group.chars.length}</p>
        <StrokesTrainer key={`${group.id}-${page}`} chars={chars} locale={lang.speechLocale} language={lang.code} rtl={lang.rtl} practice nextHref={more ? `${HREF}?set=${group.id}&page=${page + 1}` : HREF} />
      </div>
    );
  }

  const set = strokeSet(lang.code);
  const ar = lang.code === "ar" ? alphabetFor("ar")!.groups.flatMap((g) => g.letters).filter((l) => [...l.g].length === 1) : [];
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm"><Link href="/app/writing-system" className="text-primary underline-offset-4 hover:underline">← Escritura y ortografía</Link></p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Caligrafía</h1>
        <p className="mt-1 text-muted">
          {groups.length ? "Mira el orden y la dirección de cada trazo y cálcalo con el dedo. Es práctica libre: no cuenta para la nota." : `En ${lang.name.toLowerCase()} lo importante es reconocer la letra escrita a mano.`}
        </p>
        {learner.profile.audioFirst && groups.length > 0 && (
          <p className="mt-2 card p-4 text-sm">La animación y el calcado dependen de la vista, pero cada signo trae la descripción de sus trazos en palabras y se puede escuchar.</p>
        )}
      </header>

      {groups.length > 0 && (
        <section aria-labelledby="sets-title" className="space-y-4">
          <h2 id="sets-title" className="font-display text-xl font-extrabold">Elige qué practicar</h2>
          {groups.map((g) => (
            <div key={g.id} className="card p-5">
              <h3 className="font-display text-lg font-extrabold">{g.title} <span className="text-sm font-normal text-muted">· {g.chars.length}</span></h3>
              <ul className="mt-3 flex flex-wrap gap-2" lang={lang.code} dir={lang.rtl ? "rtl" : "ltr"}>
                {Array.from({ length: Math.ceil(g.chars.length / PAGE) }, (_, p) => (
                  <li key={p}>
                    <Link href={`${HREF}?set=${g.id}&page=${p}`} className="card lift inline-block px-3 py-2 text-xl font-bold tracking-wider" aria-label={`Practicar ${g.chars.slice(p * PAGE, p * PAGE + PAGE).map((c) => c.ch).join(" ")}`}>
                      {g.chars.slice(p * PAGE, p * PAGE + 5).map((c) => c.ch).join("")}…
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {set && (
            <p className="text-xs text-muted">
              Orden de trazos: <a href={set.url} className="underline" rel="noopener noreferrer" target="_blank">{set.source}</a> ({set.author}), licencia{" "}
              <a href={set.licenseUrl} className="underline" rel="noopener noreferrer" target="_blank">{set.license}</a>. Las descripciones en palabras se generan a partir de la forma.
            </p>
          )}
        </section>
      )}

      {lang.code === "ar" && (
        <section aria-labelledby="forms-title" className="card p-5">
          <h2 id="forms-title" className="font-display text-xl font-extrabold">Las cuatro formas de cada letra</h2>
          <p className="text-sm text-muted">Casi todas las letras cambian según su lugar en la palabra. Las que no se unen a la siguiente sólo tienen dos formas.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-center">
              <thead className="text-sm text-muted">
                <tr><th className="py-2 text-start font-semibold">Letra</th><th className="font-semibold">Sola</th><th className="font-semibold">Inicio</th><th className="font-semibold">Medio</th><th className="font-semibold">Final</th></tr>
              </thead>
              <tbody>
                {ar.map((l) => (
                  <tr key={l.g} className="border-t border-border">
                    <th scope="row" className="py-2 text-start text-sm font-semibold">{l.r}</th>
                    {arabicForms(l.g).map((f, i) => <td key={i} className="font-display text-2xl" lang="ar" dir="rtl">{f}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {lang.code === "ko" && (
        <section aria-labelledby="blocks-title" className="card p-5">
          <h2 id="blocks-title" className="font-display text-xl font-extrabold">Cómo se arma un bloque</h2>
          <p className="text-sm text-muted">Cada sílaba es un cuadrado: consonante, vocal y, a veces, consonante final. Se escribe de arriba abajo y de izquierda a derecha.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {KO_BLOCKS.map((b) => (
              <li key={b.block} className="flex items-center gap-4 rounded-xl bg-surface-muted p-3">
                <span className="font-display text-4xl font-extrabold" lang="ko">{b.block}</span>
                <span className="text-sm"><strong lang="ko">{b.parts}</strong><br />{b.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lang.code === "ru" && (
        <section aria-labelledby="cursive-title" className="card p-5">
          <h2 id="cursive-title" className="font-display text-xl font-extrabold">La letra rusa escrita a mano</h2>
          <p className="text-sm text-muted">Los rusos escriben a mano en cursiva, y algunas letras se parecen a otras latinas. Aprende a reconocerlas (la cursiva de abajo es una aproximación tipográfica).</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {RU_CURSIVE.map((c) => (
              <li key={c.g} className="flex items-center gap-4 rounded-xl bg-surface-muted p-3">
                <span className="w-24 shrink-0 text-center" lang="ru">
                  <span className="font-display text-3xl font-extrabold">{c.g}</span>{" "}
                  <span className="text-3xl italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} aria-hidden>{c.g}</span>
                </span>
                <span className="text-sm"><strong>Parece «{c.looks}».</strong> {c.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!groups.length && lang.code !== "ru" && (
        <div className="card p-5">
          <p>Se escribe con letras latinas que ya conoces. Repasa los signos especiales y cómo teclearlos en Escritura y ortografía.</p>
          <ButtonLink href="/app/writing-system" className="mt-3" variant="secondary">Volver</ButtonLink>
        </div>
      )}
    </div>
  );
}
