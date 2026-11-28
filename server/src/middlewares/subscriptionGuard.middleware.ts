import { Request, Response, NextFunction } from "express";
import { getState } from "../services/subscription.service";

/**
 * Server-side subscription enforcement (runs after authMiddleware).
 * When the subscription is expired/suspended/revoked/not activated/tampered,
 * the app is view + export only: every non-GET request is rejected with 402.
 * This is the real boundary - the UI only mirrors it.
 */
const ALLOW = [
  /^\/subscription(\/|$)/,
  /^\/notification\/[^/]+\/?$/, // clearing a notification is harmless
];

export function subscriptionGuard(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  let path = req.originalUrl.split("?")[0];
  try { path = decodeURIComponent(path); } catch { /* keep raw */ }
  path = path.replace(/^\/api(?=\/|$)/i, "").replace(/\/{2,}/g, "/");
  if (ALLOW.some((r) => r.test(path))) return next();

  const s = getState();
  if (!s.locked) return next();

  return res.status(402).json({
    code: "SUBSCRIPTION_EXPIRED",
    error: s.message,
    status: s.status,
    renewUrl: s.renewUrl,
  });
}
