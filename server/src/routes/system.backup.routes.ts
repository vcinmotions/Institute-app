import express from "express";
import { backupController, backupStatusController, backupConfigController } from "../controllers/system.backup.controller";
import { systemHealthController } from "../controllers/system.health.controller";
import { publicBranding, getBranding } from "../controllers/branding.controller";
import { getSessionSettings, updateSessionSettings } from "../controllers/session.settings.controller";
import { masterAuthMiddleware } from "../middlewares/master.auth.middleware";

const router = express.Router();

// Lets the app ask "may this user open the system screens?" (master admin; in the EXE the institute admin).
router.get("/system/access", masterAuthMiddleware, (_req, res) => res.json({ ok: true }));
router.post("/backup", masterAuthMiddleware, backupController);
router.get("/backup/status", masterAuthMiddleware, backupStatusController);
router.put("/backup/config", masterAuthMiddleware, backupConfigController);
router.get("/system/health", masterAuthMiddleware, systemHealthController);
// Institute branding: read only here. It is changed in the subscription portal (PUT /portal/branding)
// and reaches every installation with the portal sync.
router.get("/branding/public", publicBranding);
router.get("/branding", masterAuthMiddleware, getBranding);
// Idle sign-out timeout (read by every PC, changed by the master admin only).
router.get("/session-settings", getSessionSettings);
router.put("/session-settings", masterAuthMiddleware, updateSessionSettings);
// NOTE: the old unauthenticated POST /restore was removed on purpose (it accepted any file path and
// killed the server). Restore runs only from the desktop app: Restore screen -> "perform-restore".

export default router;
