import { Afi } from "@/components/afi/afi";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { AfiBondView } from "@/lib/services/afi-bond";

/** «Lo que Afi ha aprendido de ti» y «La colección de Afi» (página de progreso). */
export function AfiBondCard({ bond }: { bond: AfiBondView }) {
  const wear = bond.milestones.filter((m) => m.earned).map((m) => m.wear);
  return (
    <section className="card grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_20rem]" aria-labelledby="afi-knows">
      <div>
        <div className="flex items-center gap-3">
          <Afi size={64} mood={bond.observations.length ? "thinking" : "curious"} wear={wear} />
          <div>
            <h2 id="afi-knows" className="font-display text-xl font-extrabold">Lo que Afi ha aprendido de ti</h2>
            <p className="text-sm text-muted">De tus últimas {bond.answers} respuestas (8 semanas). Sólo tus datos, nada inventado.</p>
          </div>
        </div>
        {bond.observations.length ? (
          <ul className="mt-4 space-y-3">
            {bond.observations.map((o) => (
              <li key={o.id} className="flex gap-3 rounded-2xl bg-surface-muted p-3">
                <span className="text-xl" aria-hidden>{o.icon}</span>
                <span>
                  <span className="block font-semibold">{o.text}</span>
                  {o.tip ? <span className="block text-sm text-muted">{o.tip}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl bg-surface-muted p-4 text-sm text-muted">
            {bond.needed > 0
              ? `Afi todavía te está conociendo: con ${bond.needed} respuestas más podrá contarte a qué hora aciertas más, qué tipo de ejercicio te cuesta y si tus fallos son casi aciertos.`
              : "Por ahora no hay un patrón claro: aprendes de forma pareja. Afi seguirá atenta."}
          </p>
        )}
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">La colección de Afi</h3>
        <p className="mt-1 text-sm text-muted">Afi estrena algo cuando consigues algo de verdad.</p>
        <ul className="mt-3 space-y-3">
          {bond.milestones.map((m) => (
            <li key={m.wear} className="flex items-center gap-3">
              <span className={m.earned ? "" : "opacity-40 grayscale"} aria-hidden>
                <Afi size={40} mood="happy" wear={[m.wear]} still />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {m.title} {m.earned ? <span className="text-success-ink">· conseguido</span> : <span className="sr-only">· por conseguir</span>}
                </span>
                <span className="block text-xs text-muted">{m.how} · {m.count}</span>
                {!m.earned && <ProgressBar value={m.progress} className="mt-1" height={6} label={`Progreso: ${m.title}`} />}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
