import type { ReactNode } from "react";
import { Mascot } from "../mascot";

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <Mascot size={88} mood="calm" />
      <h3 className="font-display text-lg font-extrabold">{title}</h3>
      {children ? <div className="max-w-md text-sm text-muted">{children}</div> : null}
      {action}
    </div>
  );
}
