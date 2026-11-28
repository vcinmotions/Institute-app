import express from "express";
import { getState, syncFromCloud } from "../services/subscription.service";
import { getActivationState, activateWithKey, storeLicense, verifyWithPortal } from "../services/activation.service";
import { applyLocalRenewal } from "../services/localLicense.service";
import { getMode } from "../services/buildConfig.service";
import { getDeviceInfo } from "../services/device.service";
import { confirmClientKey, isLoopback, listClientDevices, setClientDeviceStatus, verifyClientToken } from "../services/clientDevice.service";
import { masterAuthMiddleware } from "../middlewares/master.auth.middleware";
import { getCentralPrisma } from "../prisma-client/central-client";

const router = express.Router();
const tries = new Map<string, { n: number; t: number }>();

// Public: this is what the first-run activation screen talks to (before anyone can log in).
// Only the server computer itself may activate / re-activate the server. A client PC cannot do it remotely.
const localOnly: express.RequestHandler = (req, res, next) =>
  isLoopback(req) ? next() : res.status(403).json({ error: "Activation must be done on the server computer." });

router.get("/device-activation/status", (req, res) => {
  const s = getState();
  res.json({ ...getActivationState(), mode: s.mode ?? null, device: getDeviceInfo(), renewUrl: s.renewUrl, isLocal: isLoopback(req) });
});

router.post("/device-activation/activate", localOnly, async (req, res) => {
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
router.post("/device-activation/apply-license", localOnly, (req, res) => {
  const { payloadJson, signature } = req.body ?? {};
  const r = storeLicense(String(payloadJson ?? ""), String(signature ?? ""));
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ ok: true, state: getActivationState() });
});

// Re-check with the portal (e.g. after renewing online).
router.post("/device-activation/refresh", localOnly, async (_req, res) => {
  const r = await verifyWithPortal();
  await syncFromCloud().catch(() => {});
  res.json({ ...r, state: getState() });
});

// Local mode: extend the validity with a renewal code issued by the portal (works offline, one use each).
router.post("/device-activation/apply-local-renewal", localOnly, (req, res) => {
  const r = applyLocalRenewal(String(req.body?.code ?? ""));
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ ok: true, state: getActivationState() });
});

// ---- Client PCs / laptops confirm the company's Client key (public: they cannot be signed in yet) ----
router.get("/device-activation/client/status", async (req, res) => {
  // Local mode: no Client key - every PC simply connects.
  if (getMode() !== "ENABLED") return res.json({ local: isLoopback(req), confirmed: true, required: false });
  const local = isLoopback(req);
  const confirmed = local || (await verifyClientToken(req.headers["x-device-token"], req.ip));
  const lic = getActivationState();
  res.json({ local, confirmed, required: true, company: lic.company, institute: lic.institute, serverActivated: !lic.blocked });
});

router.post("/device-activation/client/confirm", async (req, res) => {
  if (getMode() !== "ENABLED") return res.json({ ok: true, token: "", required: false });
  const h = tries.get("c" + req.ip) ?? { n: 0, t: Date.now() };
  if (Date.now() - h.t > 10 * 60 * 1000) { h.n = 0; h.t = Date.now(); }
  if (++h.n > 10) return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
  tries.set("c" + req.ip, h);

  const key = String(req.body?.key ?? "").trim();
  const deviceId = String(req.body?.deviceId ?? "").trim();
  if (!key) return res.status(400).json({ error: "Enter the Client key." });
  if (!/^[a-f0-9]{16,64}$/i.test(deviceId)) return res.status(400).json({ error: "This PC could not be identified." });
  const r = await confirmClientKey({
    key, deviceId, deviceName: String(req.body?.deviceName ?? "Client PC"), os: String(req.body?.os ?? ""), ip: req.ip,
  });
  if (!r.ok) return res.status(r.code).json({ error: r.error });
  res.json({ ok: true, token: r.token });
});

// ---- Super Admin (master login) on the server: keys of this company, and the client PCs ----
router.get("/license-keys", masterAuthMiddleware, async (_req, res) => {
  const db = getCentralPrisma();
  const rows = await db.appSetting.findMany({ where: { key: { in: ["keys.server", "keys.client", "company.name", "install.scope"] } } });
  const m = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
  const a = getActivationState();
  res.json({ serverKey: m["keys.server"] ?? null, clientKey: m["keys.client"] ?? null, company: m["company.name"] ?? a.company, institute: a.institute, scope: m["install.scope"] ?? "INSTITUTE", activation: a.status });
});
router.get("/client-devices", masterAuthMiddleware, async (_req, res) => res.json({ devices: await listClientDevices() }));
router.put("/client-devices/:id", masterAuthMiddleware, async (req, res) => {
  const status = req.body?.status === "REVOKED" ? "REVOKED" : "ACTIVE";
  try { res.json(await setClientDeviceStatus(String(req.params.id), status)); } catch { res.status(404).json({ error: "PC not found." }); }
});

export default router;
