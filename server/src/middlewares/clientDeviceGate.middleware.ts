import { Request, Response, NextFunction } from "express";
import { getMode } from "../services/buildConfig.service";
import { isLoopback, verifyClientToken } from "../services/clientDevice.service";

/**
 * Client PCs (anything not running on this server computer) must have confirmed the company's Client key.
 * The server PC itself (loopback) is exempt - it is covered by the server activation instead.
 */
const OPEN = [
  /^\/device-activation\/client\//,
  /^\/subscription\/locked$/,
  /^\/setup\/(status|identity|options)$/,
  /^\/app-settings$/,
  /^\/branding\/public$/,
  /^\/session-settings$/,
  /^\/auth\/logout$/, // best-effort sign-out when a client window closes (still needs the login token)
];

export async function clientDeviceGate(req: Request, res: Response, next: NextFunction) {
  if (getMode() !== "ENABLED" || isLoopback(req)) return next(); // local mode: clients simply connect
  const path = req.path.replace(/\/{2,}/g, "/");
  if (OPEN.some((r) => r.test(path))) return next();
  if (req.method === "GET" && path === "/master-user") return next(); // needs a master login token anyway
  try {
    if (await verifyClientToken(req.headers["x-device-token"], req.ip)) return next();
  } catch (e) {
    console.error("client gate error:", e);
  }
  return res.status(403).json({ code: "CLIENT_KEY_REQUIRED", error: "Enter this company's Client key on this PC to connect to the server." });
}
