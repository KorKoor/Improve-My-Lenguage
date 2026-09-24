import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  color = "var(--primary)",
  className,
  label,
  height = 8,
}: {
  value: number; // 0..1
  color?: string;
  className?: string;
  label: string;
  height?: number;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("w-full overflow-hidden rounded-full bg-surface-muted", className)}
      style={{ height }}
    >
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%`, background: color }} />
    </div>
  );
}
