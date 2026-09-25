import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("card p-5 sm:p-6", className)} {...props} />;
}

export function CardHeader({ title, aside, icon }: { title: ReactNode; aside?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-0.5">
      {icon}
      <h2 className="font-display text-lg font-extrabold tracking-tight">{title}</h2>
      {aside ? <div className="w-full text-xs text-muted sm:ml-auto sm:w-auto sm:text-right">{aside}</div> : null}
    </div>
  );
}
