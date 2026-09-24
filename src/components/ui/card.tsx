import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("card p-5 sm:p-6", className)} {...props} />;
}

export function CardHeader({ title, aside, icon }: { title: ReactNode; aside?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon}
      <h2 className="font-display text-lg font-extrabold tracking-tight">{title}</h2>
      {aside ? <div className="ml-auto text-xs text-muted">{aside}</div> : null}
    </div>
  );
}
