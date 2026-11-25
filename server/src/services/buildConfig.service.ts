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
  if (process.env.SUBSCRIPTION_PRIVATE_KEY) return (cache = { ok: false, reason: "UNMANAGED" });
  if (!prod) {
    // Development: SUBSCRIPTION_MODE env, else legacy behaviour (enforced iff an API URL is configured).
    const mode = String(process.env.SUBSCRIPTION_MODE || "").toUpperCase();
    const enabled = mode === "ENABLED" || (!mode && !!process.env.SUBSCRIPTION_API_URL);
    const standalone = mode === "STANDALONE";
    if (!enabled && !standalone) {
      return (cache = { ok: false, reason: "UNMANAGED" });
    }
    return (cache = {
      ok: true,
      source: "dev-env",
      config: {
        kind: "BUILD_CONFIG",
        mode: standalone ? "STANDALONE" : "ENABLED",
        apiUrl: process.env.SUBSCRIPTION_API_URL,
        portalUrl: process.env.SUBSCRIPTION_PORTAL_URL,
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
