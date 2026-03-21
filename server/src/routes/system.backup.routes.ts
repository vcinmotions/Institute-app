import express from "express";
import { backupController, restoreController } from "../controllers/system.backup.controller";
import { masterAuthMiddleware } from "../middlewares/master.auth.middleware";

const router = express.Router();

router.post("/backup", masterAuthMiddleware, backupController);
router.post("/restore", restoreController);

export default router;