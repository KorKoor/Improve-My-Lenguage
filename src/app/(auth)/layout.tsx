import { Logo } from "@/components/logo";
import { LiveAfi } from "@/components/afi/live-afi";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <aside className="hidden flex-col items-center justify-center gap-6 bg-primary-soft p-12 text-center lg:flex">
        <LiveAfi size={180} mood="waving" />
        <p className="max-w-sm font-display text-3xl font-extrabold">No se trata de ser perfecto, sino de ser mejor que ayer.</p>
        <p className="max-w-sm text-muted">Cada sesión hace que el sistema te conozca un poco mejor.</p>
      </aside>
    </main>
  );
}
