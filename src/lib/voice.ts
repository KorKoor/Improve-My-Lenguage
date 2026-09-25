/**
 * Elección de la voz de síntesis. Los navegadores traen voces de calidad muy
 * distinta: las «naturales» o en la nube (Microsoft «Online (Natural)»,
 * Google, Apple «Premium/Enhanced/Siri») se entienden mucho mejor que las
 * robóticas de siempre. Puro y testeable.
 */
export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

const GOOD = /natural|neural|online|premium|enhanced|google|siri|wavenet/i;
const BAD = /compact|eloquence|espeak|novelty|whisper|bad news|bells|jester|organ|zarvox|trinoids|superstar|bubbles|cellos|albert|boing|fred|junior|ralph|kathy/i;

export function voiceScore(v: VoiceLike, locale: string): number {
  const lang = v.lang.toLowerCase().replace("_", "-");
  const want = locale.toLowerCase();
  if (!lang.startsWith(want.slice(0, 2))) return -1;
  let s = 1;
  if (lang === want) s += 2;
  if (GOOD.test(v.name)) s += 3;
  if (BAD.test(v.name)) s -= 3;
  if (v.localService === false) s += 1;
  if (v.default) s += 0.5;
  return s;
}

/** Mejor voz para el idioma, o null si el dispositivo no tiene ninguna. */
export function pickVoice<T extends VoiceLike>(voices: T[], locale: string): T | null {
  let best: T | null = null;
  let bestScore = 0;
  for (const v of voices) {
    const s = voiceScore(v, locale);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return best;
}

export type Platform = "windows" | "android" | "ios" | "mac" | "other";

export function detectPlatform(ua: string): Platform {
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  if (/windows/i.test(ua)) return "windows";
  if (/mac os x|macintosh/i.test(ua)) return "mac";
  return "other";
}

/** Cómo instalar una voz del idioma en cada sistema (texto para el alumno). */
export function installVoiceHelp(p: Platform, languageName: string): string {
  const l = languageName.toLowerCase();
  switch (p) {
    case "windows":
      return `Windows: Configuración → Hora e idioma → Voz → «Agregar voces» y elige ${l}. En Microsoft Edge las voces «Natural» suenan mucho mejor.`;
    case "android":
      return `Android: Ajustes → Sistema → Idiomas → Salida de texto a voz → Servicios de voz de Google → instala los datos de voz de ${l}.`;
    case "ios":
      return `iPhone/iPad: Ajustes → Accesibilidad → Contenido leído → Voces → ${l} y descarga una voz «Mejorada».`;
    case "mac":
      return `Mac: Ajustes del Sistema → Accesibilidad → Contenido leído → Voz del sistema → Gestionar voces → ${l}.`;
    default:
      return `Instala una voz de ${l} en tu sistema o usa Chrome o Edge, que traen voces en línea.`;
  }
}
