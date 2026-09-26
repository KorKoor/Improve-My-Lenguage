"use client";

import { useState, useTransition } from "react";
import { checkAiAction, type AiCheck as Result } from "@/app/app/ai-check-actions";
import { Button } from "@/components/ui/button";

/** Botón «Probar la IA»: dice si responde, con qué modelo y cuánto tarda. */
export function AiCheck({ configured }: { configured: boolean }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  return (
    <section className="card space-y-3 p-5" aria-labelledby="ai-check">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="ai-check" className="flex-1 font-display text-lg font-extrabold">Inteligencia artificial</h2>
        <span className={configured ? "rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success-ink" : "rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-warning-ink"}>
          {configured ? "Clave configurada" : "Sin clave"}
        </span>
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => start(async () => setResult(await checkAiAction()))}>
          {pending ? "Probando…" : "Probar la IA"}
        </Button>
      </div>
      <div aria-live="polite" className="text-sm">
        {result?.ok ? (
          <p>
            <span className="font-semibold text-success-ink">Funciona.</span> Modelo <code>{result.model ?? "—"}</code> · {result.ms} ms · «{result.reply}»
          </p>
        ) : result ? (
          <p><span className="font-semibold text-danger-ink">No responde.</span> {result.error}</p>
        ) : (
          <p className="text-muted">Hace una llamada mínima al proveedor ({configured ? "Gemini u OpenAI compatible" : "sin configurar"}) para comprobar la clave y el modelo.</p>
        )}
      </div>
    </section>
  );
}
