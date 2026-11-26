import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { Request, Response } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";
import { instituteDb, dbUrlOfTenant } from "../utils/institute";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { logActivity } from "../utils/activityLogger";
import { isSystemAdmin } from "../middlewares/master.auth.middleware";

/**
 * Institute branding (display name + logo).
 *
 * It is managed ONLY in the subscription portal (master institute account, "Branding" tab). The portal keeps it
 * per institute, and every EXE picks it up during its regular portal sync (see applyPortalBranding), so the
 * desktop app has no screen or API to change it. Anyone may READ the public name/logo (the login screen shows it).
 */
export const brandingDir = () => path.join(getUserDataPath(), "uploads", "branding");
/** Portal-side logo files (served at /branding-files/portal/...). */
const portalDir = () => path.join(brandingDir(), "portal");
const ALLOWED = new Map([["image/png", ".png"], ["image/jpeg", ".jpg"], ["image/webp", ".webp"]]);
const MAX_BYTES = 1024 * 1024;
const MAX_NAME = 120;

async function masterInstitute() {
  return getCentralPrisma().tenant.findFirst({ where: { parentTenantId: null }, orderBy: { createdAt: "asc" } });
}

const view = (t: { tenantId: string; instituteName: string; logo: string | null }) => ({
  tenantId: t.tenantId,
  instituteName: t.instituteName,
  logoUrl: t.logo ? `/${t.logo.replace(/\\/g, "/").replace(/^\/+/, "")}` : null,
});

export async function publicBranding(_req: Request, res: Response) {
  try {
    const t = await masterInstitute();
    res.set("Cache-Control", "no-store");
    res.json(t ? view(t) : { instituteName: null, logoUrl: null });
  } catch {
    res.json({ instituteName: null, logoUrl: null });
  }
}

export async function getBranding(req: Request, res: Response) {
  if (!isSystemAdmin(req)) return res.status(403).json({ error: "Unauthorized" });
  const t = await masterInstitute();
  if (!t) return res.status(404).json({ error: "Institute not set up yet." });
  res.json(view(t));
}

// ---------------------------------------------------------------------------
// Hosted portal: the institute sets its branding here.
// ---------------------------------------------------------------------------

export type PortalBranding = { name: string; logo: string | null; version: string };
const settingKey = (masterId: string) => `portal.branding.${masterId}`;

export async function readPortalBranding(master: { id: string; instituteName: string }): Promise<PortalBranding> {
  const row = await getCentralPrisma().appSetting.findUnique({ where: { key: settingKey(master.id) } });
  try {
    const v = row ? JSON.parse(row.value) : null;
    if (v?.name) return { name: String(v.name), logo: v.logo ?? null, version: String(v.version ?? "") };
  } catch { /* fall through */ }
  return { name: master.instituteName, logo: null, version: "" };
}

/** What the EXE receives with every subscription sync (logoUrl is a path on the portal server). */
export async function brandingForSync(master: { id: string; instituteName: string }) {
  const b = await readPortalBranding(master);
  return { name: b.name, logoUrl: b.logo ? `/${b.logo}` : null, version: b.version };
}

export const portalBrandingUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(portalDir(), { recursive: true });
      cb(null, portalDir());
    },
    filename: (_req, file, cb) => cb(null, `logo-${crypto.randomBytes(8).toString("hex")}${ALLOWED.get(file.mimetype) ?? ".png"}`),
  }),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(file.mimetype) ? cb(null, true) : cb(new Error("Logo must be a PNG, JPG or WEBP image.")),
});

async function portalMaster(req: Request) {
  const t = await getCentralPrisma().tenant.findUnique({ where: { email: (req as any).portalEmail } });
  return t && !t.parentTenantId ? t : null; // masterOnly runs first; this is a second guard
}

const portalView = (b: PortalBranding) => ({ instituteName: b.name, logoUrl: b.logo ? `/${b.logo}` : null });

export async function portalGetBranding(req: Request, res: Response) {
  const master = await portalMaster(req);
  if (!master) return res.status(403).json({ error: "This is managed by the master institute." });
  res.json(portalView(await readPortalBranding(master)));
}

export async function portalUpdateBranding(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  const cleanup = () => file && fs.rmSync(file.path, { force: true });
  try {
    const master = await portalMaster(req);
    if (!master) { cleanup(); return res.status(403).json({ error: "This is managed by the master institute." }); }
    const cur = await readPortalBranding(master);

    const name = req.body?.instituteName !== undefined ? String(req.body.instituteName).trim() : cur.name;
    if (!name || name.length > MAX_NAME) { cleanup(); return res.status(400).json({ error: "Institute name is required (max 120 characters)." }); }

    const removeLogo = String(req.body?.removeLogo) === "true";
    const logo = file ? `branding-files/portal/${file.filename}` : removeLogo ? null : cur.logo;
    const next: PortalBranding = { name, logo, version: crypto.randomBytes(6).toString("hex") };
    await getCentralPrisma().appSetting.upsert({
      where: { key: settingKey(master.id) },
      update: { value: JSON.stringify(next) },
      create: { key: settingKey(master.id), value: JSON.stringify(next) },
    });

    // The previous portal logo is no longer used.
    if ((file || removeLogo) && cur.logo?.startsWith("branding-files/portal/")) {
      fs.rmSync(path.join(portalDir(), path.basename(cur.logo)), { force: true });
    }
    res.json({ ...portalView(next), message: "Saved. Every PC of your institute shows it after its next online check (within a few minutes)." });
  } catch (e: any) {
    cleanup();
    console.error("portal branding update failed:", e);
    res.status(500).json({ error: "Could not save the branding." });
  }
}

// ---------------------------------------------------------------------------
// Desktop EXE: apply the branding received from the portal.
// ---------------------------------------------------------------------------

const LOCAL_VERSION_KEY = "branding.portalVersion";

/** Writes the name + logo into this installation (central institute record and the primary company). */
async function applyLocally(name: string, logo: string | null) {
  const prisma = getCentralPrisma();
  const t = await masterInstitute();
  if (!t) return;
  const updated = await prisma.tenant.update({ where: { id: t.id }, data: { instituteName: name, logo } });
  const db = instituteDb(updated);
  const company = (await db.clientAdmin.findFirst({ where: { isMaster: true } })) ?? (await db.clientAdmin.findFirst({ orderBy: { createdAt: "asc" } }));
  if (company) {
    await db.clientAdmin.update({ where: { id: company.id }, data: { instituteName: name, logo } });
    await logActivity({
      clientAdminId: company.id, entity: "Branding", entityId: company.id, action: "UPDATE",
      message: `Institute branding updated from the subscription portal${t.instituteName !== name ? `: "${t.instituteName}" -> "${name}"` : ""}`,
      dbUrl: dbUrlOfTenant(updated),
    });
  }
  // A previous logo downloaded from the portal (or uploaded by older versions) is no longer used.
  if (t.logo && t.logo !== logo && t.logo.startsWith("branding-files/")) {
    fs.rmSync(path.join(brandingDir(), path.basename(t.logo)), { force: true });
  }
}

/**
 * Called after a successful portal sync. Best effort: a failure leaves the current branding in place and is
 * retried at the next sync. Nothing changes until the admin saves branding in the portal at least once.
 */
export async function applyPortalBranding(api: string, b: { name?: string; logoUrl?: string | null; version?: string } | undefined) {
  if (!b?.version || !b.name) return;
  const prisma = getCentralPrisma();
  const seen = await prisma.appSetting.findUnique({ where: { key: LOCAL_VERSION_KEY } });
  if (seen?.value === b.version) return;

  const name = String(b.name).trim().slice(0, MAX_NAME);
  let logo: string | null = null;
  if (b.logoUrl) {
    const ext = path.extname(b.logoUrl).toLowerCase();
    if (![".png", ".jpg", ".webp"].includes(ext)) return;
    const r = await fetch(`${api.replace(/\/$/, "")}${b.logoUrl}`, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return;
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length || buf.length > MAX_BYTES) return;
    fs.mkdirSync(brandingDir(), { recursive: true });
    const fileName = `logo-${b.version.replace(/[^a-z0-9]/gi, "")}${ext}`;
    fs.writeFileSync(path.join(brandingDir(), fileName), buf);
    logo = `branding-files/${fileName}`;
  }
  await applyLocally(name, logo);
  await prisma.appSetting.upsert({
    where: { key: LOCAL_VERSION_KEY },
    update: { value: b.version },
    create: { key: LOCAL_VERSION_KEY, value: b.version },
  });
}

/** Turns multer errors (file too big / wrong type) into a readable 400. */
export function brandingUploadErrors(err: any, _req: Request, res: Response, next: any) {
  if (!err) return next();
  const msg = err.code === "LIMIT_FILE_SIZE" ? "The logo must be 1 MB or smaller." : err.message || "Upload failed.";
  res.status(400).json({ error: msg });
}
