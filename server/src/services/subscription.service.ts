import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import { getUserDataPath } from "../middlewares/runtimePaths";

/**
 * Local (EXE) subscription store.
 *
 * The hosted web portal is the only place subscriptions are bought/renewed.
 * It returns a payload signed with its PRIVATE key; the EXE only knows the
 * PUBLIC key (SUBSCRIPTION_PUBLIC_KEY, base64 PEM). The signed record is kept in
 * the local data folder so the app keeps working offline. Editing the file
 * invalidates the signature. Changing the PC date/time cannot extend a
 * subscription:
 *  - online: every sync compares the PC clock with the portal's signed server
 *    time (payload.issuedAt, bound to a one-time nonce so it cannot be
 *    replayed). A clock that differs by more than the tolerance locks the app
 *    until it is corrected.
 *  - offline: a protected "last seen" high-water mark catches a clock set
 *    earlier than the app has already seen, and the newest file timestamp in
 *    the temp/app folders catches rollbacks past the last time the app ran.
 * Limit: a PC that is kept offline AND frozen at one date cannot be detected
 * by any software; it is blocked again at the next online sync.
 *
 * Enforcement is OFF when SUBSCRIPTION_API_URL is not configured (dev / legacy).
 */

export type SubscriptionPayload = {
  clientId: string;
  email: string;
  plan: "SIX_MONTH" | "ONE_YEAR" | string;
  startDate: string;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "REVOKED";
  maxUsers?: number; // max simultaneous logins
  issuedAt: string; // portal (server) time when signed - the trusted clock
  nonce?: string; // echo of the EXE one-time request nonce (anti-replay)
};

type StoredRecord = {
  payloadJson: string;
  signature: string;
  syncToken?: string;
  lastSyncAt?: string;
  lastSeenAt?: string;
  lastSeenMac?: string;
  clockFlag?: "OK" | "BAD"; // result of the last server-time comparison
  evidenceFloor?: number; // newest file timestamp seen when the clock was last verified online
  clockMac?: string; // HMAC over clockFlag + evidenceFloor
  settings?: Record<string, any>; // global settings from the SaaS admin (display only)
};

export type SubscriptionState = {
  enforced: boolean;
  status: string; // ACTIVE | EXPIRED | SUSPENDED | REVOKED | NOT_ACTIVATED | TAMPERED | CLOCK_TAMPERED | UNMANAGED
  locked: boolean;
  daysLeft: number | null;
  expiryDate: string | null;
  plan: string | null;
  maxUsers: number | null;
  lastSyncAt: string | null;
  renewUrl: string | null;
  message: string;
  settings: Record<string, any>;
  demo?: boolean; // true in the demo build (the UI hides all subscription screens)
};

const CLOCK_TOLERANCE_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
// A file stamped further in the future than this proves the clock was set back.
const EVIDENCE_TOLERANCE_MS = 2 * DAY_MS;
const CLOCK_MESSAGE =
  "The date/time on this computer is incorrect. Set the correct date and time, then connect to the internet to re-validate.";

export const EXPIRED_MESSAGE =
  "Your software subscription has expired. The application is currently in View-Only Mode. Please renew your subscription through the web portal to restore full access.";

/** How often the server re-validates with the portal (minutes). Configurable via SUBSCRIPTION_SYNC_MINUTES. */
export const syncIntervalMs = () => {
  const m = Number(process.env.SUBSCRIPTION_SYNC_MINUTES);
  return (Number.isFinite(m) && m >= 1 ? m : 5) * 60 * 1000;
};

/**
 * DEMO build: no portal, no signed licence. The first launch starts a fixed 365-day
 * period kept in a protected local file; afterwards the app is view-only as usual.
 * The same clock-rollback protection as the normal build stays active.
 */
export const isDemo = () => process.env.DEMO_MODE === "1";
const DEMO_DAYS = 365;

// Portal checks never run in the demo build.
export const isEnforced = () => !isDemo() && !!process.env.SUBSCRIPTION_API_URL;

const filePath = () => path.join(getUserDataPath(), "data", "subscription.json");

const hmacKey = () => process.env.JWT_SECRET || "vc-inmotions";
const macOf = (v: string) =>
  crypto.createHmac("sha256", hmacKey()).update(v).digest("hex");

function toPem(v: string) {
  return v.includes("BEGIN")
    ? v.replace(/\\n/g, "\n")
    : Buffer.from(v, "base64").toString("utf8");
}

function publicKey(): crypto.KeyObject | null {
  const v = process.env.SUBSCRIPTION_PUBLIC_KEY;
  if (!v) return null;
  try {
    return crypto.createPublicKey(toPem(v));
  } catch {
    return null;
  }
}

function readRecord(): StoredRecord | null {
  try {
    return JSON.parse(fs.readFileSync(filePath(), "utf8"));
  } catch {
    return null;
  }
}

function writeRecord(r: StoredRecord) {
  const p = filePath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(r), "utf8");
}

function verify(payloadJson: string, signature: string): boolean {
  const key = publicKey();
  if (!key) return false;
  try {
    return crypto.verify(null, Buffer.from(payloadJson), key, Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}

export function renewUrl(): string | null {
  const base = process.env.SUBSCRIPTION_PORTAL_URL;
  return base ? `${base.replace(/\/$/, "")}/subscription?renew=1` : null;
}

function state(
  p: Partial<SubscriptionState> & { status: string; locked: boolean; message: string }
): SubscriptionState {
  return {
    enforced: true,
    daysLeft: null,
    expiryDate: null,
    plan: null,
    maxUsers: null,
    lastSyncAt: null,
    renewUrl: renewUrl(),
    settings: readRecord()?.settings ?? {},
    ...p,
  };
}


const clockMacOf = (flag: string, floor: number) => macOf(`clock:${flag}:${floor}`);

/**
 * Newest file timestamp in the temp folder and the app data folder. The OS stamps
 * these with the real clock whenever anything is written, so a value far ahead of
 * "now" means the clock was moved back after the PC (or app) was used.
 * Cached for 5 minutes; set SUBSCRIPTION_FILE_CLOCK_CHECK=off to disable.
 */
let evidenceCache: { at: number; val: number } | null = null;
function newestEvidenceMs(): number {
  if (process.env.SUBSCRIPTION_FILE_CLOCK_CHECK === "off") return 0;
  const t = Date.now();
  if (evidenceCache && t >= evidenceCache.at && t - evidenceCache.at < 5 * 60 * 1000) return evidenceCache.val;
  let newest = 0;
  const dirs = [os.tmpdir(), getUserDataPath(), path.join(getUserDataPath(), "data")];
  for (const dir of dirs) {
    try {
      const names = fs.readdirSync(dir).slice(0, 1500);
      for (const n of names) {
        try {
          const m = fs.statSync(path.join(dir, n)).mtimeMs;
          if (m > newest) newest = m;
        } catch {}
      }
    } catch {}
  }
  evidenceCache = { at: t, val: newest };
  return newest;
}

function validRecordLastSeen(rec: StoredRecord | null): number {
  if (!rec?.lastSeenAt || rec.lastSeenMac !== macOf(rec.lastSeenAt)) return 0;
  return Date.parse(rec.lastSeenAt) || 0;
}

const demoFilePath = () => path.join(getUserDataPath(), "data", "demo-license.json");
type DemoRecord = { startedAt: string; startedMac: string; lastSeenAt: string; lastSeenMac: string };

function readDemo(): DemoRecord | null {
  try {
    return JSON.parse(fs.readFileSync(demoFilePath(), "utf8"));
  } catch {
    return null;
  }
}

function writeDemo(r: DemoRecord) {
  const p = demoFilePath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(r), "utf8");
}

function demoState(): SubscriptionState {
  const base = { enforced: true, demo: true, plan: "DEMO", maxUsers: null, lastSyncAt: null, renewUrl: null, settings: {} };
  const locked = (status: string, message: string, extra: Partial<SubscriptionState> = {}): SubscriptionState => ({
    ...base, status, locked: true, daysLeft: 0, expiryDate: null, message, ...extra,
  });
  const now = Date.now();

  let rec = readDemo();
  if (!rec) {
    // First launch: start the 365 days now.
    const iso = new Date(now).toISOString();
    rec = { startedAt: iso, startedMac: macOf(`demo:${iso}`), lastSeenAt: iso, lastSeenMac: macOf(iso) };
    try { writeDemo(rec); } catch {}
  }

  if (rec.startedMac !== macOf(`demo:${rec.startedAt}`) || rec.lastSeenMac !== macOf(rec.lastSeenAt)) {
    return locked("TAMPERED", "Demo licence data is invalid. The application is in View-Only Mode.");
  }
  const started = Date.parse(rec.startedAt);
  const lastSeen = Date.parse(rec.lastSeenAt);
  if (!Number.isFinite(started) || !Number.isFinite(lastSeen)) {
    return locked("TAMPERED", "Demo licence data is invalid. The application is in View-Only Mode.");
  }
  const expiry = started + DEMO_DAYS * DAY_MS;
  const expiryDate = new Date(expiry).toISOString();

  // Clock rollback guards (same rules as the normal build).
  const newest = newestEvidenceMs();
  if (now + CLOCK_TOLERANCE_MS < lastSeen || newest > now + EVIDENCE_TOLERANCE_MS) {
    return locked("CLOCK_TAMPERED", CLOCK_MESSAGE, { expiryDate });
  }
  if (now > lastSeen) {
    const iso = new Date(now).toISOString();
    try { writeDemo({ ...rec, lastSeenAt: iso, lastSeenMac: macOf(iso) }); } catch {}
  }

  const daysLeft = Math.ceil((expiry - now) / DAY_MS);
  if (!(expiry > now)) {
    return locked("EXPIRED", "The demo period has ended. The application is now in View-Only Mode.", { expiryDate });
  }
  return { ...base, status: "ACTIVE", locked: false, daysLeft, expiryDate, message: `${daysLeft} day(s) left.` };
}

/** Computes the current state from local data only (works offline). */
export function getState(): SubscriptionState {
  if (isDemo()) return demoState();
  if (!isEnforced()) {
    return {
      enforced: false,
      status: "UNMANAGED",
      locked: false,
      daysLeft: null,
      expiryDate: null,
      plan: null,
      maxUsers: null,
      lastSyncAt: null,
      renewUrl: null,
      settings: {},
      message: "Subscription checks are not enabled.",
    };
  }

  const rec = readRecord();
  if (!rec) {
    return state({
      status: "NOT_ACTIVATED",
      locked: true,
      message: "Subscription not activated. Connect to the internet and sign in to activate.",
    });
  }

  if (!verify(rec.payloadJson, rec.signature)) {
    return state({
      status: "TAMPERED",
      locked: true,
      message: "Subscription data is invalid. Connect to the internet to refresh it.",
    });
  }

  const payload = JSON.parse(rec.payloadJson) as SubscriptionPayload;
  const now = Date.now();

  // Clock rollback guard (lastSeenAt is HMAC-protected).
  let lastSeen = 0;
  if (rec.lastSeenAt) {
    if (rec.lastSeenMac !== macOf(rec.lastSeenAt)) {
      return state({
        status: "CLOCK_TAMPERED",
        locked: true,
        message: CLOCK_MESSAGE,
      });
    }
    lastSeen = Date.parse(rec.lastSeenAt) || 0;
  }
  if (now + CLOCK_TOLERANCE_MS < lastSeen) {
    return state({
      status: "CLOCK_TAMPERED",
      locked: true,
      expiryDate: payload.expiryDate,
      plan: payload.plan,
      message: CLOCK_MESSAGE,
    });
  }
  if (now > lastSeen) {
    const iso = new Date(now).toISOString();
    try {
      writeRecord({ ...rec, lastSeenAt: iso, lastSeenMac: macOf(iso) });
    } catch {}
  }

  // Last online check found the PC clock different from the portal's clock.
  const flagOk = !rec.clockFlag || rec.clockMac === clockMacOf(rec.clockFlag, rec.evidenceFloor ?? 0);
  if (!flagOk || rec.clockFlag === "BAD") {
    return state({
      status: "CLOCK_TAMPERED",
      locked: true,
      expiryDate: payload.expiryDate,
      plan: payload.plan,
      message: CLOCK_MESSAGE,
    });
  }

  // Files stamped in the future prove the clock was moved back (offline rollback).
  const evidence = newestEvidenceMs();
  const floor = rec.clockFlag ? rec.evidenceFloor ?? 0 : 0;
  if (evidence > now + EVIDENCE_TOLERANCE_MS && evidence > floor + EVIDENCE_TOLERANCE_MS) {
    return state({
      status: "CLOCK_TAMPERED",
      locked: true,
      expiryDate: payload.expiryDate,
      plan: payload.plan,
      message: CLOCK_MESSAGE,
    });
  }

  const expiry = Date.parse(payload.expiryDate);
  const daysLeft = Math.ceil((expiry - now) / DAY_MS);
  const base = {
    expiryDate: payload.expiryDate,
    plan: payload.plan,
    maxUsers: payload.maxUsers ?? null,
    lastSyncAt: rec.lastSyncAt ?? null,
  };

  if (payload.status !== "ACTIVE") {
    return state({
      ...base,
      status: payload.status,
      locked: true,
      daysLeft: Math.max(daysLeft, 0),
      message: payload.status === "EXPIRED" ? EXPIRED_MESSAGE : `Your software subscription is ${payload.status.toLowerCase()}. The application is currently in View-Only Mode. Please contact support or renew through the web portal to restore full access.`,
    });
  }
  if (!(expiry > now)) {
    return state({
      ...base,
      status: "EXPIRED",
      locked: true,
      daysLeft: 0,
      message: EXPIRED_MESSAGE,
    });
  }
  return state({
    ...base,
    status: "ACTIVE",
    locked: false,
    daysLeft,
    message: `${daysLeft} day(s) left.`,
  });
}

/**
 * Asks the hosted portal for the latest signed subscription and stores it.
 * `credentials` are needed only for the first activation; later syncs use the
 * syncToken returned by the portal.
 */
export async function syncFromCloud(credentials?: {
  email: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  const api = process.env.SUBSCRIPTION_API_URL;
  if (!api) return { ok: true };

  const rec = readRecord();
  let email = credentials?.email;
  if (!email && rec) {
    try {
      email = (JSON.parse(rec.payloadJson) as SubscriptionPayload).email;
    } catch {}
  }
  if (!email) return { ok: false, error: "No account to sync" };

  const nonce = crypto.randomBytes(16).toString("hex"); // one-time: the signed reply must echo it
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${api.replace(/\/$/, "")}/api/subscription/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-APP": "vcinmotions-desktop" },
      body: JSON.stringify({
        email,
        password: credentials?.password,
        syncToken: rec?.syncToken,
        nonce,
      }),
      signal: ctrl.signal,
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body?.error || `Portal error ${res.status}` };

    const { payloadJson, signature, syncToken } = body;
    if (!payloadJson || !signature || !verify(payloadJson, signature)) {
      return { ok: false, error: "Invalid subscription response" };
    }
    // Reject a replayed / stale reply, and use the portal's signed time as the trusted clock.
    const signed = JSON.parse(payloadJson) as SubscriptionPayload;
    const serverMs = Date.parse(signed.issuedAt);
    if (signed.nonce !== nonce || !Number.isFinite(serverMs)) {
      return { ok: false, error: "Invalid subscription response" };
    }
    const localMs = Date.now();
    const clockOk = Math.abs(localMs - serverMs) <= CLOCK_TOLERANCE_MS;
    const prevSeen = validRecordLastSeen(rec);

    // Healthy clock: high-water mark = true time (a stale "future" mark from an earlier wrong
    // clock is discarded). Bad clock: never move it down, and lock until the clock is fixed.
    const seenMs = clockOk
      ? Math.max(serverMs, localMs, prevSeen && prevSeen <= serverMs + CLOCK_TOLERANCE_MS ? prevSeen : 0)
      : Math.max(prevSeen, serverMs);
    const seen = new Date(seenMs).toISOString();
    evidenceCache = null;
    const floor = clockOk ? newestEvidenceMs() : rec?.evidenceFloor ?? 0;
    const flag: "OK" | "BAD" = clockOk ? "OK" : "BAD";
    const nowIso = new Date(localMs).toISOString();
    writeRecord({
      payloadJson,
      signature,
      syncToken: syncToken ?? rec?.syncToken,
      lastSyncAt: nowIso,
      lastSeenAt: seen,
      lastSeenMac: macOf(seen),
      clockFlag: flag,
      evidenceFloor: floor,
      clockMac: clockMacOf(flag, floor),
      settings: (await fetchGlobalSettings(api)) ?? rec?.settings,
    });
    if (!clockOk) return { ok: false, error: CLOCK_MESSAGE };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.name === "AbortError" ? "Portal timed out" : "Offline" };
  } finally {
    clearTimeout(timer);
  }
}

/** Global settings set by the SaaS admin; best-effort, kept for offline use. */
async function fetchGlobalSettings(api: string): Promise<Record<string, any> | null> {
  try {
    const r = await fetch(`${api.replace(/\/$/, "")}/api/app-settings`, {
      signal: AbortSignal.timeout(5000),
    });
    return r.ok ? ((await r.json()) as Record<string, any>) : null;
  } catch {
    return null;
  }
}

/** For the HOSTED portal: signs a payload with the private key. */
export function signPayload(payload: SubscriptionPayload) {
  const v = process.env.SUBSCRIPTION_PRIVATE_KEY;
  if (!v) throw new Error("SUBSCRIPTION_PRIVATE_KEY not set");
  const payloadJson = JSON.stringify(payload);
  const signature = crypto
    .sign(null, Buffer.from(payloadJson), crypto.createPrivateKey(toPem(v)))
    .toString("base64");
  return { payloadJson, signature };
}
