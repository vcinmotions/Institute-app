import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { getUserDataPath } from "../middlewares/runtimePaths";

/**
 * Session (idle timeout) setting for the whole installation. Read by every signed-in PC so the timeout is
 * the same everywhere; only the Master (Institute Super) Admin can change it. 0 = never sign out automatically.
 */
const file = () => path.join(getUserDataPath(), "data", "session-settings.json");
export const DEFAULT_IDLE_MINUTES = 30;
const MAX_MINUTES = 24 * 60;

export function readIdleMinutes(): number {
  try {
    const v = Number(JSON.parse(fs.readFileSync(file(), "utf8")).idleTimeoutMinutes);
    return Number.isInteger(v) && v >= 0 && v <= MAX_MINUTES ? v : DEFAULT_IDLE_MINUTES;
  } catch {
    return DEFAULT_IDLE_MINUTES;
  }
}

export function getSessionSettings(_req: Request, res: Response) {
  res.json({ idleTimeoutMinutes: readIdleMinutes() });
}

export function updateSessionSettings(req: Request, res: Response) {
  if ((req.user as any)?.role !== "MASTER_ADMIN") return res.status(403).json({ error: "Unauthorized" });
  const v = Number(req.body?.idleTimeoutMinutes);
  if (!Number.isInteger(v) || v < 0 || v > MAX_MINUTES) {
    return res.status(400).json({ error: "Enter a whole number of minutes from 0 (never) to 1440." });
  }
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify({ idleTimeoutMinutes: v }), "utf8");
  res.json({ idleTimeoutMinutes: v });
}
