"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/mascot";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[ui] error no controlado", error.digest ?? "", error);
  }, [error]);
  return (
    <main id="main" className="grid min-h-[70dvh] place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <Mascot size={110} mood="calm" />
        <h1 className="font-display text-2xl font-extrabold">Algo salió mal al cargar esta página</h1>
        <p className="text-muted">
          No perdiste tu progreso. Puedes intentarlo de nuevo; si el problema sigue, vuelve en unos minutos.
          {error.digest ? <span className="mt-2 block text-xs">Código: {error.digest}</span> : null}
        </p>
        <Button onClick={reset}>Intentar de nuevo</Button>
      </div>
    </main>
  );
}
