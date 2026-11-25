import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { openSigned } from "./licenseCrypto";
import { getDeviceInfo, localMacKey } from "./device.service";
import { apiBase, buildConfigBroken, getMode } from "./buildConfig.service";
import { getLocalState } from "./localLicense.service";

/**
 * EXE activation (per PC).
 *
 * The portal returns a SIGNED licence bound to this PC's device id. It is checked with the
 * public key compiled into the app, so editing the stored file, the local database or .env
 * cannot create or extend a licence, and copying the file to another PC fails (device id).
 *
 * Standalone builds take their 364-day expiry from the signed licence (`validUntil`), so
 * deleting/restoring local files cannot restart the clock - re-activating returns the same
 * portal-computed date. Clock rollback is caught by a protected "last seen" high-water mark,
 * the licence's signed issue time, and file-timestamp evidence.
 */
export type ActivationLicense = {
  kind: "ACTIVATION";
  keyId: string;
  institute: string;
  company: string;
  deviceId: string;
  deviceName: string;
  activatedAt: string;
  validUntil: string;
  maxDevices: number;
  issuedAt: string;
  nonce?: string;
  role?: "SERVER";
  companyId?: string | null;
  /** Hash of the company's Client key; client PCs are confirmed against this offline. */
  clientKeyId?: string | null;
  clientKeyHash?: string | null;
};

type Stored = {
  payloadJson: string;
  signature: string;
  lastVerifiedAt?: string; // local time of last successful online verification
  revokedAt?: string; // portal said this PC was deactivated
  revokedMac?: string;
  lastSeenAt?: string;
  lastSeenMac?: string;
};

export type ActivationStatus =
  | "UNMANAGED"
  | "ACTIVATED"
  | "NOT_ACTIVATED"
  | "DEACTIVATED"
  | "INVALID"
  | "CLOCK_TAMPERED"
  | "BUILD_INVALID";

export type ActivationState = {
  required: boolean;
  status: ActivationStatus;
  /** App cannot be used at all until fixed (activation needed). */
  blocked: boolean;
  /** Read-only: licence ended or clock problem. */
  viewOnly: boolean;
  message: string;
  deviceId: string | null;
  institute: string | null;
  company: string | null;
  activatedAt: string | null;
  validUntil: string | null;
  daysLeft: number | null;
  lastVerifiedAt: string | null;
  keyId: string | null;
};

const DAY = 24 * 60 * 60 * 1000;
const CLOCK_TOLERANCE_MS = 10 * 60 * 1000;
const file = () => path.join(getUserDataPath(), "data", "activation.json");
const mac = (v: string) => crypto.createHmac("sha256", localMacKey()).update(v).digest("hex");

function read(): Stored | null {
  try {
    return JSON.parse(fs.readFileSync(file(), "utf8"));
  } catch {
    return null;
  }
}
function write(r: Stored) {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify(r), "utf8");
}

const empty = (p: Partial<ActivationState> & Pick<ActivationState, "status" | "blocked" | "viewOnly" | "message">): ActivationState => ({
  required: true, deviceId: getDeviceInfo().deviceId, institute: null, company: null, activatedAt: null,
  validUntil: null, daysLeft: null, lastVerifiedAt: null, keyId: null, ...p,
});

export { newestFileEvidenceMs } from "./clockEvidence";
import { newestFileEvidenceMs } from "./clockEvidence";

export function getActivationState(nowMs: number = Date.now()): ActivationState {
  const broken = buildConfigBroken();
  if (broken) {
    return empty({ status: "BUILD_INVALID", blocked: true, viewOnly: true, message: `${broken} Reinstall the application.` });
  }
  const mode = getMode();
  if (!mode) {
    return { ...empty({ status: "UNMANAGED", blocked: false, viewOnly: false, message: "Licensing is not enabled." }), required: false };
  }

  // Local mode (anything but ENABLED): no keys at all. The app is valid for a fixed number of months from its first run.
  if (mode === "STANDALONE") return getLocalState(nowMs);

  const rec = read();
  if (!rec) {
    return empty({ status: "NOT_ACTIVATED", blocked: true, viewOnly: true, message: "Enter your activation key to activate this PC." });
  }
  const lic = openSigned<ActivationLicense>("ACTIVATION", rec.payloadJson, rec.signature);
  if (!lic || lic.deviceId !== getDeviceInfo().deviceId) {
    return empty({ status: "INVALID", blocked: true, viewOnly: true, message: "The activation data is invalid for this PC. Activate again with your key." });
  }
  const base = {
    institute: lic.institute, company: lic.company, activatedAt: lic.activatedAt, validUntil: lic.validUntil,
    lastVerifiedAt: rec.lastVerifiedAt ?? null, keyId: lic.keyId,
  };

  if (rec.revokedAt && rec.revokedMac === mac(`revoked:${lic.keyId}:${rec.revokedAt}`)) {
    return empty({ ...base, status: "DEACTIVATED", blocked: true, viewOnly: true, message: "This PC has been deactivated by your Super Admin. Contact them to reassign the activation." });
  }

  // ---- clock rollback protection ----
  let lastSeen = 0;
  if (rec.lastSeenAt) {
    if (rec.lastSeenMac !== mac(`seen:${rec.lastSeenAt}`)) lastSeen = Number.POSITIVE_INFINITY; // tampered
    else lastSeen = Date.parse(rec.lastSeenAt) || 0;
  }
  const issued = Date.parse(lic.issuedAt) || 0; // signed server time: "now" can never be earlier than this
  const evidence = newestFileEvidenceMs();
  const rolledBack =
    nowMs + CLOCK_TOLERANCE_MS < lastSeen ||
    nowMs + CLOCK_TOLERANCE_MS < issued ||
    (evidence > nowMs + 2 * DAY && evidence > lastSeen + 2 * DAY);
  if (rolledBack) {
    return empty({ ...base, status: "CLOCK_TAMPERED", blocked: false, viewOnly: true, message: "The date/time on this computer is incorrect. Set the correct date and time (and connect to the internet to re-validate)." });
  }
  if (nowMs > lastSeen) {
    const iso = new Date(nowMs).toISOString();
    try { write({ ...rec, lastSeenAt: iso, lastSeenMac: mac(`seen:${iso}`) }); } catch { /* read-only disk */ }
  }

  // Keyed mode: expiry is the portal subscription (see subscription.service); the licence only proves this PC is registered.
  return empty({ ...base, status: "ACTIVATED", blocked: false, viewOnly: false, daysLeft: null, message: "Activated." });
}

// ---------------- talking to the portal ----------------

async function post(pathname: string, body: any): Promise<{ ok: boolean; status: number; data: any }> {
  const api = apiBase();
  if (!api) return { ok: false, status: 0, data: { error: "The portal address is not configured in this build." } };
  try {
    const res = await fetch(`${api}${pathname}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-APP": "vcinmotions-desktop" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
  } catch {
    return { ok: false, status: 0, data: { error: "Cannot reach the portal. Check your internet connection and try again." } };
  }
}

/** Accepts a portal-signed licence for THIS PC only. Used by online activation and the offline "apply licence" path. */
export function storeLicense(payloadJson: string, signature: string, nonce?: string): { ok: boolean; error?: string } {
  const lic = openSigned<ActivationLicense>("ACTIVATION", payloadJson, signature);
  if (!lic) return { ok: false, error: "This licence is not valid." };
  if (lic.deviceId !== getDeviceInfo().deviceId) return { ok: false, error: "This licence was issued for a different PC." };
  if (nonce !== undefined && lic.nonce !== nonce) return { ok: false, error: "Invalid response from the portal." };
  const prev = read();
  const prevLic = prev ? openSigned<ActivationLicense>("ACTIVATION", prev.payloadJson, prev.signature) : null;
  if (prevLic && prevLic.keyId === lic.keyId && Date.parse(lic.issuedAt) < Date.parse(prevLic.issuedAt)) {
    return { ok: false, error: "This licence is older than the one already installed." };
  }
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const issued = Date.parse(lic.issuedAt) || nowMs; // trusted portal time
  // High-water mark of "latest time we have seen". A healthy local clock (agrees with the portal) is
  // true time; a wrong one never lowers the mark and is flagged by getActivationState().
  const prevSeen = prev?.lastSeenAt && prev.lastSeenMac === mac(`seen:${prev.lastSeenAt}`) ? Date.parse(prev.lastSeenAt) || 0 : 0;
  const prevOk = prevSeen && prevSeen <= issued + CLOCK_TOLERANCE_MS ? prevSeen : 0;
  const seenMs = Math.max(issued, prevOk, Math.abs(nowMs - issued) <= CLOCK_TOLERANCE_MS ? nowMs : 0);
  const seen = new Date(seenMs).toISOString();
  write({
    payloadJson, signature,
    lastVerifiedAt: nowIso,
    lastSeenAt: seen, lastSeenMac: mac(`seen:${seen}`),
  });
  return { ok: true };
}

export async function activateWithKey(key: string): Promise<{ ok: boolean; error?: string; reason?: string }> {
  const dev = getDeviceInfo();
  const nonce = crypto.randomBytes(16).toString("hex");
  const r = await post("/api/activation/activate", { key: String(key).trim(), ...dev, nonce });
  if (!r.ok) return { ok: false, error: r.data?.error || `Portal error ${r.status}`, reason: r.data?.reason };
  const stored = storeLicense(r.data.payloadJson, r.data.signature, nonce);
  return stored.ok ? { ok: true } : stored;
}

/** Re-checks this PC with the portal (picks up renewals; detects deactivation). Safe to call often. */
export async function verifyWithPortal(): Promise<{ ok: boolean; error?: string }> {
  const rec = read();
  const lic = rec ? openSigned<ActivationLicense>("ACTIVATION", rec.payloadJson, rec.signature) : null;
  if (!rec || !lic) return { ok: false, error: "Not activated" };
  const nonce = crypto.randomBytes(16).toString("hex");
  const r = await post("/api/activation/verify", { keyId: lic.keyId, deviceId: lic.deviceId, nonce });
  if (r.ok) return storeLicense(r.data.payloadJson, r.data.signature, nonce);
  if (r.status === 403 || r.status === 404) {
    const at = new Date().toISOString();
    write({ ...rec, revokedAt: at, revokedMac: mac(`revoked:${lic.keyId}:${at}`) });
    return { ok: false, error: r.data?.error };
  }
  return { ok: false, error: r.data?.error }; // offline: keep working with the stored licence
}

/** The verified licence of this server, or null (never trust anything stored next to it). */
export function readLicenseInfo(): ActivationLicense | null {
  const rec = read();
  if (!rec) return null;
  const lic = openSigned<ActivationLicense>("ACTIVATION", rec.payloadJson, rec.signature);
  return lic && lic.deviceId === getDeviceInfo().deviceId ? lic : null;
}

export type ClaimResult = {
  ok: boolean; error?: string; reason?: string;
  serverKey?: string; clientKey?: string; company?: { id: string; name: string; instituteName: string };
};

/**
 * First-time server setup: the portal registers THIS PC on the chosen company's Server key and returns the signed
 * licence together with the company's Server key and Client key.
 */
export async function claimServerFromPortal(args: { email: string; password: string; companyId: string }): Promise<ClaimResult> {
  const nonce = crypto.randomBytes(16).toString("hex");
  const r = await post("/api/activation/claim-server", { ...args, ...getDeviceInfo(), nonce });
  if (!r.ok) return { ok: false, error: r.data?.error || `Portal error ${r.status}`, reason: r.data?.reason };
  const stored = storeLicense(r.data.payloadJson, r.data.signature, nonce);
  if (!stored.ok) return { ok: false, error: stored.error };
  return { ok: true, serverKey: r.data.serverKey, clientKey: r.data.clientKey, company: r.data.company };
}
