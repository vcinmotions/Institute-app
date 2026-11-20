import { getState } from "./subscription.service";

/**
 * Simultaneous-login limit. One slot per signed-in user (single-device login means
 * a user never holds two). A slot is freed when the user is idle for IDLE_MS.
 * Kept in memory on the server that serves the app; a restart simply re-registers
 * active users on their next request.
 */
const IDLE_MS = (Number(process.env.SESSION_IDLE_MINUTES) || 30) * 60 * 1000;
const slots = new Map<string, number>(); // "tenant:userType:id" -> lastSeen

const tenantOf = (key: string) => key.split(":")[0];

function prune(now: number) {
  for (const [k, t] of slots) if (now - t > IDLE_MS) slots.delete(k);
}

function limit(): number | null {
  const s = getState();
  return s.enforced && s.maxUsers ? s.maxUsers : null; // null = unlimited
}

export const sessionKey = (tenantId: string, userType: string, id: string | number) =>
  `${tenantId}:${userType}:${id}`;

/** Returns false (and does not register) when the limit is reached for a new user. */
export function claimSession(key: string): { ok: boolean; max: number | null } {
  const now = Date.now();
  prune(now);
  const max = limit();
  if (slots.has(key) || max === null) {
    slots.set(key, now);
    return { ok: true, max };
  }
  const used = [...slots.keys()].filter((k) => tenantOf(k) === tenantOf(key)).length;
  if (used >= max) return { ok: false, max };
  slots.set(key, now);
  return { ok: true, max };
}

/** Same check without registering (used before issuing a login token). */
export function canClaimSession(key: string): { ok: boolean; max: number | null } {
  const now = Date.now();
  prune(now);
  const max = limit();
  if (slots.has(key) || max === null) return { ok: true, max };
  const used = [...slots.keys()].filter((k) => tenantOf(k) === tenantOf(key)).length;
  return { ok: used < max, max };
}

export function releaseSession(key: string) {
  slots.delete(key);
}

export const limitMessage = (max: number | null) =>
  `Login limit reached: your plan allows ${max} user(s) signed in at the same time. Ask someone to sign out, or upgrade your plan on the web portal.`;
