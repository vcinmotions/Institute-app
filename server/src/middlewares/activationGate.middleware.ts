import { Request, Response, NextFunction } from "express";
import { getState } from "../services/subscription.service";

/**
 * Until this PC is activated with a valid key (or when its activation was revoked / the build config
 * is invalid) nothing but the activation screen's own endpoints works - not even login.
 */
const OPEN = [
  /^\/(device-)?activation(\/|$)/,
  /^\/subscription\/(locked|me)$/,
  /^\/setup(\/|$)/, // first-time setup activates the server
  /^\/subscription\/sync$/,
  /^\/app-settings$/,
];

export function activationGate(req: Request, res: Response, next: NextFunction) {
  const path = req.path.replace(/\/{2,}/g, "/");
  if (OPEN.some((r) => r.test(path))) return next();
  const s = getState();
  if (!s.blocked) return next();
  return res.status(403).json({ code: "ACTIVATION_REQUIRED", status: s.status, error: s.message });
}
