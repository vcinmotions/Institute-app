import express from "express";
import { backupController, backupStatusController, backupConfigController } from "../controllers/system.backup.controller";
import { systemHealthController } from "../controllers/system.health.controller";
import { publicBranding, getBranding, updateBranding, brandingUpload, brandingUploadErrors } from "../controllers/branding.controller";
import { getSessionSettings, updateSessionSettings } from "../controllers/session.settings.controller";
import { masterAuthMiddleware } from "../middlewares/master.auth.middleware";

const router = express.Router();

router.post("/backup", masterAuthMiddleware, backupController);
router.get("/backup/status", masterAuthMiddleware, backupStatusController);
router.put("/backup/config", masterAuthMiddleware, backupConfigController);
router.get("/system/health", masterAuthMiddleware, systemHealthController);
// Institute branding: public read (login screen), master-admin-only write.
router.get("/branding/public", publicBranding);
router.get("/branding", masterAuthMiddleware, getBranding);
router.put("/branding", masterAuthMiddleware, brandingUpload.single("logo"), brandingUploadErrors, updateBranding);
// Idle sign-out timeout (read by every PC, changed by the master admin only).
router.get("/session-settings", getSessionSettings);
router.put("/session-settings", masterAuthMiddleware, updateSessionSettings);
// NOTE: the old unauthenticated POST /restore was removed on purpose (it accepted any file path and
// killed the server). Restore runs only from the desktop app: Restore screen -> "perform-restore".

export default router;
