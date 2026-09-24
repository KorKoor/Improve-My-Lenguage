import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "primary" | "muted" | "success" | "warning" | "danger" | "solid";
const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  muted: "bg-surface-muted text-muted",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  solid: "bg-primary text-on-primary",
};

export function Chip({ children, tone = "primary", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
