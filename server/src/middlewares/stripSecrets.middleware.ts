import { Request, Response, NextFunction } from "express";

/**
 * Safety net for institute API responses: password hashes and session tokens
 * must never leave the server, even when a query returns a whole user record.
 */
const SECRET_KEYS = new Set(["password", "currentSessionToken"]);

function strip(value: any): any {
  if (Array.isArray(value)) return value.map(strip);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      if (SECRET_KEYS.has(k)) continue;
      out[k] = strip(v);
    }
    return out;
  }
  return value;
}

export function stripSecrets(req: Request, res: Response, next: NextFunction) {
  const original = res.json.bind(res);
  res.json = ((body: any) => original(strip(body))) as typeof res.json;
  next();
}
