import { ImageResponse } from "next/og";

export const alt = "Improve My Languages — El curso se adapta a ti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #fbf8f4 0%, #eeeefd 100%)", color: "#1f1b2e", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 30, color: "#5b5fd6", fontWeight: 700 }}>Improve My Languages</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 20 }}>El curso se adapta a ti.</div>
        <div style={{ fontSize: 32, color: "#6b6680", marginTop: 24 }}>Diagnóstico real · Repetición espaciada · Errores que no se repiten</div>
      </div>
    ),
    size,
  );
}
