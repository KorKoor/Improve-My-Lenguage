import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Logo />
          <nav aria-label="Principal" className="ml-auto hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <Link href="/features" className="hover:text-text">Cómo funciona</Link>
            <Link href="/languages" className="hover:text-text">Idiomas</Link>
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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:px-6">
          <Logo compact />
          <p>Learn smarter. Become better.</p>
          <nav aria-label="Legal" className="flex gap-5 sm:ml-auto">
            <Link href="/privacy" className="hover:text-text">Privacidad</Link>
            <Link href="/languages" className="hover:text-text">Idiomas</Link>
            <Link href="/about" className="hover:text-text">Acerca de</Link>
            <Link href="/creditos" className="hover:text-text">Créditos</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
