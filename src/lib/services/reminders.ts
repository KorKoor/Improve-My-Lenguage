import type { PushMessage } from "../firebase/admin";

export interface ReminderInput {
  displayName: string | null;
  due: number;
  streakYesterday: boolean;
}

/** Mensaje de recordatorio determinista: prioriza repasos pendientes, luego la racha. */
export function reminderMessage(c: ReminderInput): PushMessage {
  const hi = c.displayName ? `${c.displayName}, ` : "";
  if (c.due > 0) {
    return { title: "Repasos listos", body: `${hi}tienes ${c.due} ${c.due === 1 ? "palabra lista" : "palabras listas"} para repasar.`, link: "/app/review" };
  }
  if (c.streakYesterday) {
    return { title: "Mantén tu racha", body: `${hi}ayer estudiaste: unos minutos hoy mantienen la racha.`, link: "/app/session" };
  }
  return { title: "Tu sesión de hoy", body: `${hi}tu sesión diaria está esperando.`, link: "/app/session" };
}
