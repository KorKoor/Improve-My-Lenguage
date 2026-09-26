import type { AlphabetName, SpecialSign } from "./types";

/** Letra del abecedario: «B b» se llama «bé»; por defecto se lee la mayúscula sola. */
export const N = (g: string, name: string, say?: string): AlphabetName => ({ g, name, say: say ?? g.split(" ")[0]! });

export const SG = (g: string, name: string, use: string, w: string, es: string): SpecialSign => ({ g, name, use, ex: { w, es } });

/** Cómo escribir tildes y letras especiales en idiomas con letras latinas. */
export const latinTyping = (idioma: string, ejemplo: string) => ({
  phone: `Mantén pulsada la letra base y elige la variante (${ejemplo}). Funciona en Gboard (Android) y en el teclado del iPhone. También puedes añadir el teclado de ${idioma} en los ajustes del teclado.`,
  computer: `Windows: añade el teclado de ${idioma} en Configuración › Hora e idioma › Idioma y región, o usa «Estados Unidos-Internacional» (' + e = é, \` + e = è, ^ + e = ê, " + u = ü). Mac: mantén pulsada la tecla y elige la variante, igual que en el móvil.`,
});

/** Cómo escribir en una escritura no latina. */
export const scriptTyping = (idioma: string, extra: string) => ({
  phone: `Añade el teclado de ${idioma}: en Android (Gboard) Ajustes › Idiomas › Añadir teclado; en iPhone Ajustes › General › Teclado › Teclados › Añadir. Cambia de teclado con el globo 🌐. ${extra}`,
  computer: `Windows: Configuración › Hora e idioma › Idioma y región › Agregar un idioma (${idioma}); cambia con Windows + Espacio. Mac: Ajustes del Sistema › Teclado › Fuentes de entrada. ${extra}`,
});
