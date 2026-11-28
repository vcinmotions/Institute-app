// src/routes/dashboard.routes.ts
import express from "express";
import {
  getClientAdmin,
  getTenantAdmin,
  updateMasterAdmin,
} from "../controllers//master.dashboard.controller";
import { masterAuthMiddleware } from "../middlewares/master.auth.middleware";
import { setupCompaniesController, setupCentralController, setupIdentityController, setupResyncController } from "../controllers/setup.controller";
import { setupLocalController, setupDemoController, setupOptionsController } from "../controllers/setup.local.controller";
import { setupStatusController } from "../controllers/setup-status.controller";
import { createMasterAddressController } from "../controllers/master.setup.controller";

import { listPlans, listPlansAdmin, updatePlan } from "../controllers/plan.controller";
import {
  portalAuth, masterOnly, listCompanies, createCompany, updateCompany, registerInstitute, portalLogin, portalIdentity, portalMe, portalUpdateProfile, portalPayments,
  createOrder, verifyPayment, razorpayWebhook, syncSubscription,
} from "../controllers/portal.controller";
import {
  saasAuth, saasLogin, saasMe, getPublicSettings, getSettingsAdmin, updateSettings, listInstitutes, updateInstituteSubscription,
} from "../controllers/saas.controller";
import {
  activateDevice, claimServer, verifyDevice, saasListKeys, saasCreateKey, saasUpdateKey, saasSetDeviceStatus,
  portalListKeys, portalDeactivateDevice, saasIssueLocalRenewal,
} from "../controllers/activation.controller";
import { portalGetBranding, portalUpdateBranding, portalBrandingUpload, brandingUploadErrors } from "../controllers/branding.controller";
import { latestAppInfo, appDownloadLink, downloadLatestApp } from "../controllers/download.controller";
const router = express.Router();

// Tiny in-memory throttle for the public activation endpoints (brute-force protection for keys).
const hits = new Map<string, { n: number; t: number }>();
function throttle(max: number, windowMs: number): express.RequestHandler {
  return (req, res, next) => {
    const k = `${req.ip}:${req.path}`;
    const now = Date.now();
    const h = hits.get(k);
    if (!h || now - h.t > windowMs) hits.set(k, { n: 1, t: now });
    else if (++h.n > max) return res.status(429).json({ error: "Too many attempts. Try again later." });
    next();
  };
}

router.get("/setup/status", setupStatusController);

router.post("/setup/companies", setupCompaniesController);
router.post("/setup", setupCentralController);
router.get("/setup/options", setupOptionsController);
router.post("/setup/local", setupLocalController);
router.post("/setup/demo", setupDemoController);
router.get("/setup/identity", setupIdentityController);
router.post("/setup/resync", setupResyncController);
router.post("/setup/address", createMasterAddressController);

// ---- Windows app download (subscribers only; /app/latest shows just the version) ----
router.get("/app/latest", latestAppInfo);
router.post("/portal/app/download-link", portalAuth, appDownloadLink);
router.get("/app/download", downloadLatestApp);

// ---- Web portal (public / portal-token) ----
router.post("/portal/register", registerInstitute);
router.post("/portal/login", portalLogin);
router.post("/portal/identity", portalIdentity);
router.get("/portal/me", portalAuth, portalMe);
router.put("/portal/profile", portalAuth, portalUpdateProfile);
router.get("/portal/payments", portalAuth, portalPayments);
router.post("/portal/order", portalAuth, masterOnly, createOrder);
router.post("/portal/verify", portalAuth, masterOnly, verifyPayment);
router.get("/portal/companies", portalAuth, masterOnly, listCompanies);
router.post("/portal/companies", portalAuth, masterOnly, createCompany);
router.put("/portal/companies/:id", portalAuth, masterOnly, updateCompany);
router.post("/portal/razorpay-webhook", razorpayWebhook);
// Institute branding (name + logo): set here only; installations receive it with /subscription/sync.
router.get("/portal/branding", portalAuth, masterOnly, portalGetBranding);
router.put("/portal/branding", portalAuth, masterOnly, portalBrandingUpload.single("logo"), brandingUploadErrors, portalUpdateBranding);
router.post("/subscription/sync", syncSubscription); // called by the EXE

// ---- EXE activation keys & devices ----
router.post("/activation/activate", throttle(10, 10 * 60 * 1000), activateDevice); // called by the EXE
router.post("/activation/claim-server", throttle(10, 10 * 60 * 1000), claimServer); // called by the EXE during first setup
router.post("/activation/verify", throttle(60, 10 * 60 * 1000), verifyDevice); // called by the EXE
router.get("/portal/activation", portalAuth, masterOnly, portalListKeys);
router.post("/portal/activation/devices/:id/deactivate", portalAuth, masterOnly, portalDeactivateDevice);

router.get("/plans", listPlans); // public: website landing page

// ---- SaaS Super Admin (hosted portal, /saas/login) ----
router.post("/saas/login", saasLogin);
router.get("/saas/me", saasAuth, saasMe);
router.get("/saas/plans", saasAuth, listPlansAdmin);
router.put("/saas/plans/:code", saasAuth, updatePlan);
router.get("/saas/institutes", saasAuth, listInstitutes);
router.put("/saas/institutes/:tenantId/subscription", saasAuth, updateInstituteSubscription);
router.get("/saas/activation-keys", saasAuth, saasListKeys);
router.post("/saas/activation-keys", saasAuth, saasCreateKey);
router.put("/saas/activation-keys/:id", saasAuth, saasUpdateKey);
router.post("/saas/local-renewal", saasAuth, saasIssueLocalRenewal);
router.put("/saas/activation-devices/:id", saasAuth, saasSetDeviceStatus);
router.get("/saas/settings", saasAuth, getSettingsAdmin);
router.put("/saas/settings", saasAuth, updateSettings);
router.get("/app-settings", getPublicSettings); // global settings for all EXE clients

router.get("/master-user", masterAuthMiddleware, getClientAdmin);
router.get("/master-tenant", masterAuthMiddleware, getTenantAdmin);

router.put("/master-user", masterAuthMiddleware, updateMasterAdmin);

export default router;
