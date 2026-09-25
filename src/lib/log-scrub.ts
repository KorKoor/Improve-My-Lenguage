/** Quita correos y tokens largos de un mensaje de error antes de registrarlo. */
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const LONG_TOKEN = /[A-Za-z0-9_-]{32,}/g;

export function scrub(message: string): string {
  return message.replace(EMAIL, "<email>").replace(LONG_TOKEN, "<token>").slice(0, 200);
}
