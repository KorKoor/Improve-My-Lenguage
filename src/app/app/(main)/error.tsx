"use client";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Afi } from "@/components/afi/afi";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error("[app] error", error.digest ?? "", error), [error]);
  return (
    <div className="card mx-auto mt-10 flex max-w-lg flex-col items-center gap-4 p-8 text-center">
      <Afi size={96} mood="error" />
      <h1 className="font-display text-2xl font-extrabold">Algo salió mal al cargar tu lección</h1>
      <p className="text-sm text-muted">Tu progreso está guardado. Si se repite, puede que la base de datos esté despertando (el plan gratuito se pausa tras días sin uso): espera un minuto.</p>
      <div className="flex gap-2"><Button onClick={reset}>Intentar de nuevo</Button><ButtonLink href="/app" variant="secondary">Inicio</ButtonLink></div>
      {error.digest ? <p className="text-xs text-muted">ID del error: <code className="select-all">{error.digest}</code></p> : null}
    </div>
  );
}
