/**
 * Texto con la sílaba fuerte marcada: la tilde combinada (вода́) no se ve bien
 * en todas las fuentes, así que la vocal fuerte se subraya y se colorea.
 */
export function Stressed({ text }: { text: string }) {
  if (!text.includes("́")) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  const chars = [...text.normalize("NFD")];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    if (c === "́") continue;
    if (chars[i + 1] === "́") {
      parts.push(
        <span key={i} className="text-primary underline decoration-2 underline-offset-4">
          {c}
        </span>,
      );
    } else parts.push(c.normalize("NFC"));
  }
  return <>{parts}</>;
}
