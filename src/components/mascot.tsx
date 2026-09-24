/**
 * Mascota original de Improve My Languages: un gatito con audífonos.
 * SVG inline (sin imágenes externas), se adapta al tema.
 */
export function Mascot({ size = 120, mood = "happy", className }: { size?: number; mood?: "happy" | "calm" | "cheer"; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label="Mascota de Improve My Languages" className={className}>
      <ellipse cx="70" cy="130" rx="42" ry="6" fill="#d9d3ec" opacity=".7" />
      <path d="M26 60 L36 26 L60 48 Z" fill="#fff9f2" stroke="#e3d9f2" strokeWidth="2" strokeLinejoin="round" />
      <path d="M114 60 L104 26 L80 48 Z" fill="#fff9f2" stroke="#e3d9f2" strokeWidth="2" strokeLinejoin="round" />
      <path d="M33 36 L38 50 L48 44 Z" fill="#f6c6d3" opacity=".8" />
      <path d="M107 36 L102 50 L92 44 Z" fill="#f6c6d3" opacity=".8" />
      <ellipse cx="70" cy="81" rx="52" ry="43" fill="#fff9f2" stroke="#e3d9f2" strokeWidth="2" />
      <path d="M12 74 C12 8 128 8 128 74" fill="none" stroke="#8e93f5" strokeWidth="8" strokeLinecap="round" />
      <rect x="4" y="66" width="22" height="34" rx="11" fill="#7c80ee" />
      <rect x="114" y="66" width="22" height="34" rx="11" fill="#7c80ee" />
      {mood === "cheer" ? (
        <>
          <path d="M44 82 q6 -8 12 0" fill="none" stroke="#2b2540" strokeWidth="3" strokeLinecap="round" />
          <path d="M84 82 q6 -8 12 0" fill="none" stroke="#2b2540" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : mood === "calm" ? (
        <>
          <path d="M45 80 q6 5 12 0" fill="none" stroke="#2b2540" strokeWidth="3" strokeLinecap="round" />
          <path d="M83 80 q6 5 12 0" fill="none" stroke="#2b2540" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="51" cy="80" rx="5" ry="6" fill="#2b2540" />
          <ellipse cx="89" cy="80" rx="5" ry="6" fill="#2b2540" />
          <circle cx="53" cy="78" r="1.6" fill="#fff" />
          <circle cx="91" cy="78" r="1.6" fill="#fff" />
        </>
      )}
      <ellipse cx="39" cy="96" rx="7.5" ry="4" fill="#f6b8c8" opacity=".85" />
      <ellipse cx="101" cy="96" rx="7.5" ry="4" fill="#f6b8c8" opacity=".85" />
      <path d="M60 94 q5 6 10 0 q5 6 10 0" fill="none" stroke="#2b2540" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
