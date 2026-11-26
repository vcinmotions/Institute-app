import fs from "fs";
import path from "path";
import multer from "multer";
import { Request, Response } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";
import { instituteDb } from "../utils/institute";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { logActivity } from "../utils/activityLogger";
import { isSystemAdmin } from "../middlewares/master.auth.middleware";

/**
 * Institute branding (logo + name), managed by the Master (Institute Super) Admin only.
 * The change is written to the central institute record AND to the institute's primary company row,
 * so headers, printouts and certificates all pick it up. Anyone may READ the public name/logo (the login
 * screen shows it); only the master admin token can change it.
 */
export const brandingDir = () => path.join(getUserDataPath(), "uploads", "branding");
const ALLOWED = new Map([["image/png", ".png"], ["image/jpeg", ".jpg"], ["image/webp", ".webp"]]);
const MAX_BYTES = 1024 * 1024;

export const brandingUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(brandingDir(), { recursive: true });
      cb(null, brandingDir());
    },
    filename: (_req, file, cb) => cb(null, `logo-${Date.now()}${ALLOWED.get(file.mimetype) ?? ".png"}`),
  }),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(file.mimetype) ? cb(null, true) : cb(new Error("Logo must be a PNG, JPG or WEBP image.")),
});

async function masterInstitute(tenantId?: string) {
  const prisma = getCentralPrisma();
  if (tenantId) return prisma.tenant.findFirst({ where: { tenantId, parentTenantId: null } });
  return prisma.tenant.findFirst({ where: { parentTenantId: null }, orderBy: { createdAt: "asc" } });
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

export async function updateBranding(req: Request, res: Response) {
  if (!isSystemAdmin(req)) return res.status(403).json({ error: "Unauthorized" });
  const file = (req as any).file as Express.Multer.File | undefined;
  const cleanup = () => file && fs.rmSync(file.path, { force: true });
  try {
    const t = await masterInstitute(req.body?.tenantId);
    if (!t) { cleanup(); return res.status(404).json({ error: "Institute not found." }); }

    const name = req.body?.instituteName !== undefined ? String(req.body.instituteName).trim() : t.instituteName;
    if (!name || name.length > 120) { cleanup(); return res.status(400).json({ error: "Institute name is required (max 120 characters)." }); }

    const removeLogo = String(req.body?.removeLogo) === "true";
    const newLogo = file ? `branding-files/${file.filename}` : removeLogo ? null : t.logo;

    const taken = await getCentralPrisma().tenant.findFirst({ where: { instituteName: name, NOT: { id: t.id } } });
    if (taken) { cleanup(); return res.status(409).json({ error: "Another institute already uses this name." }); }

    const prisma = getCentralPrisma();
    const updated = await prisma.tenant.update({ where: { id: t.id }, data: { instituteName: name, logo: newLogo } });

    // Primary company inside the institute's own database (used by headers, receipts, certificates).
    const db = instituteDb(updated);
    const master = (await db.clientAdmin.findFirst({ where: { isMaster: true } })) ?? (await db.clientAdmin.findFirst({ orderBy: { createdAt: "asc" } }));
    if (master) {
      await db.clientAdmin.update({ where: { id: master.id }, data: { instituteName: name, logo: newLogo } });
      await logActivity({ clientAdminId: master.id, entity: "Branding", entityId: master.id, action: "UPDATE", message: `Institute branding changed${t.instituteName !== name ? `: "${t.instituteName}" -> "${name}"` : ""}${file ? " (logo updated)" : removeLogo ? " (logo removed)" : ""}`, dbUrl: (await import("../utils/institute")).dbUrlOfTenant(updated) });
    }

    // The previous uploaded logo is no longer used.
    if ((file || removeLogo) && t.logo?.startsWith("branding-files/")) {
      fs.rmSync(path.join(brandingDir(), path.basename(t.logo)), { force: true });
    }
    res.json(view(updated));
  } catch (e: any) {
    cleanup();
    console.error("branding update failed:", e);
    res.status(500).json({ error: "Could not save the branding." });
  }
}

/** Turns multer errors (file too big / wrong type) into a readable 400. */
export function brandingUploadErrors(err: any, _req: Request, res: Response, next: any) {
  if (!err) return next();
  const msg = err.code === "LIMIT_FILE_SIZE" ? "The logo must be 1 MB or smaller." : err.message || "Upload failed.";
  res.status(400).json({ error: msg });
}
