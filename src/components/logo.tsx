import Link from "next/link";
import { Mascot } from "./mascot";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-xl" aria-label="Improve My Languages — inicio">
      <Mascot size={compact ? 34 : 42} />
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-[17px] font-extrabold tracking-tight">Improve My Languages</span>
          <span className="block text-[10.5px] font-medium text-muted">Learn smarter. Become better.</span>
        </span>
      )}
    </Link>
  );
}
