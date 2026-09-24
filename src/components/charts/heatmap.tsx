import { addDays } from "@/lib/engine/progress";

/** Calendario de actividad tipo GitHub (SVG accesible, sin librerías). */
export function Heatmap({ days, today, weeks = 20, metric = "minutes" }: { days: { day: string; seconds: number; exercises: number }[]; today: string; weeks?: number; metric?: "minutes" | "exercises" }) {
  const byDay = new Map(days.map((d) => [d.day, metric === "minutes" ? Math.round(d.seconds / 60) : d.exercises]));
  const dow = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7; // lunes = 0
  const start = addDays(today, -(weeks - 1) * 7 - dow);
  const values = [...byDay.values()];
  const max = Math.max(1, ...values);
  const cell = 14;
  const gap = 3;
  const cells: { x: number; y: number; day: string; v: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const day = addDays(start, w * 7 + d);
      if (day > today) continue;
      cells.push({ x: w * (cell + gap), y: d * (cell + gap), day, v: byDay.get(day) ?? 0 });
    }
  }
  const level = (v: number) => (v <= 0 ? 0 : v / max < 0.25 ? 0.25 : v / max < 0.5 ? 0.5 : v / max < 0.8 ? 0.75 : 1);
  const unit = metric === "minutes" ? "min" : "ejercicios";
  const width = weeks * (cell + gap);
  const height = 7 * (cell + gap);
  return (
    <figure>
      <div className="overflow-x-auto">
        <svg width={width} height={height} role="img" aria-label={`Actividad de las últimas ${weeks} semanas`} className="block">
          {cells.map((c) => (
            <rect key={c.day} x={c.x} y={c.y} width={cell} height={cell} rx={4} fill={c.v > 0 ? "var(--primary)" : "var(--surface-muted)"} fillOpacity={c.v > 0 ? level(c.v) : 1}>
              <title>{`${c.day}: ${c.v} ${unit}`}</title>
            </rect>
          ))}
        </svg>
      </div>
      <figcaption className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
        Menos
        {[0, 0.25, 0.5, 0.75, 1].map((o) => (
          <span key={o} className="inline-block size-3 rounded-[3px]" style={{ background: o ? "var(--primary)" : "var(--surface-muted)", opacity: o || 1 }} />
        ))}
        Más
      </figcaption>
    </figure>
  );
}
