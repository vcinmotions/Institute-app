import { getState } from "./subscription.service";
import { getTenantPrisma } from "../prisma-client/tenant-client";

/**
 * Simultaneous-login limit, counted institute-wide (all companies share one database).
 *
 * Each signed-in user holds one ActiveSession row. The app sends a heartbeat every
 * minute; a row with no heartbeat for SESSION_TIMEOUT_SECONDS is treated as gone, so
 * a crashed app, power cut or lost network can never keep a seat forever.
 */
type Db = ReturnType<typeof getTenantPrisma>;
export type SessionWho = { userType: string; userId: string | number; clientAdminId?: string | null };

export const SESSION_TIMEOUT_MS = (Number(process.env.SESSION_TIMEOUT_SECONDS) || 180) * 1000;

function limit(): number | null {
  const s = getState();
  return s.enforced && s.maxUsers ? s.maxUsers : null; // null = unlimited
}

const key = (w: SessionWho) => ({ userType_userId: { userType: String(w.userType), userId: String(w.userId) } });

/** Removes sessions that stopped sending heartbeats. */
export async function pruneSessions(db: Db) {
  await db.activeSession.deleteMany({ where: { lastSeenAt: { lt: new Date(Date.now() - SESSION_TIMEOUT_MS) } } });
}

export async function countActiveSessions(db: Db) {
  await pruneSessions(db);
  return db.activeSession.count();
}

/** Same check without registering (used before issuing a login token). */
export async function canClaimSession(db: Db, who: SessionWho): Promise<{ ok: boolean; max: number | null }> {
  const max = limit();
  if (max === null) return { ok: true, max };
  await pruneSessions(db);
  if (await db.activeSession.findUnique({ where: key(who) })) return { ok: true, max };
  return { ok: (await db.activeSession.count()) < max, max };
}

/** Registers or refreshes a session. Returns ok=false when a NEW user would exceed the limit. */
export async function claimSession(
  db: Db,
  who: SessionWho,
  deviceInfo?: string
): Promise<{ ok: boolean; max: number | null }> {
  const max = limit();
  await pruneSessions(db);
  const existing = await db.activeSession.findUnique({ where: key(who) });
  if (!existing && max !== null && (await db.activeSession.count()) >= max) return { ok: false, max };
  const clientAdminId = who.clientAdminId ?? "";
  if (existing) {
    await db.activeSession.update({
      where: key(who),
      data: { lastSeenAt: new Date(), ...(clientAdminId ? { clientAdminId } : {}) },
    });
  } else {
    await db.activeSession.create({
      data: {
        userType: String(who.userType),
        userId: String(who.userId),
        clientAdminId,
        deviceInfo: deviceInfo ?? null,
      },
    });
  }
  return { ok: true, max };
}

export async function releaseSession(db: Db, who: SessionWho) {
  await db.activeSession.deleteMany({ where: { userType: String(who.userType), userId: String(who.userId) } });
}

export const limitMessage = (max: number | null) =>
  `Login limit reached: your plan allows ${max} user(s) signed in at the same time. Ask someone to sign out, or upgrade your plan on the web portal.`;
