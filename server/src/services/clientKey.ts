import crypto from "crypto";

/** Client keys are never stored in a verifiable form on the server: the signed licence carries only this hash. */
export const normalizeKey = (k: unknown) => String(k ?? "").trim().toUpperCase().replace(/\s+/g, "");

export function hashClientKey(key: unknown, keyId: string): string {
  return crypto.createHash("sha256").update(`vc-client-key:${keyId}:${normalizeKey(key)}`).digest("hex");
}

export const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
