import { Request, Response } from "express";
import { backupStatus, runBackup, saveConfig } from "../services/backup.service";
import { isSystemAdmin } from "../middlewares/master.auth.middleware";

/**
 * Backup management. Master (Institute Super) Admin only - enforced by masterAuthMiddleware on the routes.
 * There is deliberately NO delete endpoint and NO HTTP restore: restoring replaces every database, so it is only
 * possible from the desktop app's Restore screen on the server PC (see installer "perform-restore").
 */
const isMaster = isSystemAdmin;

export async function backupController(req: Request, res: Response) {
  if (!isMaster(req)) return res.status(403).json({ error: "Unauthorized" });
  const r = await runBackup("MANUAL");
  if (!r.ok) return res.status(500).json({ success: false, message: r.error || "Backup failed", error: r.error });
  return res.status(200).json({ success: true, filePath: r.file, externalError: r.externalError });
}

export async function backupStatusController(req: Request, res: Response) {
  if (!isMaster(req)) return res.status(403).json({ error: "Unauthorized" });
  res.json(backupStatus());
}

export async function backupConfigController(req: Request, res: Response) {
  if (!isMaster(req)) return res.status(403).json({ error: "Unauthorized" });
  try {
    saveConfig(req.body ?? {});
    res.json(backupStatus());
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "Invalid settings" });
  }
}
