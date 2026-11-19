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

import { listPlans, listPlansAdmin, updatePlan } from "../controllers/plan.controller";
import {
  portalAuth, registerInstitute, portalLogin, portalMe, portalPayments,
  createOrder, verifyPayment, razorpayWebhook, syncSubscription,
} from "../controllers/portal.controller";
import {
  saasAuth, saasLogin, saasMe, getPublicSettings, getSettingsAdmin, updateSettings, listInstitutes,
} from "../controllers/saas.controller";
const router = express.Router();

router.get("/setup/status", setupStatusController);

router.post("/setup", setupCentralController);
router.post("/setup/address", createMasterAddressController);

// ---- Web portal (public / portal-token) ----
router.post("/portal/register", registerInstitute);
router.post("/portal/login", portalLogin);
router.get("/portal/me", portalAuth, portalMe);
router.get("/portal/payments", portalAuth, portalPayments);
router.post("/portal/order", portalAuth, createOrder);
router.post("/portal/verify", portalAuth, verifyPayment);
router.post("/portal/razorpay-webhook", razorpayWebhook);
router.post("/subscription/sync", syncSubscription); // called by the EXE

router.get("/plans", listPlans); // public: website landing page

// ---- SaaS Super Admin (hosted portal, /saas/login) ----
router.post("/saas/login", saasLogin);
router.get("/saas/me", saasAuth, saasMe);
router.get("/saas/plans", saasAuth, listPlansAdmin);
router.put("/saas/plans/:code", saasAuth, updatePlan);
router.get("/saas/institutes", saasAuth, listInstitutes);
router.get("/saas/settings", saasAuth, getSettingsAdmin);
router.put("/saas/settings", saasAuth, updateSettings);
router.get("/app-settings", getPublicSettings); // global settings for all EXE clients

router.get("/master-user", masterAuthMiddleware, getClientAdmin);
router.get("/master-tenant", masterAuthMiddleware, getTenantAdmin);

router.put("/master-user", masterAuthMiddleware, updateMasterAdmin);

export default router;
