// routes/tenantRoutes.ts
import { Router } from "express";
import {
  createTenantController,
  getTenantController,
} from "../controllers/tenant.controller";
import { masterAuthMiddleware } from "../middlewares/master.auth.middleware";
import { upload } from "../utils/multer.config";

const router = Router();

router.post(
  "/tenants",
  masterAuthMiddleware,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "sign", maxCount: 1 },
    { name: "stamp", maxCount: 1 },
  ]),
  createTenantController
);

router.get("/tenants", getTenantController);

export default router;
