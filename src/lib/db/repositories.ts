import "server-only";
import { createHash } from "node:crypto";
import {
  AggregateField,
  FieldValue,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
} from "firebase-admin/firestore";
import type { CefrLevel, Skill } from "../content/types";
import type { SkillEstimate } from "../engine/levels";
import { parsePersonality, type PersonalityResult } from "../engine/personality";
import { localDay, weekStart } from "../engine/progress";
import { firestore } from "../firebase/admin";
import type { LanguagePriority } from "../engine/multilang";
import type {
  ActivityRow,
  FocusHistoryEntry,
  GoalRow,
  KnowledgeDbRow,
  ProfileRow,
  SessionRow,
  UserLanguageRow,
} from "./types";

/**
 * Repositorios: única capa que habla con la base de datos (Firestore).
 *
 * Modelo (ver docs/DATABASE.md):
 *   users/{uid}                                   perfil y preferencias
 *   users/{uid}/languages/{code}                  idioma + vector de habilidades + objetivo
 *   users/{uid}/languages/{code}/knowledge/{item} memoria FSRS por ítem
 *   users/{uid}/languages/{code}/attempts|mistakes|sessions|assessments|conversations
 *   users/{uid}/activity/{day}__{code}            agregado diario (heatmap, racha)
 *   users/{uid}/achievements|events
 *   pushTokens/{sha256(token)}                    dispositivos para notificaciones
 *
 * Todo cuelga de users/{uid}: la propiedad está codificada en la ruta, así que
 * la autorización es estructural (no se puede leer un documento de otro
 * usuario con un uid propio) y borrar/exportar una cuenta es recorrer un árbol.
 * Un "userLanguageId" es `${uid}:${code}`.
 */

const db = () => firestore();
const users = () => db().collection("users");
const userRef = (uid: string) => users().doc(uid);

export function userLanguageId(uid: string, code: string): string {
  return `${uid}:${code}`;
}

function ulRef(ulId: string): DocumentReference {
  const i = ulId.lastIndexOf(":");
  const uid = ulId.slice(0, i);
  const code = ulId.slice(i + 1);
  if (i <= 0 || !/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(code) || uid.includes("/")) {
    throw new Error("userLanguageId no válido");
  }
  return userRef(uid).collection("languages").doc(code);
}

const knowledgeId = (itemId: string) => encodeURIComponent(itemId);

// ── Conversión de tipos ───────────────────────────────────────────────────
function date(v: unknown): Date | null {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return null;
}
const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
function json(v: unknown): unknown {
  if (typeof v !== "string") return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}
// Estados/planes se guardan serializados: Firestore no admite arrays anidados.
const toJson = (v: unknown) => (v === undefined || v === null ? null : JSON.stringify(v));

// ── Perfil ────────────────────────────────────────────────────────────────
function toProfile(snap: DocumentSnapshot): ProfileRow {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    displayName: str(d.displayName),
    nativeLanguage: str(d.nativeLanguage) ?? "es",
    activeLanguage: str(d.activeLanguage),
    timezone: str(d.timezone) ?? "America/Mexico_City",
    theme: (d.theme as ProfileRow["theme"]) ?? "light",
    dailyMinutes: num(d.dailyMinutes, 15),
    explanationDepth: (d.explanationDepth as ProfileRow["explanationDepth"]) ?? "balanced",
    preferredDifficulty: (d.preferredDifficulty as ProfileRow["preferredDifficulty"]) ?? "balanced",
    competitive: Boolean(d.competitive),
    motivation: str(d.motivation),
    interests: Array.isArray(d.interests) ? (d.interests as string[]) : [],
    interactionPrefs: Array.isArray(d.interactionPrefs) ? (d.interactionPrefs as string[]) : [],
    onboardedAt: date(d.onboardedAt),
    consentAt: date(d.consentAt),
    aiConsent: Boolean(d.aiConsent),
    textSize: d.textSize === "large" || d.textSize === "xl" ? d.textSize : "normal",
    simpleMode: Boolean(d.simpleMode),
    slowAudio: Boolean(d.slowAudio),
    smartBreaks: d.smartBreaks !== false,
    tutorialDoneAt: date(d.tutorialDoneAt),
    avatar: str(d.avatar),
    personality: parsePersonality(json(d.personality)),
    streakFreezes: num(d.streakFreezes),
    groupId: str(d.groupId),
    focusHistory: parseFocusHistory(json(d.focusHistory)),
    frozenDays: Array.isArray(d.frozenDays) ? (d.frozenDays as string[]).filter((x) => typeof x === "string") : [],
    createdAt: date(d.createdAt) ?? new Date(0),
  };
}

function parseFocusHistory(v: unknown): FocusHistoryEntry[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .map((e) => ({
      onsetMin: typeof e.onsetMin === "number" ? e.onsetMin : null,
      durationMin: num(e.durationMin),
      breaks: num(e.breaks),
      at: String(e.at ?? ""),
    }));
}

/** Añade una sesión al historial de atención (se guardan las 20 últimas). */
export async function pushFocusHistory(userId: string, entry: FocusHistoryEntry): Promise<void> {
  await db().runTransaction(async (tx) => {
    const ref = userRef(userId);
    const snap = await tx.get(ref);
    const prev = parseFocusHistory(json(snap.get("focusHistory")));
    tx.set(ref, { focusHistory: toJson([...prev, entry].slice(-20)) }, { merge: true });
  });
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const snap = await userRef(userId).get();
  return snap.exists ? toProfile(snap) : null;
}

export async function ensureProfile(userId: string, displayName: string | null): Promise<ProfileRow> {
  const ref = userRef(userId);
  try {
    await ref.create({ displayName: displayName?.slice(0, 60) ?? null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  } catch (err) {
    if ((err as { code?: number }).code !== 6) throw err; // 6 = ALREADY_EXISTS
  }
  return toProfile(await ref.get());
}

export type ProfileUpdate = Partial<
  Pick<
    ProfileRow,
    | "displayName"
    | "nativeLanguage"
    | "activeLanguage"
    | "timezone"
    | "theme"
    | "dailyMinutes"
    | "explanationDepth"
    | "preferredDifficulty"
    | "competitive"
    | "motivation"
    | "interests"
    | "interactionPrefs"
    | "onboardedAt"
    | "consentAt"
    | "aiConsent"
    | "textSize"
    | "simpleMode"
    | "slowAudio"
    | "smartBreaks"
    | "tutorialDoneAt"
    | "avatar"
    | "groupId"
  >
>;

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<void> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;
  await userRef(userId).set({ ...Object.fromEntries(entries), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

/** Gana un protector de racha (máx. 2). Devuelve el total resultante. */
export async function grantStreakFreeze(userId: string, max: number): Promise<number> {
  return db().runTransaction(async (tx) => {
    const ref = userRef(userId);
    const snap = await tx.get(ref);
    const next = Math.min(max, num(snap.get("streakFreezes")) + 1);
    tx.set(ref, { streakFreezes: next }, { merge: true });
    return next;
  });
}

/** Consume protectores para cubrir días sin actividad (idempotente por día). */
export async function consumeStreakFreezes(userId: string, days: string[]): Promise<boolean> {
  return db().runTransaction(async (tx) => {
    const ref = userRef(userId);
    const snap = await tx.get(ref);
    const frozen: string[] = Array.isArray(snap.get("frozenDays")) ? snap.get("frozenDays") : [];
    const todo = days.filter((d) => !frozen.includes(d));
    const have = num(snap.get("streakFreezes"));
    if (todo.length === 0 || todo.length > have) return false;
    // Guardamos sólo los últimos 60 días cubiertos: suficiente para rachas y récords recientes.
    tx.set(ref, { streakFreezes: have - todo.length, frozenDays: [...frozen, ...todo].sort().slice(-60) }, { merge: true });
    return true;
  });
}

// ── Grupo familiar / de estudio ──────────────────────────────────────────
export interface GroupRow {
  id: string; // = código de invitación
  name: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
}

export const GROUP_MAX_MEMBERS = 8;
const groups = () => db().collection("groups");

function toGroup(snap: DocumentSnapshot): GroupRow | null {
  if (!snap.exists) return null;
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    name: str(d.name) ?? "Mi grupo",
    ownerId: str(d.ownerId) ?? "",
    members: Array.isArray(d.members) ? (d.members as string[]) : [],
    createdAt: date(d.createdAt) ?? new Date(0),
  };
}

export async function getGroup(code: string): Promise<GroupRow | null> {
  if (!/^[A-Z2-9]{6}$/.test(code)) return null;
  return toGroup(await groups().doc(code).get());
}

/** Crea el grupo con un código libre (reintenta ante colisión) y une al creador. */
export async function createGroup(userId: string, name: string, makeCode: () => string): Promise<GroupRow> {
  for (let i = 0; i < 5; i++) {
    const code = makeCode();
    const ref = groups().doc(code);
    try {
      await db().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists) throw new Error("collision");
        tx.create(ref, { name, ownerId: userId, members: [userId], createdAt: FieldValue.serverTimestamp() });
        tx.set(userRef(userId), { groupId: code }, { merge: true });
      });
      return (await getGroup(code))!;
    } catch (err) {
      if ((err as Error).message !== "collision") throw err;
    }
  }
  throw new Error("No se pudo generar un código de grupo");
}

export type JoinResult = "joined" | "already" | "full" | "not_found";

export async function joinGroup(userId: string, code: string): Promise<JoinResult> {
  if (!/^[A-Z2-9]{6}$/.test(code)) return "not_found";
  const ref = groups().doc(code);
  return db().runTransaction(async (tx) => {
    const g = toGroup(await tx.get(ref));
    if (!g) return "not_found";
    if (g.members.includes(userId)) return "already";
    if (g.members.length >= GROUP_MAX_MEMBERS) return "full";
    tx.update(ref, { members: FieldValue.arrayUnion(userId) });
    tx.set(userRef(userId), { groupId: code }, { merge: true });
    return "joined";
  });
}

/** Sale del grupo; si queda vacío se borra, y si salía el creador, hereda el siguiente. */
export async function leaveGroup(userId: string, code: string): Promise<void> {
  const ref = groups().doc(code);
  await db().runTransaction(async (tx) => {
    const g = toGroup(await tx.get(ref));
    tx.set(userRef(userId), { groupId: null }, { merge: true });
    if (!g || !g.members.includes(userId)) return;
    const rest = g.members.filter((m) => m !== userId);
    if (rest.length === 0) tx.delete(ref);
    else tx.update(ref, { members: rest, ownerId: g.ownerId === userId ? rest[0] : g.ownerId });
  });
}

// Ánimos entre miembros: se guardan en el destinatario y se muestran una vez.
export async function sendCheer(fromId: string, toId: string, emoji: string): Promise<void> {
  await userRef(toId).collection("cheers").add({ fromId, emoji, createdAt: FieldValue.serverTimestamp(), seen: false });
}

export async function unseenCheers(userId: string): Promise<{ id: string; fromId: string; emoji: string; createdAt: Date }[]> {
  const snap = await userRef(userId).collection("cheers").where("seen", "==", false).limit(10).get();
  return snap.docs.map((d) => ({ id: d.id, fromId: str(d.get("fromId")) ?? "", emoji: str(d.get("emoji")) ?? "👏", createdAt: date(d.get("createdAt")) ?? new Date(0) }));
}

export async function markCheersSeen(userId: string, ids: string[]): Promise<void> {
  if (!ids.length) return;
  const batch = db().batch();
  for (const id of ids.slice(0, 20)) batch.update(userRef(userId).collection("cheers").doc(id), { seen: true });
  await batch.commit();
}

export async function savePersonality(userId: string, result: PersonalityResult | null): Promise<void> {
  await userRef(userId).set({ personality: toJson(result), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

// ── Idiomas del usuario ───────────────────────────────────────────────────
function toUserLanguage(uid: string, snap: DocumentSnapshot): UserLanguageRow {
  const d = snap.data() ?? {};
  return {
    id: userLanguageId(uid, snap.id),
    userId: uid,
    languageCode: snap.id,
    selfReportedLevel: (str(d.selfReportedLevel) as CefrLevel | null) ?? null,
    assessedAt: date(d.assessedAt),
    priority: d.priority === "main" || d.priority === "active" || d.priority === "maintain" ? d.priority : null,
    createdAt: date(d.createdAt) ?? new Date(0),
  };
}

export async function setLanguagePriority(userId: string, code: string, priority: LanguagePriority): Promise<void> {
  const ref = ulRef(userLanguageId(userId, code));
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("No estudias ese idioma");
    // Sólo puede haber un idioma principal: el anterior pasa a «en progreso».
    if (priority === "main") {
      const all = await tx.get(userRef(userId).collection("languages").where("priority", "==", "main"));
      for (const d of all.docs) if (d.id !== code) tx.update(d.ref, { priority: "active" });
    }
    tx.update(ref, { priority });
  });
}

export async function listUserLanguages(userId: string): Promise<UserLanguageRow[]> {
  const snap = await userRef(userId).collection("languages").orderBy("createdAt").get();
  return snap.docs.map((d) => toUserLanguage(userId, d));
}

export async function getUserLanguage(userId: string, code: string): Promise<UserLanguageRow | null> {
  if (!/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(code)) return null;
  const snap = await userRef(userId).collection("languages").doc(code).get();
  return snap.exists ? toUserLanguage(userId, snap) : null;
}

export async function upsertUserLanguage(
  userId: string,
  code: string,
  selfReportedLevel: CefrLevel | null,
): Promise<UserLanguageRow> {
  const ref = ulRef(userLanguageId(userId, code));
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      tx.set(ref, { selfReportedLevel, assessedAt: null, createdAt: FieldValue.serverTimestamp() });
    } else if (selfReportedLevel) {
      tx.update(ref, { selfReportedLevel });
    }
  });
  return toUserLanguage(userId, await ref.get());
}

export async function markAssessed(ulId: string): Promise<void> {
  await ulRef(ulId).update({ assessedAt: FieldValue.serverTimestamp() });
}

// ── Vector de habilidades (embebido en el documento del idioma) ───────────
export async function getSkillEstimates(ulId: string): Promise<SkillEstimate[]> {
  const snap = await ulRef(ulId).get();
  const skills = (snap.get("skills") ?? {}) as Record<string, { theta: number; se: number; evidence: number }>;
  return Object.entries(skills).map(([skill, e]) => ({ skill: skill as Skill, theta: num(e.theta), se: num(e.se, 1), evidence: num(e.evidence) }));
}

export async function upsertSkillEstimates(ulId: string, estimates: SkillEstimate[]): Promise<void> {
  if (estimates.length === 0) return;
  const skills: Record<string, DocumentData> = {};
  for (const e of estimates) skills[e.skill] = { theta: e.theta, se: e.se, evidence: e.evidence, updatedAt: FieldValue.serverTimestamp() };
  await ulRef(ulId).set({ skills }, { merge: true });
}

// ── Objetivos (el activo, embebido en el idioma) ──────────────────────────
export async function getActiveGoal(ulId: string): Promise<GoalRow | null> {
  const g = (await ulRef(ulId).get()).get("goal") as DocumentData | undefined;
  if (!g) return null;
  return {
    id: String(g.id),
    userLanguageId: ulId,
    targetLevel: g.targetLevel as CefrLevel,
    deadline: str(g.deadline),
    minutesPerDay: num(g.minutesPerDay, 15),
    reason: str(g.reason),
    createdAt: date(g.createdAt) ?? new Date(0),
  };
}

export async function setGoal(
  ulId: string,
  goal: { targetLevel: CefrLevel; deadline: string | null; minutesPerDay: number; reason: string | null },
): Promise<void> {
  await ulRef(ulId).update({ goal: { id: db().collection("_").doc().id, ...goal, createdAt: Timestamp.now() } });
}

// ── Conocimiento (FSRS) ───────────────────────────────────────────────────
function toKnowledge(ulId: string, snap: DocumentSnapshot): KnowledgeDbRow {
  const d = snap.data() ?? {};
  return {
    userLanguageId: ulId,
    itemId: String(d.itemId),
    itemType: d.itemType as KnowledgeDbRow["itemType"],
    status: (d.status as KnowledgeDbRow["status"]) ?? "learning",
    stability: num(d.stability),
    difficulty: num(d.difficulty),
    reps: num(d.reps),
    lapses: num(d.lapses),
    state: (d.state as KnowledgeDbRow["state"]) ?? "new",
    dueAt: date(d.dueAt) ?? new Date(),
    lastReviewAt: date(d.lastReviewAt),
    exposureCount: num(d.exposureCount),
    correctCount: num(d.correctCount),
    incorrectCount: num(d.incorrectCount),
    avgResponseMs: typeof d.avgResponseMs === "number" ? d.avgResponseMs : null,
  };
}

/** Un ítem entra en la cola de repaso si ya se estudió y no está marcado como sabido. */
const reviewable = (reps: number, status: KnowledgeDbRow["status"]) => reps > 0 && status !== "known";

export async function getKnowledge(ulId: string, itemIds: string[]): Promise<KnowledgeDbRow[]> {
  if (itemIds.length === 0) return [];
  const col = ulRef(ulId).collection("knowledge");
  const snaps = await db().getAll(...itemIds.map((id) => col.doc(knowledgeId(id))));
  return snaps.filter((s) => s.exists).map((s) => toKnowledge(ulId, s));
}

export async function getAllKnowledge(ulId: string): Promise<KnowledgeDbRow[]> {
  const snap = await ulRef(ulId).collection("knowledge").get();
  return snap.docs.map((d) => toKnowledge(ulId, d));
}

function dueQuery(ulId: string, now: Date) {
  return ulRef(ulId).collection("knowledge").where("reviewable", "==", true).where("dueAt", "<=", Timestamp.fromDate(now));
}

/**
 * Previsión de repasos: cuántos elementos vencen en cada uno de los próximos
 * `days` tramos de 24 h (sin contar los ya vencidos).
 */
export async function dueForecast(ulId: string, now: Date, days = 7): Promise<number[]> {
  const counts = await Promise.all(
    Array.from({ length: days + 1 }, (_, i) => dueQuery(ulId, new Date(now.getTime() + i * 86_400_000)).count().get().then((a) => a.data().count)),
  );
  return counts.slice(1).map((c, i) => Math.max(0, c - counts[i]!));
}

export async function getDueKnowledge(ulId: string, now: Date, limit: number): Promise<KnowledgeDbRow[]> {
  const snap = await dueQuery(ulId, now).orderBy("dueAt").limit(limit).get();
  return snap.docs.map((d) => toKnowledge(ulId, d));
}

export async function countDue(ulId: string, now: Date): Promise<number> {
  const agg = await dueQuery(ulId, now).count().get();
  return agg.data().count;
}

export async function saveKnowledge(row: KnowledgeDbRow): Promise<void> {
  const { userLanguageId: ulId, ...data } = row;
  await ulRef(ulId)
    .collection("knowledge")
    .doc(knowledgeId(row.itemId))
    .set({ ...data, reviewable: reviewable(row.reps, row.status) }, { merge: true });
}

export async function setKnowledgeStatus(
  ulId: string,
  itemId: string,
  itemType: "vocab" | "grammar",
  status: KnowledgeDbRow["status"],
): Promise<void> {
  const ref = ulRef(ulId).collection("knowledge").doc(knowledgeId(itemId));
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      tx.update(ref, { status, reviewable: reviewable(num(snap.get("reps")), status) });
    } else {
      tx.set(ref, {
        itemId, itemType, status, stability: 0, difficulty: 0, reps: 0, lapses: 0, state: "new",
        dueAt: Timestamp.now(), lastReviewAt: null, exposureCount: 0, correctCount: 0, incorrectCount: 0,
        avgResponseMs: null, reviewable: false, createdAt: FieldValue.serverTimestamp(),
      });
    }
  });
}

// ── Intentos y errores ────────────────────────────────────────────────────
export interface AttemptInsert {
  userLanguageId: string;
  sessionId: string | null;
  exerciseKey: string;
  exerciseType: string;
  skill: Skill;
  errorCategory: string | null;
  correct: boolean;
  nearMiss: boolean;
  response: string;
  timeMs: number;
  attempts: number;
  confidence: number | null;
  difficulty: number;
  /**
   * Estado de memoria de los ítems ANTES de este intento. Permite recalcular
   * el repaso si el alumno indica después que adivinó (ver reviseConfidence).
   */
  previousKnowledge?: (KnowledgeDbRow | null)[];
}

export async function insertAttempt(a: AttemptInsert): Promise<string> {
  const { userLanguageId: ulId, previousKnowledge, ...data } = a;
  const ref = await ulRef(ulId).collection("attempts").add({
    ...data,
    response: data.response.slice(0, 500),
    previousKnowledgeJson: previousKnowledge ? toJson(previousKnowledge) : null,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export interface AttemptRow {
  id: string;
  exerciseKey: string;
  exerciseType: string;
  correct: boolean;
  confidence: number | null;
  previousKnowledge: (KnowledgeDbRow | null)[] | null;
  createdAt: Date;
}

export async function getAttempt(ulId: string, attemptId: string): Promise<AttemptRow | null> {
  if (!/^[A-Za-z0-9]{10,40}$/.test(attemptId)) return null;
  const snap = await ulRef(ulId).collection("attempts").doc(attemptId).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  const prev = json(d.previousKnowledgeJson) as (Record<string, unknown> | null)[] | null;
  return {
    id: snap.id,
    exerciseKey: String(d.exerciseKey),
    exerciseType: String(d.exerciseType),
    correct: d.correct === true,
    confidence: typeof d.confidence === "number" ? d.confidence : null,
    // Las fechas vuelven como texto ISO desde el JSON.
    previousKnowledge: prev?.map((k) =>
      k ? ({ ...k, dueAt: new Date(String(k.dueAt)), lastReviewAt: k.lastReviewAt ? new Date(String(k.lastReviewAt)) : null } as KnowledgeDbRow) : null,
    ) ?? null,
    createdAt: date(d.createdAt) ?? new Date(0),
  };
}

export async function setAttemptConfidence(ulId: string, attemptId: string, confidence: number): Promise<void> {
  await ulRef(ulId).collection("attempts").doc(attemptId).update({ confidence });
}

export interface MistakeInsert {
  userLanguageId: string;
  sessionId: string | null;
  attemptId: string | null;
  source: "exercise" | "tutor" | "writing" | "assessment";
  category: string;
  subcategory: string | null;
  userText: string | null;
  correctedText: string | null;
  explanation: string | null;
}

export async function insertMistakes(rows: MistakeInsert[]): Promise<void> {
  if (rows.length === 0) return;
  const batch = db().batch();
  const now = Timestamp.now();
  for (const { userLanguageId: ulId, ...m } of rows) {
    batch.set(ulRef(ulId).collection("mistakes").doc(), {
      ...m,
      userText: m.userText?.slice(0, 1000) ?? null,
      correctedText: m.correctedText?.slice(0, 1000) ?? null,
      explanation: m.explanation?.slice(0, 2000) ?? null,
      createdAt: now,
    });
  }
  await batch.commit();
}

export async function recentMistakes(ulId: string, since: Date) {
  const snap = await ulRef(ulId).collection("mistakes")
    .where("createdAt", ">=", Timestamp.fromDate(since)).orderBy("createdAt", "desc").limit(500)
    .select("category", "createdAt", "sessionId").get();
  return snap.docs.map((d) => ({ category: String(d.get("category")), createdAt: date(d.get("createdAt"))!, sessionId: str(d.get("sessionId")) }));
}

export async function recentMistakeExamples(ulId: string, limit: number) {
  const snap = await ulRef(ulId).collection("mistakes").orderBy("createdAt", "desc").limit(limit)
    .select("category", "userText", "correctedText", "createdAt").get();
  return snap.docs.map((d) => ({
    category: String(d.get("category")),
    userText: str(d.get("userText")),
    correctedText: str(d.get("correctedText")),
    createdAt: date(d.get("createdAt"))!,
  }));
}

/** Intentos desde una fecha (sólo los campos pedidos). Ventanas acotadas: ≤ 12 semanas. */
async function attemptsSince(ulId: string, since: Date, ...fields: string[]) {
  const snap = await ulRef(ulId).collection("attempts").where("createdAt", ">=", Timestamp.fromDate(since)).select(...fields).get();
  return snap.docs.map((d) => d.data());
}

function tally<K extends string>(rows: DocumentData[], keyOf: (r: DocumentData) => K | null) {
  const acc = new Map<K, { total: number; correct: number }>();
  for (const r of rows) {
    const k = keyOf(r);
    if (k === null) continue;
    const t = acc.get(k) ?? { total: 0, correct: 0 };
    t.total += 1;
    if (r.correct === true) t.correct += 1;
    acc.set(k, t);
  }
  return acc;
}

export async function attemptStatsByCategory(ulId: string, since: Date) {
  const rows = await attemptsSince(ulId, since, "errorCategory", "correct");
  return [...tally(rows, (r) => str(r.errorCategory))].map(([category, t]) => ({ category, ...t }));
}

export async function attemptTotals(ulId: string, since: Date | null) {
  if (since) {
    const rows = await attemptsSince(ulId, since, "correct");
    return { total: rows.length, correct: rows.filter((r) => r.correct === true).length };
  }
  const col = ulRef(ulId).collection("attempts");
  const [all, ok] = await Promise.all([col.count().get(), col.where("correct", "==", true).count().get()]);
  return { total: all.data().count, correct: ok.data().count };
}

export async function weeklyAccuracy(ulId: string, weeks: number) {
  const rows = await attemptsSince(ulId, new Date(Date.now() - weeks * 7 * 86_400_000), "createdAt", "correct");
  return [...tally(rows, (r) => weekStart(date(r.createdAt) ?? new Date()))]
    .map(([week, t]) => ({ week, ...t }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

export async function skillAccuracy(ulId: string, since: Date) {
  const rows = await attemptsSince(ulId, since, "skill", "correct");
  return [...tally(rows, (r) => str(r.skill) as Skill | null)].map(([skill, t]) => ({ skill, ...t }));
}

// ── Sesiones ──────────────────────────────────────────────────────────────
function toSession(ulId: string, snap: DocumentSnapshot): SessionRow {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    userLanguageId: ulId,
    kind: d.kind as SessionRow["kind"],
    plannedMinutes: num(d.plannedMinutes),
    plan: json(d.planJson),
    startedAt: date(d.startedAt) ?? new Date(0),
    completedAt: date(d.completedAt),
    durationSeconds: num(d.durationSeconds),
    exercisesCount: num(d.exercisesCount),
    correctCount: num(d.correctCount),
  };
}

const sessionsOf = (ulId: string) => ulRef(ulId).collection("sessions");

export async function createSession(ulId: string, kind: SessionRow["kind"], plannedMinutes: number, plan: unknown): Promise<SessionRow> {
  const ref = sessionsOf(ulId).doc();
  await ref.set({
    kind, plannedMinutes, planJson: toJson(plan), startedAt: Timestamp.now(), completedAt: null,
    completed: false, durationSeconds: 0, exercisesCount: 0, correctCount: 0, active: false,
  });
  return toSession(ulId, await ref.get());
}

export async function getSession(ulId: string, sessionId: string): Promise<SessionRow | null> {
  if (!/^[A-Za-z0-9]{10,40}$/.test(sessionId)) return null;
  const snap = await sessionsOf(ulId).doc(sessionId).get();
  return snap.exists ? toSession(ulId, snap) : null;
}

export async function bumpSession(ulId: string, sessionId: string, correct: boolean): Promise<void> {
  await sessionsOf(ulId).doc(sessionId).update({
    exercisesCount: FieldValue.increment(1),
    correctCount: FieldValue.increment(correct ? 1 : 0),
    active: true,
  });
}

export async function completeSession(ulId: string, sessionId: string, durationSeconds: number): Promise<SessionRow | null> {
  if (!/^[A-Za-z0-9]{10,40}$/.test(sessionId)) return null;
  const ref = sessionsOf(ulId).doc(sessionId);
  const ok = await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return false;
    tx.update(ref, {
      completedAt: snap.get("completedAt") ?? Timestamp.now(),
      completed: true,
      durationSeconds: Math.max(num(snap.get("durationSeconds")), durationSeconds),
    });
    return true;
  });
  return ok ? toSession(ulId, await ref.get()) : null;
}

export async function recentSessionIds(ulId: string, n: number): Promise<string[]> {
  const snap = await sessionsOf(ulId).where("active", "==", true).orderBy("startedAt", "desc").limit(n).select().get();
  return snap.docs.map((d) => d.id);
}

export async function sessionCounts(userId: string) {
  const langs = await listUserLanguages(userId);
  let completed = 0;
  let seconds = 0;
  await Promise.all(
    langs.map(async (ul) => {
      const col = sessionsOf(ul.id);
      const [done, total] = await Promise.all([
        col.where("completed", "==", true).count().get(),
        col.aggregate({ secs: AggregateField.sum("durationSeconds") }).get(),
      ]);
      completed += done.data().count;
      seconds += total.data().secs ?? 0;
    }),
  );
  return { completed, minutes: Math.floor(seconds / 60) };
}

// ── Diagnóstico ───────────────────────────────────────────────────────────
export interface AssessmentRow {
  id: string;
  userLanguageId: string;
  status: "in_progress" | "completed" | "abandoned";
  state: unknown;
  currentItemId: string | null;
  currentItemSentAt: Date | null;
  result: unknown;
  startedAt: Date;
  finishedAt: Date | null;
}

function toAssessment(ulId: string, snap: DocumentSnapshot): AssessmentRow {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    userLanguageId: ulId,
    status: d.status as AssessmentRow["status"],
    state: json(d.stateJson),
    currentItemId: str(d.currentItemId),
    currentItemSentAt: date(d.currentItemSentAt),
    result: json(d.resultJson),
    startedAt: date(d.startedAt) ?? new Date(0),
    finishedAt: date(d.finishedAt),
  };
}

const assessmentsOf = (ulId: string) => ulRef(ulId).collection("assessments");

/** El diagnóstico abierto se referencia desde el idioma (sin índices compuestos). Caduca a las 24 h. */
export async function getOpenAssessment(ulId: string): Promise<AssessmentRow | null> {
  const openId = str((await ulRef(ulId).get()).get("openAssessmentId"));
  if (!openId) return null;
  const snap = await assessmentsOf(ulId).doc(openId).get();
  if (!snap.exists) return null;
  const row = toAssessment(ulId, snap);
  const fresh = row.startedAt.getTime() > Date.now() - 86_400_000;
  return row.status === "in_progress" && fresh ? row : null;
}

export async function createAssessmentRow(ulId: string, state: unknown): Promise<AssessmentRow> {
  const lang = ulRef(ulId);
  const ref = assessmentsOf(ulId).doc();
  await db().runTransaction(async (tx) => {
    const prev = str((await tx.get(lang)).get("openAssessmentId"));
    if (prev) tx.set(assessmentsOf(ulId).doc(prev), { status: "abandoned" }, { merge: true });
    tx.set(ref, {
      status: "in_progress", stateJson: toJson(state), currentItemId: null, currentItemSentAt: null,
      resultJson: null, startedAt: Timestamp.now(), finishedAt: null,
    });
    tx.update(lang, { openAssessmentId: ref.id });
  });
  return toAssessment(ulId, await ref.get());
}

export async function updateAssessmentRow(
  id: string,
  ulId: string,
  patch: { state: unknown; currentItemId: string | null; status?: AssessmentRow["status"]; result?: unknown },
): Promise<void> {
  const status = patch.status ?? "in_progress";
  const batch = db().batch();
  batch.update(assessmentsOf(ulId).doc(id), {
    stateJson: toJson(patch.state),
    currentItemId: patch.currentItemId,
    currentItemSentAt: patch.currentItemId ? Timestamp.now() : null,
    status,
    resultJson: toJson(patch.result),
    finishedAt: status === "completed" ? Timestamp.now() : null,
  });
  if (status !== "in_progress") batch.update(ulRef(ulId), { openAssessmentId: null });
  await batch.commit();
}

export async function countCompletedAssessments(userId: string): Promise<number> {
  const langs = await listUserLanguages(userId);
  const counts = await Promise.all(langs.map((ul) => assessmentsOf(ul.id).where("status", "==", "completed").count().get()));
  return counts.reduce((n, c) => n + c.data().count, 0);
}

// ── Actividad diaria ──────────────────────────────────────────────────────
const activityOf = (userId: string) => userRef(userId).collection("activity");

export async function bumpActivity(
  userId: string,
  languageCode: string,
  day: string,
  delta: { seconds?: number; exercises?: number; correct?: number; wordsReviewed?: number; sessions?: number },
): Promise<void> {
  const inc = (n?: number) => FieldValue.increment(n ?? 0);
  await activityOf(userId).doc(`${day}__${languageCode}`).set(
    {
      day,
      languageCode,
      seconds: inc(delta.seconds),
      exercises: inc(delta.exercises),
      correct: inc(delta.correct),
      wordsReviewed: inc(delta.wordsReviewed),
      sessions: inc(delta.sessions),
    },
    { merge: true },
  );
}

export async function getActivity(userId: string, sinceDay: string, languageCode?: string): Promise<ActivityRow[]> {
  const snap = await activityOf(userId).where("day", ">=", sinceDay).get();
  const byDay = new Map<string, ActivityRow>();
  for (const doc of snap.docs) {
    const d = doc.data();
    if (languageCode && d.languageCode !== languageCode) continue;
    const row = byDay.get(d.day) ?? { day: d.day, seconds: 0, exercises: 0, correct: 0, wordsReviewed: 0, sessions: 0 };
    row.seconds += num(d.seconds);
    row.exercises += num(d.exercises);
    row.correct += num(d.correct);
    row.wordsReviewed += num(d.wordsReviewed);
    row.sessions += num(d.sessions);
    byDay.set(d.day, row);
  }
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}

/** Filas de actividad por día e idioma (sin agregar), para el reparto multi-idioma. */
export async function getActivityByLanguage(userId: string, sinceDay: string): Promise<{ day: string; languageCode: string; seconds: number; exercises: number }[]> {
  const snap = await activityOf(userId).where("day", ">=", sinceDay).get();
  return snap.docs.map((d) => ({ day: String(d.get("day")), languageCode: String(d.get("languageCode")), seconds: num(d.get("seconds")), exercises: num(d.get("exercises")) }));
}

/** Aciertos por hora local del día (últimos intentos de cada idioma). */
export async function hourlyAccuracy(ulIds: string[], since: Date, timeZone: string): Promise<{ hour: number; total: number; correct: number }[]> {
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, total: 0, correct: 0 }));
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone });
  await Promise.all(
    ulIds.map(async (ulId) => {
      const snap = await ulRef(ulId).collection("attempts").where("createdAt", ">=", Timestamp.fromDate(since)).orderBy("createdAt", "desc").limit(1500).select("correct", "createdAt").get();
      for (const d of snap.docs) {
        const at = date(d.get("createdAt"));
        if (!at) continue;
        const h = Number(fmt.format(at)) % 24;
        hours[h]!.total++;
        if (d.get("correct") === true) hours[h]!.correct++;
      }
    }),
  );
  return hours;
}

export async function allActiveDays(userId: string): Promise<string[]> {
  const snap = await activityOf(userId).where("exercises", ">", 0).select("day").get();
  return [...new Set(snap.docs.map((d) => String(d.get("day"))))].sort();
}

export async function totalExercises(userId: string): Promise<number> {
  const agg = await activityOf(userId).aggregate({ n: AggregateField.sum("exercises") }).get();
  return agg.data().n ?? 0;
}

// ── Logros ────────────────────────────────────────────────────────────────
export async function getUnlockedAchievements(userId: string) {
  const snap = await userRef(userId).collection("achievements").orderBy("unlockedAt").get();
  return snap.docs.map((d) => ({ achievementId: d.id, unlockedAt: date(d.get("unlockedAt")) ?? new Date(0) }));
}

export async function unlockAchievements(userId: string, ids: string[]): Promise<void> {
  const col = userRef(userId).collection("achievements");
  await Promise.all(
    ids.map((id) =>
      col.doc(id).create({ unlockedAt: FieldValue.serverTimestamp() }).catch((err: { code?: number }) => {
        if (err.code !== 6) throw err; // ya desbloqueado
      }),
    ),
  );
}

// ── Tutor ─────────────────────────────────────────────────────────────────
export interface ConversationRow {
  id: string;
  userLanguageId: string;
  topic: string | null;
  feedback: unknown;
  createdAt: Date;
  endedAt: Date | null;
}

function toConversation(ulId: string, snap: DocumentSnapshot): ConversationRow {
  const d = snap.data() ?? {};
  return { id: snap.id, userLanguageId: ulId, topic: str(d.topic), feedback: json(d.feedbackJson), createdAt: date(d.createdAt) ?? new Date(0), endedAt: date(d.endedAt) };
}

const conversationsOf = (ulId: string) => ulRef(ulId).collection("conversations");

export async function createConversation(ulId: string, topic: string | null): Promise<ConversationRow> {
  const ref = conversationsOf(ulId).doc();
  await ref.set({ topic, feedbackJson: null, createdAt: Timestamp.now(), endedAt: null });
  return toConversation(ulId, await ref.get());
}

export async function getConversation(ulId: string, id: string): Promise<ConversationRow | null> {
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return null;
  const snap = await conversationsOf(ulId).doc(id).get();
  return snap.exists ? toConversation(ulId, snap) : null;
}

export async function listConversations(ulId: string, limit = 10): Promise<ConversationRow[]> {
  const snap = await conversationsOf(ulId).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => toConversation(ulId, d));
}

export async function getMessages(ulId: string, conversationId: string) {
  const snap = await conversationsOf(ulId).doc(conversationId).collection("messages").orderBy("createdAt").get();
  return snap.docs.map((d) => ({
    id: d.id,
    role: d.get("role") as "user" | "assistant",
    content: String(d.get("content")),
    createdAt: date(d.get("createdAt")) ?? new Date(0),
  }));
}

export async function addMessage(ulId: string, conversationId: string, role: "user" | "assistant", content: string) {
  await conversationsOf(ulId).doc(conversationId).collection("messages").add({ role, content: content.slice(0, 4000), createdAt: Timestamp.now() });
}

export async function endConversation(ulId: string, id: string, feedback: unknown): Promise<void> {
  await conversationsOf(ulId).doc(id).update({ endedAt: Timestamp.now(), feedbackJson: toJson(feedback) });
}

export async function countConversations(userId: string): Promise<number> {
  const langs = await listUserLanguages(userId);
  const counts = await Promise.all(langs.map((ul) => conversationsOf(ul.id).count().get()));
  return counts.reduce((n, c) => n + c.data().count, 0);
}

// ── Lecturas, escucha y escritura (historial) ───────────────────────────────
export interface ReadingRow {
  id: string;
  source: string;
  title: string;
  url: string;
  level: string;
  correct: number;
  total: number;
  words: number;
  readAt: Date;
}

/** Sólo metadatos y resultado (no el texto): el original sigue en su fuente. */
export async function saveReading(ulId: string, r: Omit<ReadingRow, "id" | "readAt">): Promise<void> {
  const id = createHash("sha1").update(`${r.source}|${r.title}`).digest("hex").slice(0, 20);
  await ulRef(ulId).collection("readings").doc(id).set({ ...r, title: r.title.slice(0, 200), url: r.url.slice(0, 500), readAt: Timestamp.now() });
}

export async function listReadings(ulId: string, limit = 20): Promise<ReadingRow[]> {
  const snap = await ulRef(ulId).collection("readings").orderBy("readAt", "desc").limit(limit).get();
  return snap.docs.map((d) => ({
    id: d.id,
    source: String(d.get("source")),
    title: String(d.get("title")),
    url: String(d.get("url") ?? ""),
    level: String(d.get("level") ?? ""),
    correct: num(d.get("correct")),
    total: num(d.get("total")),
    words: num(d.get("words")),
    readAt: date(d.get("readAt")) ?? new Date(0),
  }));
}

export interface WritingRow {
  id: string;
  prompt: string;
  text: string;
  feedback: unknown;
  score: number | null;
  createdAt: Date;
}

export async function saveWriting(ulId: string, w: { prompt: string; text: string; feedback: unknown; score: number | null }): Promise<string> {
  const ref = await ulRef(ulId).collection("writings").add({
    prompt: w.prompt.slice(0, 300),
    text: w.text.slice(0, 4000),
    feedbackJson: toJson(w.feedback),
    score: w.score,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function listWritings(ulId: string, limit = 10): Promise<WritingRow[]> {
  const snap = await ulRef(ulId).collection("writings").orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => ({
    id: d.id,
    prompt: String(d.get("prompt")),
    text: String(d.get("text")),
    feedback: json(d.get("feedbackJson")),
    score: typeof d.get("score") === "number" ? d.get("score") : null,
    createdAt: date(d.get("createdAt")) ?? new Date(0),
  }));
}

export async function countWritings(userId: string): Promise<number> {
  const langs = await listUserLanguages(userId);
  const counts = await Promise.all(langs.map((ul) => ulRef(ul.id).collection("writings").count().get()));
  return counts.reduce((n, c) => n + c.data().count, 0);
}

// ── Primeros pasos (mejor puntuación por unidad, en el documento del idioma) ─
export async function getFirstSteps(ulId: string): Promise<Record<string, number>> {
  const v = (await ulRef(ulId).get()).get("firstSteps");
  const out: Record<string, number> = {};
  if (v && typeof v === "object") for (const [k, n] of Object.entries(v as Record<string, unknown>)) if (typeof n === "number") out[k] = n;
  return out;
}

export async function saveFirstStepsUnit(ulId: string, unitId: string, score: number): Promise<void> {
  await db().runTransaction(async (tx) => {
    const ref = ulRef(ulId);
    const snap = await tx.get(ref);
    const prev = (snap.get("firstSteps") ?? {}) as Record<string, number>;
    if ((prev[unitId] ?? -1) >= score) return;
    tx.set(ref, { firstSteps: { [unitId]: score } }, { merge: true });
  });
}

export async function countEvents(userId: string, name: string): Promise<number> {
  const agg = await userRef(userId).collection("events").where("name", "==", name).count().get();
  return agg.data().count;
}

/** Eventos desde una fecha (sólo nombre y hora). Filtra por nombre en memoria: sin índices compuestos. */
export async function eventsSince(userId: string, since: Date): Promise<{ name: string; at: Date }[]> {
  const snap = await userRef(userId).collection("events").where("createdAt", ">=", Timestamp.fromDate(since)).limit(500).get();
  return snap.docs.map((d) => ({ name: String(d.get("name") ?? ""), at: date(d.get("createdAt")) ?? new Date(0) }));
}

// ── Misiones diarias ──────────────────────────────────────────────────────
export async function getQuestDay(userId: string, day: string): Promise<{ claimed: string[]; quests: unknown[] | null }> {
  const snap = await userRef(userId).collection("quests").doc(day).get();
  const c = snap.get("claimed");
  const q = json(snap.get("questsJson"));
  return { claimed: Array.isArray(c) ? (c as string[]) : [], quests: Array.isArray(q) ? q : null };
}

/** Fija las misiones del día la primera vez que se generan (no cambian aunque cambie tu nivel). */
export async function saveQuestSet(userId: string, day: string, quests: unknown[]): Promise<void> {
  await userRef(userId).collection("quests").doc(day).set({ questsJson: toJson(quests) }, { merge: true });
}

/** Reclama una misión (idempotente). Devuelve false si ya estaba reclamada. */
export async function claimQuest(userId: string, day: string, questId: string, xp: number): Promise<boolean> {
  const ref = userRef(userId).collection("quests").doc(day);
  return firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const claimed: string[] = Array.isArray(snap.get("claimed")) ? snap.get("claimed") : [];
    if (claimed.includes(questId)) return false;
    tx.set(ref, { claimed: [...claimed, questId], xp: num(snap.get("xp")) + xp, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return true;
  });
}

export async function totalQuestXp(userId: string): Promise<number> {
  const snap = await userRef(userId).collection("quests").select("xp").get();
  return snap.docs.reduce((a, d) => a + num(d.get("xp")), 0);
}

export async function countReadings(userId: string): Promise<number> {
  const langs = await listUserLanguages(userId);
  const counts = await Promise.all(langs.map((ul) => ulRef(ul.id).collection("readings").count().get()));
  return counts.reduce((n, c) => n + c.data().count, 0);
}

// ── Analítica ─────────────────────────────────────────────────────────────
export async function track(userId: string, name: string, props: Record<string, unknown> = {}): Promise<void> {
  try {
    await userRef(userId).collection("events").add({ name: name.slice(0, 60), propsJson: toJson(props), createdAt: Timestamp.now() });
  } catch (err) {
    // La analítica nunca debe romper una acción del usuario.
    console.error("[analytics] fallo al registrar evento", name, err);
  }
}

// ── Notificaciones push ───────────────────────────────────────────────────
const pushTokens = () => db().collection("pushTokens");
const tokenDoc = (token: string) => pushTokens().doc(createHash("sha256").update(token).digest("hex"));

export async function savePushToken(userId: string, token: string, userAgent: string | null): Promise<void> {
  // Un token identifica un navegador: si otra cuenta inicia sesión en él, se reasigna.
  await tokenDoc(token).set(
    { token, userId, userAgent, lastSeenAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
}

export async function deletePushToken(userId: string, token: string): Promise<void> {
  const ref = tokenDoc(token);
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists && snap.get("userId") === userId) tx.delete(ref);
  });
}

export async function listPushTokens(userId: string): Promise<string[]> {
  const snap = await pushTokens().where("userId", "==", userId).get();
  return snap.docs.map((d) => String(d.get("token")));
}

export async function prunePushTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return;
  const batch = db().batch();
  for (const t of tokens) batch.delete(tokenDoc(t));
  await batch.commit();
}

export interface ReminderCandidate {
  userId: string;
  displayName: string | null;
  languageCode: string;
  due: number;
  streakYesterday: boolean;
  tokens: string[];
}

/**
 * Usuarios con algún dispositivo registrado que aún no han estudiado hoy (en
 * su zona horaria), con los repasos pendientes de su idioma activo.
 */
export async function reminderCandidates(limit: number, now = new Date()): Promise<ReminderCandidate[]> {
  const snap = await pushTokens().limit(5000).get();
  const byUser = new Map<string, string[]>();
  for (const d of snap.docs) {
    const uid = String(d.get("userId"));
    byUser.set(uid, [...(byUser.get(uid) ?? []), String(d.get("token"))]);
  }
  const out: ReminderCandidate[] = [];
  for (const [uid, tokens] of byUser) {
    if (out.length >= limit) break;
    const profile = await getProfile(uid);
    if (!profile?.activeLanguage) continue;
    const today = localDay(now, profile.timezone);
    const yesterday = localDay(new Date(now.getTime() - 86_400_000), profile.timezone);
    const recent = await getActivity(uid, yesterday);
    if (recent.some((a) => a.day === today)) continue;
    out.push({
      userId: uid,
      displayName: profile.displayName,
      languageCode: profile.activeLanguage,
      due: await countDue(userLanguageId(uid, profile.activeLanguage), now),
      streakYesterday: recent.some((a) => a.day === yesterday && a.exercises > 0),
      tokens,
    });
  }
  return out;
}

// ── Cuenta: exportación y borrado ─────────────────────────────────────────
/** Documento → objeto JSON plano (Timestamps a ISO, blobs JSON deserializados). */
function plain(snap: DocumentSnapshot): Record<string, unknown> {
  const out: Record<string, unknown> = { id: snap.id };
  for (const [k, v] of Object.entries(snap.data() ?? {})) {
    if (v instanceof Timestamp) out[k] = v.toDate().toISOString();
    else if (k.endsWith("Json")) out[k.slice(0, -4)] = json(v);
    else out[k] = v;
  }
  return out;
}

export async function exportUserData(userId: string) {
  const root = userRef(userId);
  const all = async (col: CollectionReference) => (await col.get()).docs.map(plain);
  const languages = await root.collection("languages").get();
  return {
    exportedAt: new Date().toISOString(),
    profile: plain(await root.get()),
    languages: await Promise.all(
      languages.docs.map(async (l) => {
        const ref = l.ref;
        const conversations = await ref.collection("conversations").get();
        return {
          ...plain(l),
          knowledge: await all(ref.collection("knowledge")),
          sessions: await all(ref.collection("sessions")),
          assessments: await all(ref.collection("assessments")),
          attempts: await all(ref.collection("attempts")),
          mistakes: await all(ref.collection("mistakes")),
          readings: await all(ref.collection("readings")),
          writings: await all(ref.collection("writings")),
          conversations: await Promise.all(
            conversations.docs.map(async (c) => ({ ...plain(c), messages: await all(c.ref.collection("messages")) })),
          ),
        };
      }),
    ),
    dailyActivity: await all(root.collection("activity")),
    achievements: await all(root.collection("achievements")),
    quests: await all(root.collection("quests")),
    cheersReceived: await all(root.collection("cheers")),
    events: await all(root.collection("events")),
    pushDevices: (await pushTokens().where("userId", "==", userId).get()).docs.map((d) => ({
      userAgent: d.get("userAgent") ?? null,
      lastSeenAt: date(d.get("lastSeenAt"))?.toISOString() ?? null,
    })),
  };
}

/** Borra TODOS los datos de aplicación del usuario (el árbol users/{uid} y sus dispositivos). */
export async function deleteUserData(userId: string): Promise<void> {
  // Primero salir del grupo (el documento del grupo vive fuera del árbol del usuario).
  const gid = str((await userRef(userId).get()).get("groupId"));
  if (gid) await leaveGroup(userId, gid);
  await db().recursiveDelete(userRef(userId));
  const tokens = await pushTokens().where("userId", "==", userId).get();
  const batch = db().batch();
  for (const d of tokens.docs) batch.delete(d.ref);
  await batch.commit();
}
