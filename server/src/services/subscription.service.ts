import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getUserDataPath } from "../middlewares/runtimePaths";

/**
 * Local (EXE) subscription store.
 *
 * The hosted web portal is the only place subscriptions are bought/renewed.
 * It returns a payload signed with its PRIVATE key; the EXE only knows the
 * PUBLIC key (SUBSCRIPTION_PUBLIC_KEY, base64 PEM). The signed record is kept in
 * the local data folder so the app keeps working offline. Editing the file
 * invalidates the signature; rolling the clock back is detected via lastSeenAt.
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
  issuedAt: string;
};

type StoredRecord = {
  payloadJson: string;
  signature: string;
  syncToken?: string;
  lastSyncAt?: string;
  lastSeenAt?: string;
  lastSeenMac?: string;
  settings?: Record<string, any>; // global settings from the SaaS admin (display only)
};

export type SubscriptionState = {
  enforced: boolean;
  status: string; // ACTIVE | EXPIRED | SUSPENDED | REVOKED | NOT_ACTIVATED | TAMPERED | CLOCK_TAMPERED | UNMANAGED
  locked: boolean;
  daysLeft: number | null;
  expiryDate: string | null;
  plan: string | null;
  lastSyncAt: string | null;
  renewUrl: string | null;
  message: string;
  settings: Record<string, any>;
};

const CLOCK_TOLERANCE_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const EXPIRED_MESSAGE =
  "Your software subscription has expired. The application is currently in View-Only Mode. Please renew your subscription through the web portal to restore full access.";

/** How often the server re-validates with the portal (minutes). Configurable via SUBSCRIPTION_SYNC_MINUTES. */
export const syncIntervalMs = () => {
  const m = Number(process.env.SUBSCRIPTION_SYNC_MINUTES);
  return (Number.isFinite(m) && m >= 1 ? m : 5) * 60 * 1000;
};

export const isEnforced = () => !!process.env.SUBSCRIPTION_API_URL;

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
    lastSyncAt: null,
    renewUrl: renewUrl(),
    settings: readRecord()?.settings ?? {},
    ...p,
  };
}

/** Computes the current state from local data only (works offline). */
export function getState(): SubscriptionState {
  if (!isEnforced()) {
    return {
      enforced: false,
      status: "UNMANAGED",
      locked: false,
      daysLeft: null,
      expiryDate: null,
      plan: null,
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
        message: "System date/time problem detected. Connect to the internet to re-validate.",
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
      message: "System date is earlier than the last time the app was used. Fix the date or go online.",
    });
  }
  if (now > lastSeen) {
    const iso = new Date(now).toISOString();
    try {
      writeRecord({ ...rec, lastSeenAt: iso, lastSeenMac: macOf(iso) });
    } catch {}
  }

  const expiry = Date.parse(payload.expiryDate);
  const daysLeft = Math.ceil((expiry - now) / DAY_MS);
  const base = {
    expiryDate: payload.expiryDate,
    plan: payload.plan,
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
      }),
      signal: ctrl.signal,
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body?.error || `Portal error ${res.status}` };

    const { payloadJson, signature, syncToken } = body;
    if (!payloadJson || !signature || !verify(payloadJson, signature)) {
      return { ok: false, error: "Invalid subscription response" };
    }
    const nowIso = new Date().toISOString();
    let seen = nowIso;
    if (rec?.lastSeenAt && rec.lastSeenMac === macOf(rec.lastSeenAt) && Date.parse(rec.lastSeenAt) > Date.now()) {
      seen = rec.lastSeenAt;
    }
    writeRecord({
      payloadJson,
      signature,
      syncToken: syncToken ?? rec?.syncToken,
      lastSyncAt: nowIso,
      lastSeenAt: seen,
      lastSeenMac: macOf(seen),
      settings: (await fetchGlobalSettings(api)) ?? rec?.settings,
    });
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
