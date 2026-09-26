/**
 * Exporta a Afi desde su componente (src/components/afi/afi.tsx) para que los
 * archivos estáticos nunca se separen del diseño oficial:
 *   public/afi/<estado>.svg      poses para README, redes, presentaciones…
 *   public/afi/afi-mark.svg      Afi sobre su baldosa lavanda (logo cuadrado)
 *   src/app/icon.svg             favicon
 *   src/app/favicon.ico          favicon para navegadores que piden /favicon.ico
 *   public/icons/*.png           iconos de la app (PWA, Apple)
 *
 *   npx tsx scripts/brand/export-afi.tsx
 */
import React from "react";
import { mkdirSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { Afi, type AfiMood } from "../../src/components/afi/afi";

const POSES: AfiMood[] = ["happy", "waving", "celebrating", "studying", "listening", "thinking", "supportive", "proud", "sleepy", "curious"];

/** SVG autónomo: con xmlns y la sombra con su color (sin variables CSS). */
function standalone(mood: AfiMood, size = 512): string {
  return renderToStaticMarkup(<Afi mood={mood} size={size} still />)
    .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/ class="[^"]*"/, "")
    .replace(' aria-hidden="true"', "")
    .replace("var(--afi-shadow, #dcd8f5)", "#dcd8f5");
}

/** Afi centrado en una baldosa redondeada (icono de app, logo cuadrado). */
function mark(size: number, pad: number, radius: number): string {
  const inner = renderToStaticMarkup(<Afi mood="happy" size={size - pad * 2} still />)
    .replace(/<svg [^>]*?viewBox="([^"]+)"[^>]*>/, (_m, vb) => `<svg x="${pad}" y="${pad * 1.1}" width="${size - pad * 2}" height="${size - pad * 2}" viewBox="${vb}">`)
    .replace("var(--afi-shadow, #dcd8f5)", "#d6d1f3");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#eeeefd"/>${inner}</svg>`;
}

async function main() {
  mkdirSync("public/afi", { recursive: true });
  for (const m of POSES) writeFileSync(`public/afi/${m}.svg`, standalone(m));
  writeFileSync("public/afi/afi-mark.svg", mark(512, 56, 112));
  writeFileSync("src/app/icon.svg", mark(140, 14, 32));
  const png = (svg: string, size: number, file: string) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
  await png(mark(512, 56, 0), 180, "public/icons/apple-touch-icon.png");
  await png(mark(512, 56, 112), 192, "public/icons/icon-192.png");
  await png(mark(512, 56, 112), 512, "public/icons/icon-512.png");
  // Maskable: zona segura del 80 %, sin esquinas redondeadas.
  await png(mark(512, 110, 0), 192, "public/icons/maskable-192.png");
  await png(mark(512, 110, 0), 512, "public/icons/maskable-512.png");
  // favicon.ico con PNG dentro (16, 32 y 48 px): lo piden navegadores y lectores de RSS aunque exista icon.svg.
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((n) => sharp(Buffer.from(mark(512, 56, 112))).resize(n, n).png({ compressionLevel: 9 }).toBuffer()));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((n, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(n, e);
    header.writeUInt8(n, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(pngs[i]!.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += pngs[i]!.length;
  });
  writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...pngs]));
  console.log(`Afi exportado: ${POSES.length} poses, logo, favicon e iconos.`);
}
void main();
