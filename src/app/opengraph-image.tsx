import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Improve My Languages — Aprendizaje adaptativo de idiomas, con Afi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir: marca, promesa y Afi (el mismo SVG que en la app). */
export default function OgImage() {
  const afi = readFileSync(path.join(process.cwd(), "public/afi/waving.svg"), "utf-8");
  const src = `data:image/svg+xml;base64,${Buffer.from(afi).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "0 80px", background: "linear-gradient(135deg, #fbf8f4 0%, #eeeefd 100%)", color: "#1f1b2e", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 30, color: "#5b5fd6", fontWeight: 700 }}>Improve My Languages</div>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>El curso se adapta a ti.</div>
          <div style={{ fontSize: 30, color: "#6b6680", marginTop: 22, lineHeight: 1.3 }}>Nivel por habilidad · Repetición espaciada · Errores que no se repiten</div>
          <div style={{ fontSize: 26, color: "#5b5fd6", marginTop: 34, fontWeight: 700 }}>Learn smarter. Become better.</div>
        </div>
        <img src={src} width={380} height={380} alt="" />
      </div>
    ),
    size,
  );
}
