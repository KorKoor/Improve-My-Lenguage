import Link from "next/link";
import { Mascot } from "./mascot";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-xl" aria-label="Improve My Languages — inicio">
      <Mascot size={compact ? 34 : 42} />
      {!compact && (
        <span className="hidden min-w-0 leading-tight min-[440px]:block">
          <span className="block whitespace-nowrap font-display text-[15px] font-extrabold tracking-tight sm:text-[17px]">Improve My Languages</span>
          <span className="hidden text-[10.5px] font-medium text-muted sm:block">Learn smarter. Become better.</span>
        </span>
      )}
    </Link>
  );
}
