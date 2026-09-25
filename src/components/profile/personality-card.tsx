import { ARCHETYPES, DIMENSION_LABELS, type Dimension, type PersonalityResult } from "@/lib/engine/personality";

const FAVORITE_LABEL: Record<string, string> = {
  read: "📖 Lecturas",
  listen: "🎧 Escucha",
  write: "🖋️ Escritura",
  tutor: "💬 Tutor",
  speak: "🎙️ Pronunciación",
  vocabulary: "📚 Vocabulario",
  grammar: "🧩 Gramática",
};

/** Resultado del cuestionario: rasgos, qué ajustamos y consejos. Sin JS de cliente. */
export function PersonalityCard({ result, compact = false }: { result: PersonalityResult; compact?: boolean }) {
  const a = ARCHETYPES[result.archetype];
  const b = result.secondary ? ARCHETYPES[result.secondary] : null;
  const t = result.tuning;
  const dims = Object.keys(DIMENSION_LABELS) as Dimension[];
  return (
    <div className="space-y-5">
      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <h3 className="font-display font-bold">Tus fortalezas</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {[...a.strengths, ...(b?.strengths.slice(0, 1) ?? [])].map((s) => <li key={s}>✓ {s}</li>)}
            </ul>
            {b && <p className="mt-3 text-sm text-muted">También tienes algo de <strong>{b.icon} {b.name}</strong>.</p>}
          </div>
          <div className="card p-5">
            <h3 className="font-display font-bold">Consejos para ti</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {[...a.tips, ...(b?.tips.slice(0, 1) ?? [])].map((s) => <li key={s}>→ {s}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-display font-bold">Tu perfil en 8 rasgos</h3>
        <ul className="mt-4 space-y-3">
          {dims.map((d, i) => {
            const v = result.dims[d];
            const L = DIMENSION_LABELS[d];
            const pct = ((v + 1) / 2) * 100;
            return (
              <li key={d} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs sm:text-sm">
                <span className={v < -0.15 ? "text-right font-semibold" : "text-right text-muted"}>{L.low}</span>
                <span className="relative block h-2.5 w-28 rounded-full bg-surface-muted sm:w-44" title={L.title}>
                  <span className="absolute top-1/2 left-1/2 h-4 w-px -translate-y-1/2 bg-border" aria-hidden />
                  <span
                    className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-primary shadow animate-fade"
                    style={{ left: `${pct}%`, animationDelay: `${i * 60}ms` }}
                  />
                  <span className="sr-only">{L.title}: {v > 0.15 ? L.high : v < -0.15 ? L.low : "equilibrado"}</span>
                </span>
                <span className={v > 0.15 ? "font-semibold" : "text-muted"}>{L.high}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card p-5">
        <h3 className="font-display font-bold">Así adaptamos tus ejercicios</h3>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <li>🎯 Dificultad: <strong>{{ easy: "suave", balanced: "equilibrada", challenging: "con reto" }[t.preferredDifficulty]}</strong></li>
          <li>📝 Explicaciones: <strong>{{ brief: "breves, con ejemplos", balanced: "equilibradas", detailed: "detalladas, con la regla" }[t.explanationDepth]}</strong></li>
          <li>🩹 Corrección: <strong>{t.correction === "thorough" ? "completa" : "sólo lo importante, con tacto"}</strong></li>
          <li>⏱️ Sesión ideal: <strong>~{t.suggestedMinutes} min</strong></li>
          <li className="sm:col-span-2">⭐ Te recomendaremos más: <strong>{t.favorites.map((f) => FAVORITE_LABEL[f]).join(" · ")}</strong></li>
        </ul>
        <p className="mt-3 text-xs text-muted">Son preferencias, no etiquetas: el plan sigue priorizando tus repasos y tus errores reales. Repite el test cuando quieras.</p>
      </div>
    </div>
  );
}
