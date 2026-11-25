import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { localMacKey, getDeviceInfo } from "./device.service";
import { localMonths } from "./buildConfig.service";
import { openSigned } from "./licenseCrypto";
import { newestFileEvidenceMs } from "./clockEvidence";
import type { ActivationState } from "./activation.service";

/**
 * LOCAL MODE (anything but SUBSCRIPTION_MODE=ENABLED): no Server key, no Client key, no portal.
 * The application is valid for LOCAL_LICENSE_MONTHS (default 6) from its first run, then becomes view-only
 * until renewed with a portal-signed renewal code (works offline, one use per code).
 *
 * The start date is kept in two places (app data + ProgramData) and protected with a PC-bound HMAC, so deleting one
 * copy does not restart the clock and editing a date invalidates it. The clock-rollback checks are the same as for
 * the keyed mode. Limit: someone who deletes BOTH copies, or controls the PC completely, can restart the period -
 * no offline software can prevent that.
 */
type Rec = { startedAt: string; validUntil: string; months: number; applied: string[]; lastSeenAt: string; mac: string };

const DAY = 24 * 60 * 60 * 1000;
const TOL = 10 * 60 * 1000;

const paths = () => {
  const list = [path.join(getUserDataPath(), "data", "local-license.json")];
  const pd = process.env.PROGRAMDATA;
  if (pd) list.push(path.join(pd, "VC-Inmotions", "local-license.json"));
  return list;
};

const macOf = (r: Omit<Rec, "mac">) =>
  crypto.createHmac("sha256", localMacKey()).update([r.startedAt, r.validUntil, r.months, r.applied.join(","), r.lastSeenAt].join("|")).digest("hex");

export function addMonths(d: Date, m: number): Date {
  const x = new Date(d.getTime());
  x.setUTCMonth(x.getUTCMonth() + m);
  return x;
}

type One = { kind: "MISSING" } | { kind: "INVALID" } | { kind: "OK"; rec: Rec };
function readOne(p: string): One {
  let raw: string;
  try { raw = fs.readFileSync(p, "utf8"); } catch { return { kind: "MISSING" }; }
  try {
    const r = JSON.parse(raw) as Rec;
    const { mac, ...rest } = r;
    const ok = typeof mac === "string" && Array.isArray(r.applied) && Number.isFinite(Date.parse(r.startedAt)) && Number.isFinite(Date.parse(r.validUntil))
      && mac === macOf(rest);
    return ok ? { kind: "OK", rec: r } : { kind: "INVALID" };
  } catch {
    return { kind: "INVALID" };
  }
}

function writeAll(r: Omit<Rec, "mac">) {
  const rec: Rec = { ...r, mac: macOf(r) };
  for (const p of paths()) {
    try {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify(rec), "utf8");
    } catch { /* e.g. no rights on ProgramData: the other copy still protects us */ }
  }
  return rec;
}

/** Reads both copies and merges them (earliest start, latest end, latest lastSeen). Creates the record on first run. */
function load(nowMs: number): { rec: Rec | null; tampered: boolean } {
  const found = paths().map(readOne);
  const valid = found.filter((f): f is { kind: "OK"; rec: Rec } => f.kind === "OK").map((f) => f.rec);
  if (valid.length === 0) {
    if (found.some((f) => f.kind === "INVALID")) return { rec: null, tampered: true }; // present but edited: never reset
    const months = localMonths();
    const started = new Date(nowMs);
    const rec = writeAll({ startedAt: started.toISOString(), validUntil: addMonths(started, months).toISOString(), months, applied: [], lastSeenAt: started.toISOString() });
    return { rec, tampered: false };
  }
  const merged = {
    startedAt: valid.map((r) => r.startedAt).sort()[0],
    validUntil: valid.map((r) => r.validUntil).sort().slice(-1)[0],
    months: valid[0].months,
    applied: Array.from(new Set(valid.flatMap((r) => r.applied))).slice(-50),
    lastSeenAt: valid.map((r) => r.lastSeenAt).sort().slice(-1)[0],
  };
  // Heal a missing / damaged copy from the good one.
  if (found.some((f) => f.kind !== "OK") || valid.some((r) => r.validUntil !== merged.validUntil || r.lastSeenAt !== merged.lastSeenAt)) {
    return { rec: writeAll(merged), tampered: false };
  }
  return { rec: valid[0], tampered: false };
}

const base = (p: Partial<ActivationState> & Pick<ActivationState, "status" | "viewOnly" | "message">): ActivationState => ({
  required: false, blocked: false, deviceId: getDeviceInfo().deviceId, institute: null, company: null,
  activatedAt: null, validUntil: null, daysLeft: null, lastVerifiedAt: null, keyId: null, ...p,
});

export function getLocalState(nowMs: number = Date.now()): ActivationState {
  const { rec, tampered } = load(nowMs);
  if (tampered || !rec) {
    return base({ status: "INVALID", viewOnly: true, message: "The licence data on this PC was modified, so the application is in View-Only Mode. Contact support." });
  }
  const lastSeen = Date.parse(rec.lastSeenAt) || 0;
  const evidence = newestFileEvidenceMs();
  const rolledBack = nowMs + TOL < lastSeen || (evidence > nowMs + 2 * DAY && evidence > lastSeen + 2 * DAY);
  const until = Date.parse(rec.validUntil);
  const common = { activatedAt: rec.startedAt, validUntil: rec.validUntil };

  if (rolledBack) {
    return base({ ...common, status: "CLOCK_TAMPERED", viewOnly: true, daysLeft: Math.max(0, Math.ceil((until - lastSeen) / DAY)), message: "The date/time on this computer is incorrect. Set the correct date and time." });
  }
  if (nowMs > lastSeen) {
    const iso = new Date(nowMs).toISOString();
    const { mac, ...rest } = rec;
    try { writeAll({ ...rest, lastSeenAt: iso }); } catch { /* ignore */ }
  }
  const daysLeft = Math.ceil((until - nowMs) / DAY);
  if (!(until > nowMs)) {
    return base({ ...common, status: "ACTIVATED", viewOnly: true, daysLeft: 0, message: "This licence period has ended. The application is in View-Only Mode. Ask your provider for a renewal code to restore full access." });
  }
  return base({ ...common, status: "ACTIVATED", viewOnly: false, daysLeft, message: `${daysLeft} day(s) left on the licence.` });
}

type RenewalPayload = { kind: "LOCAL_RENEWAL"; deviceId: string; months: number; issuedAt: string; nonce: string };

/** Applies a portal-signed renewal code (offline, once). The new end date counts from the later of the old end and the code's signed issue date. */
export function applyLocalRenewal(code: string): { ok: boolean; error?: string } {
  let doc: { payloadJson: string; signature: string };
  try {
    doc = JSON.parse(Buffer.from(String(code).trim(), "base64").toString("utf8"));
  } catch {
    return { ok: false, error: "That renewal code is not valid." };
  }
  const p = openSigned<RenewalPayload>("LOCAL_RENEWAL", doc?.payloadJson, doc?.signature);
  if (!p) return { ok: false, error: "That renewal code is not valid." };
  if (p.deviceId !== getDeviceInfo().deviceId) return { ok: false, error: "This renewal code was issued for a different PC." };
  const months = Number(p.months);
  if (!Number.isInteger(months) || months < 1 || months > 60) return { ok: false, error: "That renewal code is not valid." };

  const { rec, tampered } = load(Date.now());
  if (tampered || !rec) return { ok: false, error: "The local licence data was modified; contact support." };
  if (rec.applied.includes(p.nonce)) return { ok: false, error: "This renewal code was already used." };
  const from = Math.max(Date.parse(rec.validUntil), Date.parse(p.issuedAt) || 0);
  const { mac, ...rest } = rec;
  writeAll({
    ...rest,
    validUntil: addMonths(new Date(from), months).toISOString(),
    applied: [...rec.applied, p.nonce].slice(-50),
    // The signed issue date is trusted time; never let the high-water mark be lower than it.
    lastSeenAt: new Date(Math.max(Date.parse(rec.lastSeenAt) || 0, Date.parse(p.issuedAt) || 0)).toISOString(),
  });
  return { ok: true };
}
