import type { ReactNode } from "react";
import { Afi, type AfiMood } from "../afi/afi";

/** Estado vacío acompañado por Afi (cada pantalla puede elegir su expresión). */
export function EmptyState({ title, children, action, mood = "calm" }: { title: string; children?: ReactNode; action?: ReactNode; mood?: AfiMood }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <Afi size={88} mood={mood} />
      <h2 className="font-display text-lg font-extrabold">{title}</h2>
      {children ? <div className="max-w-md text-sm text-muted">{children}</div> : null}
      {action}
    </div>
  );
}
