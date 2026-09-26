import { cn } from "@/lib/cn";

/**
 * Afi, la mascota y compañera de aprendizaje de Improve My Languages.
 *
 * Una nube suave con audífonos lavanda y una estrella dorada en cada
 * auricular. Siempre el mismo cuerpo, los mismos colores y las mismas
 * proporciones (docs/BRAND.md): sólo cambian la cara y, a veces, un objeto.
 * SVG en línea, sin imágenes ni ids (se puede repetir en la página), ligero y
 * nítido a cualquier tamaño. Decorativo por defecto (aria-hidden); con
 * `label` se anuncia como imagen.
 */
export type AfiMood =
  | "happy"
  | "neutral"
  | "curious"
  | "thinking"
  | "studying"
  | "celebrating"
  | "encouraging"
  | "surprised"
  | "confused"
  | "sleepy"
  | "resting"
  | "listening"
  | "reading"
  | "writing"
  | "speaking"
  | "error"
  | "proud"
  | "excited"
  | "calm"
  | "supportive"
  | "waving"
  | "goodbye";

export type AfiMotion = "none" | "breathe" | "float" | "hop" | "sway";

// Paleta fija de Afi (no cambia con el tema: Afi es el mismo de día y de noche).
const C = {
  body: "#fdfcff",
  bodyEdge: "#e7e3fa",
  shade: "#ebe7fc",
  band: "#a9abee",
  bandLight: "#cfd0f7",
  cup: "#8f92e6",
  cushion: "#b9bbf2",
  star: "#f7cb4d",
  starEdge: "#e8b334",
  ink: "#2f2b4a",
  cheek: "#f8bccd",
  mouth: "#e0748f",
  prop: "#8f92e6",
  heart: "#f59ab2",
};

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.48 : r;
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(1)},${(cy + rr * Math.sin(rad)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

const line = { fill: "none", stroke: C.ink, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Ojos: puntos (con brillo), arcos felices, cerrados, guiño, sorpresa o chispa. */
function Eyes({ kind, look = 0 }: { kind: "dot" | "happy" | "closed" | "wink" | "round" | "sparkle" | "soft"; look?: number }) {
  const L = 68;
  const R = 92;
  const y = 90 + look;
  if (kind === "happy") return <><path d={`M${L - 4.5} ${y + 1} q4.5 -5.5 9 0`} {...line} /><path d={`M${R - 4.5} ${y + 1} q4.5 -5.5 9 0`} {...line} /></>;
  if (kind === "closed") return <><path d={`M${L - 4.5} ${y - 1} q4.5 4.5 9 0`} {...line} /><path d={`M${R - 4.5} ${y - 1} q4.5 4.5 9 0`} {...line} /></>;
  if (kind === "soft") return <><path d={`M${L - 4} ${y} q4 2.5 8 0`} {...line} /><path d={`M${R - 4} ${y} q4 2.5 8 0`} {...line} /></>;
  if (kind === "wink") return <><Dot x={L} y={y} /><path d={`M${R - 4.5} ${y + 1} q4.5 -5.5 9 0`} {...line} /></>;
  if (kind === "round") return <><ellipse cx={L} cy={y} rx={4.4} ry={5.4} fill={C.ink} /><ellipse cx={R} cy={y} rx={4.4} ry={5.4} fill={C.ink} /><circle cx={L + 1.4} cy={y - 2} r={1.5} fill="#fff" /><circle cx={R + 1.4} cy={y - 2} r={1.5} fill="#fff" /></>;
  if (kind === "sparkle") return <><Dot x={L} y={y} big /><Dot x={R} y={y} big /><circle cx={L - 1.4} cy={y + 1.8} r={0.9} fill="#fff" /><circle cx={R - 1.4} cy={y + 1.8} r={0.9} fill="#fff" /></>;
  return <><Dot x={L} y={y} /><Dot x={R} y={y} /></>;
}

function Dot({ x, y, big = false }: { x: number; y: number; big?: boolean }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={big ? 4 : 3.5} ry={big ? 4.9 : 4.4} fill={C.ink} />
      <circle cx={x + 1.2} cy={y - 1.6} r={1.2} fill="#fff" />
    </>
  );
}

/** Boca: sonrisa, sonrisa abierta, «o», recta, ondulada. */
function Mouth({ kind }: { kind: "smile" | "open" | "o" | "flat" | "wavy" | "small" }) {
  if (kind === "open") return <path d="M74.5 97.5 q5.5 7.5 11 0 z" fill={C.mouth} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />;
  if (kind === "o") return <ellipse cx={80} cy={100} rx={2.6} ry={3} fill={C.ink} />;
  if (kind === "flat") return <path d="M76.5 99.5 h7" {...line} strokeWidth={2.2} />;
  if (kind === "wavy") return <path d="M75 100 q2.5 -2.5 5 0 q2.5 2.5 5 0" {...line} strokeWidth={2.2} />;
  if (kind === "small") return <path d="M77.5 98.5 q2.5 2.5 5 0" {...line} strokeWidth={2.2} />;
  return <path d="M76 98 q4 4.5 8 0" {...line} strokeWidth={2.4} />;
}

/** Cejas suaves (sólo en estados que las necesitan). */
function Brows({ kind }: { kind: "worried" | "up" }) {
  return kind === "worried" ? (
    <><path d="M63 81.5 l8 -2.5" {...line} strokeWidth={2} /><path d="M97 81.5 l-8 -2.5" {...line} strokeWidth={2} /></>
  ) : (
    <><path d="M63.5 80 q4.5 -3 9 0" {...line} strokeWidth={2} /><path d="M87.5 80 q4.5 -3 9 0" {...line} strokeWidth={2} /></>
  );
}

// Objetos pequeños que acompañan algunos estados (nunca tapan la cara).
const Book = () => (
  <g>
    <path d="M58 118 q11 -6 22 0 q11 -6 22 0 v17 q-11 -6 -22 0 q-11 -6 -22 0 z" fill={C.prop} stroke="#7a7dd6" strokeWidth={1.5} strokeLinejoin="round" />
    <path d="M80 118 v17" stroke="#dcdcf8" strokeWidth={1.5} />
    <path d="M69 125 q-2 -3 -4 -1 q-2 2 4 5 q6 -3 4 -5 q-2 -2 -4 1" fill="#fff" opacity={0.9} />
  </g>
);
const Pencil = () => (
  <g transform="rotate(-35 112 118)">
    <rect x={104} y={112} width={22} height={7} rx={2} fill={C.star} stroke={C.starEdge} strokeWidth={1.2} />
    <path d="M104 112 l-6 3.5 l6 3.5 z" fill="#f3dcc0" />
    <rect x={124} y={112} width={4} height={7} rx={1.5} fill={C.heart} />
  </g>
);
const Cup = () => (
  <g>
    <path d="M110 110 h18 v14 q0 7 -9 7 q-9 0 -9 -7 z" fill={C.prop} />
    <path d="M128 114 q6 0 6 5 q0 5 -6 5" fill="none" stroke={C.prop} strokeWidth={2.5} />
    <path d="M119 116 q-1.5 -2 -3 -0.5 q-1.5 1.5 3 4 q4.5 -2.5 3 -4 q-1.5 -1.5 -3 0.5" fill="#fff" />
  </g>
);
const Heart = ({ x = 80, y = 124, s = 1 }: { x?: number; y?: number; s?: number }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 6 C-10 -2 -9 -11 -3 -11 C0 -11 0 -8 0 -7 C0 -8 0 -11 3 -11 C9 -11 10 -2 0 6 Z" fill={C.heart} />
);
const Zz = () => (
  <g fill={C.band} fontFamily="system-ui, sans-serif" fontWeight={700}>
    <text x={132} y={40} fontSize={12}>z</text>
    <text x={141} y={28} fontSize={16}>z</text>
  </g>
);
const Question = () => <text x={130} y={42} fontSize={20} fontWeight={800} fill={C.band} fontFamily="system-ui, sans-serif">?</text>;
const Bulb = () => (
  <g>
    <circle cx={80} cy={8} r={7} fill={C.star} />
    <rect x={77} y={14} width={6} height={4} rx={1} fill={C.starEdge} />
    <path d="M68 4 l-4 -2 M92 4 l4 -2 M80 -4 v-3" stroke={C.starEdge} strokeWidth={1.6} strokeLinecap="round" />
  </g>
);
const Notes = () => (
  <g fill={C.band}>
    <path d="M140 30 v14 a3.5 3 0 1 1 -2 -2.6 v-9 l8 -2 v10 a3.5 3 0 1 1 -2 -2.6 v-6 z" />
  </g>
);
const Sparkles = () => (
  <g fill={C.star}>
    <path d={star(20, 34, 5)} />
    <path d={star(142, 26, 6)} />
    <path d={star(150, 58, 3.5)} />
    <circle cx={14} cy={56} r={2} fill={C.heart} />
  </g>
);
const Waves = () => <path d="M152 88 q5 5 0 10 M158 83 q9 10 0 20" fill="none" stroke={C.band} strokeWidth={2.4} strokeLinecap="round" />;
const Dots = () => <g fill={C.band}><circle cx={128} cy={44} r={2.5} /><circle cx={136} cy={36} r={3.2} /><circle cx={145} cy={26} r={4} /></g>;

type Face = { eyes: Parameters<typeof Eyes>[0]["kind"]; mouth: Parameters<typeof Mouth>[0]["kind"]; look?: number; brows?: "worried" | "up"; extra?: React.ReactNode; wave?: boolean; blush?: number };

const FACES: Record<AfiMood, Face> = {
  happy: { eyes: "happy", mouth: "smile" },
  neutral: { eyes: "dot", mouth: "small" },
  curious: { eyes: "dot", mouth: "o", extra: <Question /> },
  thinking: { eyes: "dot", mouth: "flat", look: -2, extra: <Dots /> },
  studying: { eyes: "dot", mouth: "smile", look: 2, extra: <Book /> },
  celebrating: { eyes: "happy", mouth: "open", extra: <Sparkles />, blush: 1 },
  encouraging: { eyes: "wink", mouth: "smile", extra: <Heart x={140} y={40} s={0.8} /> },
  surprised: { eyes: "round", mouth: "o", brows: "up" },
  confused: { eyes: "dot", mouth: "wavy", brows: "worried", extra: <Question /> },
  sleepy: { eyes: "closed", mouth: "small", extra: <Zz /> },
  resting: { eyes: "closed", mouth: "small", extra: <Cup /> },
  listening: { eyes: "closed", mouth: "smile", extra: <Notes /> },
  reading: { eyes: "dot", mouth: "small", look: 2.5, extra: <Book /> },
  writing: { eyes: "dot", mouth: "small", look: 2.5, extra: <Pencil /> },
  speaking: { eyes: "dot", mouth: "open", extra: <Waves /> },
  error: { eyes: "dot", mouth: "flat", brows: "worried" },
  proud: { eyes: "happy", mouth: "smile", extra: <path d={star(80, 10, 9)} fill={C.star} stroke={C.starEdge} strokeWidth={1.2} />, blush: 1 },
  excited: { eyes: "sparkle", mouth: "open", extra: <Sparkles /> },
  calm: { eyes: "soft", mouth: "small" },
  supportive: { eyes: "soft", mouth: "small", brows: "worried", extra: <Heart /> },
  waving: { eyes: "happy", mouth: "open", wave: true },
  goodbye: { eyes: "happy", mouth: "smile", wave: true },
};

// Estados con objeto que ya ocupan la parte de abajo: sin patitas delante.
const HIDES_PAWS = new Set<AfiMood>(["studying", "reading"]);

export function Afi({
  mood = "happy",
  size = 96,
  motion = "none",
  label,
  className,
}: {
  mood?: AfiMood;
  size?: number;
  motion?: AfiMotion;
  /** Texto para lectores de pantalla; sin él, Afi es decorativo. */
  label?: string;
  className?: string;
}) {
  const f = FACES[mood];
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -12 160 162"
      className={cn("afi shrink-0 overflow-visible", motion !== "none" && `afi-${motion}`, className)}
      focusable="false"
      {...a11y}
    >
      {/* Sombra en el suelo */}
      <ellipse cx={80} cy={141} rx={50} ry={6.5} fill="var(--afi-shadow, #dcd8f5)" />
      <g className="afi-body">
        {/* Cuerpo: una nube redondeada */}
        <path
          d="M46 136 C28 136 18 124 23 110 C11 104 11 84 25 77 C21 58 36 44 53 48 C58 31 80 25 94 37 C108 29 128 40 127 58 C142 63 149 84 138 97 C148 110 140 136 116 136 Z"
          fill={C.body}
          stroke={C.bodyEdge}
          strokeWidth={1.6}
        />
        {/* Sombreado lavanda abajo y brillo arriba */}
        <path d="M24 108 C28 126 48 134 80 134 C112 134 134 127 138 99 C126 118 104 125 80 125 C57 125 37 120 24 108 Z" fill={C.shade} />
        <path d="M60 48 q12 -9 24 -4" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
        {/* Patitas */}
        {!HIDES_PAWS.has(mood) && (
          <>
            <ellipse cx={63} cy={133} rx={11} ry={7.5} fill={C.body} stroke={C.bodyEdge} strokeWidth={1.4} />
            <ellipse cx={97} cy={133} rx={11} ry={7.5} fill={C.body} stroke={C.bodyEdge} strokeWidth={1.4} />
          </>
        )}
        {/* Brazo que saluda */}
        {f.wave && <ellipse cx={147} cy={98} rx={9} ry={13} transform="rotate(38 147 98)" fill={C.body} stroke={C.bodyEdge} strokeWidth={1.4} className="afi-wave" />}
        {/* Cara */}
        {f.brows && <Brows kind={f.brows} />}
        <Eyes kind={f.eyes} look={f.look} />
        <ellipse cx={57} cy={100} rx={6.5} ry={3.6} fill={C.cheek} opacity={0.7 + (f.blush ?? 0) * 0.25} />
        <ellipse cx={103} cy={100} rx={6.5} ry={3.6} fill={C.cheek} opacity={0.7 + (f.blush ?? 0) * 0.25} />
        <Mouth kind={f.mouth} />
        {/* Audífonos: diadema, auriculares y la estrella dorada de cada lado */}
        <path d="M27 86 C19 -2 141 -2 133 86" fill="none" stroke={C.band} strokeWidth={7} strokeLinecap="round" />
        <path d="M31 70 C30 18 130 18 129 70" fill="none" stroke={C.bandLight} strokeWidth={1.8} strokeLinecap="round" opacity={0.8} />
        <rect x={12} y={74} width={22} height={34} rx={11} fill={C.cup} />
        <rect x={29} y={79} width={8} height={24} rx={4} fill={C.cushion} />
        <rect x={126} y={74} width={22} height={34} rx={11} fill={C.cup} />
        <rect x={123} y={79} width={8} height={24} rx={4} fill={C.cushion} />
        <path d={star(26, 73, 7.5)} fill={C.star} stroke={C.starEdge} strokeWidth={1.1} strokeLinejoin="round" />
        <path d={star(134, 73, 7.5)} fill={C.star} stroke={C.starEdge} strokeWidth={1.1} strokeLinejoin="round" />
        {f.extra}
      </g>
    </svg>
  );
}
