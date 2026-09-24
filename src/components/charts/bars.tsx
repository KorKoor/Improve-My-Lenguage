/** Gráfico de barras vertical simple y accesible (SVG). */
export function MiniBars({ data, height = 120, color = "var(--primary)", format = (v: number) => String(v), label }: { data: { label: string; value: number; hint?: string }[]; height?: number; color?: string; format?: (v: number) => string; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure aria-label={label}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-semibold text-muted">{d.value ? format(d.value) : ""}</span>
            <div className="w-full max-w-10 rounded-lg" style={{ height: `${Math.max(d.value ? 6 : 3, (d.value / max) * (height - 30))}px`, background: d.value ? color : "var(--surface-muted)" }} title={d.hint ?? `${d.label}: ${format(d.value)}`} />
            <span className="text-[11px] font-medium text-muted">{d.label}</span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>{data.map((d) => <tr key={d.label}><th>{d.label}</th><td>{format(d.value)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/** Línea simple para evolución temporal (p. ej. precisión semanal). */
export function LineChart({ points, height = 140, label, format = (v: number) => `${Math.round(v * 100)} %` }: { points: { x: string; y: number | null }[]; height?: number; label: string; format?: (v: number) => string }) {
  const w = 560;
  const valid = points.filter((p) => p.y !== null) as { x: string; y: number }[];
  if (valid.length < 2) return <p className="text-sm text-muted">Aún no hay suficientes semanas de datos para dibujar la tendencia.</p>;
  const step = w / Math.max(1, points.length - 1);
  const xy = points.map((p, i) => (p.y === null ? null : [i * step, height - 16 - p.y * (height - 32)] as const));
  const d = xy.filter(Boolean).map((p, i) => `${i ? "L" : "M"}${p![0].toFixed(1)},${p![1].toFixed(1)}`).join(" ");
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full" role="img" aria-label={label}>
        {[0, 0.5, 1].map((g) => (
          <line key={g} x1={0} x2={w} y1={height - 16 - g * (height - 32)} y2={height - 16 - g * (height - 32)} stroke="var(--border)" strokeDasharray="4 4" />
        ))}
        <path d={d} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {xy.map((p, i) => (p ? <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2.5}><title>{`${points[i]!.x}: ${format(points[i]!.y!)}`}</title></circle> : null))}
      </svg>
    </figure>
  );
}
