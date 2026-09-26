import Link from "next/link";
import type { ReactNode } from "react";

/** Texto con [enlaces](/ruta) y **negrita** (contenido propio, no del usuario). */
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const href = m[2]!;
      out.push(href.startsWith("/") ? <Link key={m.index} href={href} className="font-medium text-primary underline underline-offset-4">{m[1]}</Link> : <a key={m.index} href={href} className="font-medium text-primary underline underline-offset-4" rel="noopener noreferrer" target="_blank">{m[1]}</a>);
    } else out.push(<strong key={m.index} className="font-semibold text-text">{m[3]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
