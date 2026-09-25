import "server-only";
import { randomInt } from "node:crypto";
import { getLanguage } from "../content";
import type { CefrLevel } from "../content/types";
import * as repo from "../db/repositories";
import { rateLimit } from "../db/limits";
import { isAdminConfigured, sendPush } from "../firebase/admin";
import { overallTheta, thetaToCefr } from "../engine/levels";
import { computeStreak, localDay } from "../engine/progress";
import type { Viewer } from "./viewer";

/**
 * Grupo familiar o de estudio: hasta 8 personas que se ven la racha, los
 * minutos de la semana y el idioma/nivel, y se mandan ánimos. Nada más: ni
 * errores, ni textos, ni correos. Unirse es voluntario y se puede salir.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I/L: fácil de dictar por teléfono
export const CHEERS = ["👏", "💪", "🔥", "❤️", "🎉", "⭐"] as const;

export function newGroupCode(): string {
  return Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

export interface GroupMemberView {
  id: string;
  name: string;
  avatar: string | null;
  isMe: boolean;
  isOwner: boolean;
  language: { code: string; name: string; level: CefrLevel | null } | null;
  streak: number;
  weekMinutes: number;
  studiedToday: boolean;
}

export interface GroupView {
  code: string;
  name: string;
  members: GroupMemberView[];
  max: number;
}

function monday(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - dow * 86_400_000).toISOString().slice(0, 10);
}

async function memberView(uid: string, viewer: Viewer, ownerId: string): Promise<GroupMemberView | null> {
  const profile = await repo.getProfile(uid);
  if (!profile) return null;
  const today = localDay(new Date(), profile.timezone);
  const [days, activity, ul] = await Promise.all([
    repo.allActiveDays(uid),
    repo.getActivity(uid, monday(today)),
    profile.activeLanguage ? repo.getUserLanguage(uid, profile.activeLanguage) : Promise.resolve(null),
  ]);
  let language: GroupMemberView["language"] = null;
  if (ul) {
    const est = (await repo.getSkillEstimates(ul.id)).filter((e) => e.evidence > 0);
    const t = overallTheta(est);
    language = { code: ul.languageCode, name: getLanguage(ul.languageCode)?.name ?? ul.languageCode, level: t === null ? null : thetaToCefr(t) };
  }
  return {
    id: uid,
    name: profile.displayName ?? "Sin nombre",
    avatar: profile.avatar,
    isMe: uid === viewer.userId,
    isOwner: uid === ownerId,
    language,
    streak: computeStreak([...days, ...profile.frozenDays], today),
    weekMinutes: Math.round(activity.reduce((a, r) => a + r.seconds, 0) / 60),
    studiedToday: days.includes(today),
  };
}

export async function groupOverview(viewer: Viewer): Promise<GroupView | null> {
  const code = viewer.profile.groupId;
  if (!code) return null;
  const g = await repo.getGroup(code);
  if (!g || !g.members.includes(viewer.userId)) {
    // El grupo ya no existe o te sacaron: limpiamos la referencia.
    await repo.updateProfile(viewer.userId, { groupId: null });
    return null;
  }
  const members = (await Promise.all(g.members.map((m) => memberView(m, viewer, g.ownerId)))).filter((m): m is GroupMemberView => Boolean(m));
  // Primero quien estudió hoy, luego por racha.
  members.sort((a, b) => Number(b.studiedToday) - Number(a.studiedToday) || b.streak - a.streak);
  return { code: g.id, name: g.name, members, max: repo.GROUP_MAX_MEMBERS };
}

export async function cheer(viewer: Viewer, toId: string, emoji: string): Promise<void> {
  if (!(CHEERS as readonly string[]).includes(emoji)) throw new Error("Ánimo no válido");
  const code = viewer.profile.groupId;
  const g = code ? await repo.getGroup(code) : null;
  if (!g || !g.members.includes(viewer.userId) || !g.members.includes(toId) || toId === viewer.userId) throw new Error("No compartís grupo");
  if (!(await rateLimit(`cheer:${viewer.userId}:${toId}`, 5, 86400))) throw new Error("Ya le mandaste varios ánimos hoy 😊");
  await repo.sendCheer(viewer.userId, toId, emoji);
  // Además, notificación push si la persona la tiene activada (mejor esfuerzo).
  try {
    const tokens = await repo.listPushTokens(toId);
    if (tokens.length && isAdminConfigured()) {
      const name = viewer.profile.displayName ?? "Alguien de tu grupo";
      const { invalid } = await sendPush(tokens, { title: `${emoji} ¡Ánimo!`, body: `${name} te manda ánimo para estudiar hoy.`, link: "/app" });
      if (invalid.length) await repo.prunePushTokens(invalid);
    }
  } catch (err) {
    console.error("[group] no se pudo enviar la notificación del ánimo", err);
  }
}

/** Ánimos recibidos sin ver (con el nombre de quien los mandó); los marca como vistos. */
export async function takeCheers(viewer: Viewer): Promise<{ from: string; emoji: string }[]> {
  const list = await repo.unseenCheers(viewer.userId);
  if (!list.length) return [];
  await repo.markCheersSeen(viewer.userId, list.map((c) => c.id));
  const names = new Map<string, string>();
  for (const c of list) {
    if (!names.has(c.fromId)) names.set(c.fromId, (await repo.getProfile(c.fromId))?.displayName ?? "Alguien de tu grupo");
  }
  return list.map((c) => ({ from: names.get(c.fromId)!, emoji: c.emoji }));
}
