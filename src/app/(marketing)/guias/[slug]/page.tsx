import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AfiMessage } from "@/components/afi/afi-message";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { RichText } from "@/components/seo/rich-text";
import { ButtonLink } from "@/components/ui/button";
import { guideBySlug, GUIDES } from "@/lib/content/guides";
import { abs, BRAND, graph } from "@/lib/seo";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: { type: "article", title: `${g.title} · ${BRAND.name}`, description: g.description, url: `/guias/${g.slug}`, modifiedTime: g.updated },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const related = g.related.map(guideBySlug).filter((x) => x !== null);
  const article = {
    "@type": "Article",
    headline: g.h1,
    description: g.description,
    inLanguage: "es",
    dateModified: g.updated,
    datePublished: g.updated,
    mainEntityOfPage: abs(`/guias/${g.slug}`),
    author: { "@id": `${abs("/")}#organization` },
    publisher: { "@id": `${abs("/")}#organization` },
    about: g.question,
    ...(g.sources.some((s) => s.url) ? { citation: g.sources.filter((s) => s.url).map((s) => s.url) } : {}),
  };
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={graph(article)} />
      <Breadcrumbs items={[{ name: "Inicio", path: "/" }, { name: "Guías", path: "/guias" }, { name: g.title, path: `/guias/${g.slug}` }]} />
      <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{g.h1}</h1>
      <p className="mt-2 text-sm text-muted">Actualizado el <time dateTime={g.updated}>{new Date(g.updated).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}</time></p>

      <section aria-labelledby="short" className="card mt-8 bg-primary-soft/50 p-6">
        <h2 id="short" className="font-display text-lg font-extrabold">Respuesta corta</h2>
        <p className="mt-2 leading-relaxed">{g.answer}</p>
      </section>

      <div className="mt-10 space-y-10">
        {g.sections.map((s) => (
          <section key={s.h2}>
            <h2 className="font-display text-2xl font-extrabold">{s.h2}</h2>
            {s.body.map((p, i) => <p key={i} className="mt-3 leading-relaxed text-muted"><RichText text={p} /></p>)}
            {s.list && (
              <ul className="mt-4 space-y-2">
                {s.list.map((li, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed text-muted"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden /><span><RichText text={li} /></span></li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="card mt-12 p-6">
        <AfiMessage mood="encouraging" size={64}>{g.cta.text}.</AfiMessage>
        <ButtonLink href={g.cta.href} size="lg" className="mt-4">Empezar gratis <ArrowRight size={18} aria-hidden /></ButtonLink>
      </div>

      {g.sources.length > 0 && (
        <section aria-labelledby="sources" className="mt-12">
          <h2 id="sources" className="font-display text-xl font-extrabold">Fuentes</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {g.sources.map((s) => (
              <li key={s.title}>{s.url ? <a href={s.url} className="underline underline-offset-4 hover:text-text" rel="noopener noreferrer" target="_blank">{s.title}</a> : s.title}</li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <nav aria-labelledby="related" className="mt-12">
          <h2 id="related" className="font-display text-xl font-extrabold">Sigue leyendo</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}><Link href={`/guias/${r.slug}`} className="card lift block h-full p-4 text-sm font-semibold hover:border-primary">{r.title}</Link></li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
