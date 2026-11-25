import express from "express";
import { getState, syncFromCloud } from "../services/subscription.service";
import { getActivationState, activateWithKey, storeLicense, verifyWithPortal } from "../services/activation.service";
import { getDeviceInfo } from "../services/device.service";

const router = express.Router();
const tries = new Map<string, { n: number; t: number }>();

// Public: this is what the first-run activation screen talks to (before anyone can log in).
router.get("/device-activation/status", (_req, res) => {
  const s = getState();
  res.json({ ...getActivationState(), mode: s.mode ?? null, device: getDeviceInfo(), renewUrl: s.renewUrl });
});

router.post("/device-activation/activate", async (req, res) => {
  const h = tries.get(req.ip ?? "") ?? { n: 0, t: Date.now() };
  if (Date.now() - h.t > 10 * 60 * 1000) { h.n = 0; h.t = Date.now(); }
  if (++h.n > 10) return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
  tries.set(req.ip ?? "", h);

  const key = String(req.body?.key ?? "").trim();
  if (!key) return res.status(400).json({ error: "Enter your activation key." });
  const r = await activateWithKey(key);
  if (!r.ok) return res.status(r.reason === "LIMIT" ? 409 : 400).json({ error: r.error, reason: r.reason });
  res.json({ ok: true, state: getActivationState() });
});

// Offline renewal / activation: install a licence file downloaded from the portal for THIS PC.
router.post("/device-activation/apply-license", (req, res) => {
  const { payloadJson, signature } = req.body ?? {};
  const r = storeLicense(String(payloadJson ?? ""), String(signature ?? ""));
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ ok: true, state: getActivationState() });
});

// Re-check with the portal (e.g. after renewing online).
router.post("/device-activation/refresh", async (_req, res) => {
  const r = await verifyWithPortal();
  await syncFromCloud().catch(() => {});
  res.json({ ...r, state: getState() });
});

export default router;
