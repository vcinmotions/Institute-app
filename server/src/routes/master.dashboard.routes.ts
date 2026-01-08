// src/routes/dashboard.routes.ts
import express from "express";
import {
  getClientAdmin,
  getTenantAdmin,
  updateMasterAdmin,
} from "../controllers//master.dashboard.controller";
import { masterAuthMiddleware } from "../middlewares/master.auth.middleware";
import { setupCentralController } from "../controllers/setup.controller";
import { setupStatusController } from "../controllers/setup-status.controller";
import { createMasterAddressController } from "../controllers/master.setup.controller";

const router = express.Router();

router.get("/setup/status", setupStatusController);

router.post("/setup", setupCentralController);
router.post("/setup/address", createMasterAddressController);

router.get("/master-user", masterAuthMiddleware, getClientAdmin);
router.get("/master-tenant", masterAuthMiddleware, getTenantAdmin);

router.put("/master-user", masterAuthMiddleware, updateMasterAdmin);

export default router;
