import crypto from "crypto";
import { EMBEDDED_LICENSE_PUBLIC_KEY } from "../config/licensePublicKey";

/**
 * Shared signing / verification helpers for every signed document
 * (subscription payload, activation licence, build config).
 *
 * - Verification uses the public key COMPILED INTO the app. In a packaged build
 *   (APP_ENV=prod) the .env value is ignored, so editing .env cannot swap the key.
 * - Signing needs SUBSCRIPTION_PRIVATE_KEY, which exists only on the hosted portal.
 */
const isProd = () => process.env.APP_ENV === "prod";

export function toPem(v: string) {
  return v.includes("BEGIN") ? v.replace(/\n/g, "\n") : Buffer.from(v, "base64").toString("utf8");
}

export function getPublicKey(): crypto.KeyObject | null {
  try {
    const override = !isProd() ? process.env.SUBSCRIPTION_PUBLIC_KEY : undefined; // dev/test only
    return crypto.createPublicKey(override ? toPem(override) : EMBEDDED_LICENSE_PUBLIC_KEY);
  } catch {
    return null;
  }
}

export function verifyJson(payloadJson: string, signature: string): boolean {
  const key = getPublicKey();
  if (!key || !payloadJson || !signature) return false;
  try {
    return crypto.verify(null, Buffer.from(payloadJson), key, Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}

/** Portal only. `kind` is signed into the payload so one document type can't be replayed as another. */
export function signJson(kind: string, data: Record<string, any>) {
  const v = process.env.SUBSCRIPTION_PRIVATE_KEY;
  if (!v) throw new Error("SUBSCRIPTION_PRIVATE_KEY not set");
  const payloadJson = JSON.stringify({ ...data, kind });
  const signature = crypto
    .sign(null, Buffer.from(payloadJson), crypto.createPrivateKey(toPem(v)))
    .toString("base64");
  return { payloadJson, signature };
}

/** Returns the parsed payload only if the signature is valid AND it is of the expected kind. */
export function openSigned<T = any>(kind: string, payloadJson: string, signature: string): T | null {
  if (!verifyJson(payloadJson, signature)) return null;
  try {
    const p = JSON.parse(payloadJson);
    return p?.kind === kind ? (p as T) : null;
  } catch {
    return null;
  }
}
