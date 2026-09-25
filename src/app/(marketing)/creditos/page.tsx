import type { Metadata } from "next";
import Link from "next/link";
import { LanguageMark } from "@/components/language-mark";
import { LANGUAGES } from "@/lib/content";
import { packMeta } from "@/lib/content/packs";

export const metadata: Metadata = {
  title: "Créditos y licencias",
  description: "Fuentes de datos abiertos que alimentan el vocabulario, los ejemplos y la pronunciación de Improve My Languages.",
};

const SOURCES = [
  {
    name: "Wiktionary",
    by: "Comunidad de Wikimedia (vía kaikki.org / wiktextract, de Tatu Ylonen)",
    url: "https://www.wiktionary.org",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.es",
    use: "Definiciones y traducciones al español, pronunciación (IPA), lecturas (kana, pinyin, transliteración), género gramatical y formas flexionadas.",
  },
  {
    name: "Tatoeba",
    by: "Colaboradores de tatoeba.org",
    url: "https://tatoeba.org",
    license: "CC BY 2.0 FR",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/fr/deed.es",
    use: "Frases de ejemplo reales escritas por personas, con su traducción humana al español.",
  },
  {
    name: "wordfreq",
    by: "Robyn Speer y colaboradores",
    url: "https://github.com/rspeer/wordfreq",
    license: "CC BY-SA 4.0 (datos)",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.es",
    use: "Frecuencia real de uso (subtítulos, Wikipedia, noticias, libros…). Decide el orden en que aprendes las palabras y su nivel A1–C1.",
  },
  {
    name: "Wikimedia Commons",
    by: "Hablantes que grabaron y compartieron su pronunciación",
    url: "https://commons.wikimedia.org",
    license: "Licencias libres indicadas en cada archivo",
    licenseUrl: "https://commons.wikimedia.org/wiki/Commons:Licensing/es",
    use: "Audio de pronunciación grabado por personas. Se reproduce directamente desde Wikimedia.",
  },
];

export default function CreditsPage() {
  const packs = LANGUAGES.map((l) => ({ l, meta: packMeta(l.code) })).filter((x) => x.meta);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Créditos y licencias</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        El vocabulario de cada idioma se construye con datos abiertos creados por miles de personas. Los combinamos, ordenamos por frecuencia real y
        filtramos: si una palabra no tiene una traducción al español fiable y al menos una frase de ejemplo real, no la enseñamos.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {SOURCES.map((s) => (
          <li key={s.name} className="card p-6">
            <h2 className="font-display text-xl font-extrabold"><a href={s.url} className="hover:text-primary" rel="noopener noreferrer" target="_blank">{s.name}</a></h2>
            <p className="text-sm text-muted">{s.by}</p>
            <p className="mt-3 text-sm leading-relaxed">{s.use}</p>
            <p className="mt-3 text-sm">
              Licencia: <a href={s.licenseUrl} className="font-semibold text-primary underline-offset-4 hover:underline" rel="noopener noreferrer" target="_blank">{s.license}</a>
            </p>
          </li>
        ))}
      </ul>

      {packs.length > 0 && (
        <section className="mt-12" aria-labelledby="packs">
          <h2 id="packs" className="font-display text-2xl font-extrabold">Vocabulario por idioma</h2>
          <p className="mt-2 text-sm text-muted">Palabras disponibles por nivel (ordenadas por frecuencia de uso real).</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-muted">
                <tr><th className="py-2 pr-4 font-semibold">Idioma</th>{["A1", "A2", "B1", "B2", "C1"].map((c) => <th key={c} className="px-2 py-2 text-right font-semibold">{c}</th>)}<th className="py-2 pl-4 text-right font-semibold">Total</th></tr>
              </thead>
              <tbody>
                {packs.map(({ l, meta }) => (
                  <tr key={l.code} className="border-t border-border">
                    <td className="py-2.5 pr-4"><span className="inline-flex items-center gap-2 font-medium"><LanguageMark code={l.code} size={22} /> {l.name}</span></td>
                    {(["A1", "A2", "B1", "B2", "C1"] as const).map((c) => <td key={c} className="px-2 text-right tabular-nums">{(meta!.levels[c] ?? 0).toLocaleString("es")}</td>)}
                    <td className="pl-4 text-right font-semibold tabular-nums">{meta!.count.toLocaleString("es")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-12 space-y-3 text-sm text-muted">
        <h2 className="font-display text-xl font-extrabold text-text">Compartir igual</h2>
        <p>
          Los paquetes de vocabulario derivados de Wiktionary y wordfreq se distribuyen bajo la misma licencia CC BY-SA 4.0. El código que los genera está en
          <code className="mx-1">scripts/content/build_packs.py</code>. Los errores de traducción se pueden corregir de forma revisada en
          <code className="mx-1">scripts/content/overrides/</code>.
        </p>
        <p>
          Privacidad: al reproducir una pronunciación grabada, tu navegador descarga el audio directamente de Wikimedia (ver su{" "}
          <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy/es" className="underline" rel="noopener noreferrer" target="_blank">política de privacidad</a>). Consulta también nuestro{" "}
          <Link href="/privacy" className="underline">aviso de privacidad</Link>.
        </p>
      </section>
    </div>
  );
}
