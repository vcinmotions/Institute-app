import fs from "fs";
import path from "path";
import { openSigned } from "./licenseCrypto";

/**
 * Global subscription-mode parameter, fixed at BUILD time.
 *
 *  ENABLED     Mode A - validates the subscription with the portal; expired = view-only until renewed online.
 *  STANDALONE  Mode B - runs fully on the local server, no internet needed; valid 364 days from activation,
 *              then view-only until renewed online through the portal.
 *
 * The value lives in build-config.json, SIGNED by the portal's private key at build time
 * (scripts/sign-build-config.js). The app verifies it with the embedded public key, so editing the file,
 * .env or the database cannot change the mode. A missing/invalid file in a packaged build locks the app.
 */
export type BuildConfig = {
  kind: "BUILD_CONFIG";
  mode: "ENABLED" | "STANDALONE";
  apiUrl?: string;
  portalUrl?: string;
  /** Local mode only: how many months the application is valid from its first run (default 6). */
  localMonths?: number;
  builtAt: string;
};

export type BuildConfigResult =
  | { ok: true; config: BuildConfig; source: "signed" | "dev-env" }
  | { ok: false; reason: string };

const file = () => path.resolve(__dirname, "../../build-config.json");

let cache: BuildConfigResult | null = null;

export function getBuildConfig(): BuildConfigResult {
  if (cache) return cache;
  const prod = process.env.APP_ENV === "prod";
  // The hosted portal itself (holds the private signing key, never shipped in the EXE) is not licensed.
  // APP_ENV=portal is set only by the live server's start command, so it alone also marks the portal:
  // the website must never show the EXE's "Activate this PC" screen.
  if (process.env.SUBSCRIPTION_PRIVATE_KEY || process.env.APP_ENV === "portal") {
    return (cache = { ok: false, reason: "UNMANAGED" });
  }
  if (!prod) {
    // Development: ONLY SUBSCRIPTION_MODE=ENABLED turns on keys + portal subscription checks.
    // Anything else is the local mode: no Server key, no Client key, just a time-limited licence.
    const enabled = String(process.env.SUBSCRIPTION_MODE || "").trim().toUpperCase() === "ENABLED";
    return (cache = {
      ok: true,
      source: "dev-env",
      config: {
        kind: "BUILD_CONFIG",
        mode: enabled ? "ENABLED" : "STANDALONE",
        apiUrl: process.env.SUBSCRIPTION_API_URL,
        portalUrl: process.env.SUBSCRIPTION_PORTAL_URL,
        localMonths: parseMonths(process.env.LOCAL_LICENSE_MONTHS),
        builtAt: "dev",
      },
    });
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file(), "utf8"));
    const cfg = openSigned<BuildConfig>("BUILD_CONFIG", raw.payloadJson, raw.signature);
    if (!cfg || (cfg.mode !== "ENABLED" && cfg.mode !== "STANDALONE")) {
      return (cache = { ok: false, reason: "Build configuration is invalid or has been modified." });
    }
    return (cache = { ok: true, source: "signed", config: cfg });
  } catch {
    return (cache = { ok: false, reason: "Build configuration is missing." });
  }
}

/** True when the build's signed config could not be trusted in a packaged build (app must lock). */
export function buildConfigBroken(): string | null {
  const r = getBuildConfig();
  return !r.ok && r.reason !== "UNMANAGED" ? r.reason : null;
}

/** Months of validity in local mode: LOCAL_LICENSE_MONTHS (whole number 1-120), default 6. */
export const DEFAULT_LOCAL_MONTHS = 6;
export function parseMonths(v: unknown): number {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 120 ? n : DEFAULT_LOCAL_MONTHS;
}
export const localMonths = (): number => {
  const r = getBuildConfig();
  return r.ok ? parseMonths(r.config.localMonths) : DEFAULT_LOCAL_MONTHS;
};

export const getMode = (): "ENABLED" | "STANDALONE" | null => {
  const r = getBuildConfig();
  return r.ok ? r.config.mode : null;
};
export const apiBase = () => {
  const r = getBuildConfig();
  const u = r.ok ? r.config.apiUrl : process.env.SUBSCRIPTION_API_URL;
  return u ? u.replace(/\/$/, "") : null;
};
export const portalBase = () => {
  const r = getBuildConfig();
  const u = r.ok ? r.config.portalUrl : process.env.SUBSCRIPTION_PORTAL_URL;
  return u ? u.replace(/\/$/, "") : null;
};
