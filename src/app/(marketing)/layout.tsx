import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { BRAND, graph, organizationLd, websiteLd } from "@/lib/seo";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Logo />
          <nav aria-label="Principal" className="ml-auto hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <Link href="/features" className="hover:text-text">Cómo funciona</Link>
            <Link href="/languages" className="hover:text-text">Idiomas</Link>
            <Link href="/guias" className="hover:text-text">Guías</Link>
            <Link href="/afi" className="hover:text-text">Afi</Link>
            <Link href="/about" className="hover:text-text">Acerca de</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ButtonLink href="/login" variant="ghost" size="sm" className="hidden whitespace-nowrap sm:inline-flex">Iniciar sesión</ButtonLink>
            <ButtonLink href="/login" variant="ghost" size="sm" className="whitespace-nowrap sm:hidden">Entrar</ButtonLink>
            <ButtonLink href="/login?mode=signup" size="sm" className="whitespace-nowrap">Empezar gratis</ButtonLink>
          </div>
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="border-t border-border/60">
        <JsonLd data={graph(organizationLd(), websiteLd())} />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm text-muted sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-6">
          <div>
            <Logo compact />
            <p className="mt-3 font-semibold text-text">{BRAND.tagline}</p>
            <p className="mt-1 max-w-xs">Aprendizaje adaptativo de idiomas. {BRAND.mascotLine}</p>
          </div>
          <nav aria-label="Producto" className="flex flex-col gap-2">
            <p className="font-semibold text-text">Producto</p>
            <Link href="/features" className="hover:text-text">Cómo funciona</Link>
            <Link href="/languages" className="hover:text-text">Idiomas</Link>
            <Link href="/afi" className="hover:text-text">Afi</Link>
          </nav>
          <nav aria-label="Guías" className="flex flex-col gap-2">
            <p className="font-semibold text-text">Guías</p>
            <Link href="/guias/aprendizaje-adaptativo" className="hover:text-text">Aprendizaje adaptativo</Link>
            <Link href="/guias/nivel-mcer" className="hover:text-text">Niveles MCER</Link>
            <Link href="/guias/repeticion-espaciada" className="hover:text-text">Repetición espaciada</Link>
            <Link href="/guias" className="hover:text-text">Todas las guías</Link>
          </nav>
          <nav aria-label="Información" className="flex flex-col gap-2">
            <p className="font-semibold text-text">Información</p>
            <Link href="/about" className="hover:text-text">Acerca de</Link>
            <Link href="/about#creador" className="hover:text-text">Quién está detrás</Link>
            <Link href="/privacy" className="hover:text-text">Privacidad</Link>
            <Link href="/creditos" className="hover:text-text">Créditos y licencias</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
