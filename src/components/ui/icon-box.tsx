import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Icono sobre un fondo tenue del mismo color (14 % de opacidad). */
export function IconBox({ icon: Icon, color = "var(--primary)", size = 40, className }: { icon: LucideIcon; color?: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[30%]", className)}
      style={{ width: size, height: size, color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} />
    </span>
  );
}
