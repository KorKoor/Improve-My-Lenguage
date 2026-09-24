import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative overflow-hidden rounded-xl bg-surface-muted", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5" />
    </div>
  );
}
