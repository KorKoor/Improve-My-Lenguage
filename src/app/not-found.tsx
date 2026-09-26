import { ButtonLink } from "@/components/ui/button";
import { Afi } from "@/components/afi/afi";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <Afi size={120} mood="confused" />
        <h1 className="font-display text-3xl font-extrabold">Esta página no existe</h1>
        <p className="text-muted">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
        <ButtonLink href="/">Volver al inicio</ButtonLink>
      </div>
    </main>
  );
}
