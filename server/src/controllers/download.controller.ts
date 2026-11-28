import { Request, Response } from "express";
import { Readable } from "stream";
import jwt from "jsonwebtoken";
import { getCentralPrisma } from "../prisma-client/central-client";

// The Windows installer is published as a GitHub release by electron-builder (see "publish" in the
// root package.json). GitHub's /releases/latest returns the newest release that is neither a draft
// nor a pre-release, i.e. the latest stable version.
//
// Only signed-in institutes with an active subscription (paid or free trial) may download it:
//   1. POST /portal/app/download-link  (portal login)  -> checks the subscription, returns a 5-minute link
//   2. GET  /app/download?t=<token>                    -> streams the installer through this server,
//                                                         so the GitHub file address is never shown.
const REPO = process.env.APP_RELEASE_REPO || "vcinmotions/Institute-app";
const CACHE_MS = 10 * 60 * 1000; // GitHub allows 60 unauthenticated API calls an hour per IP
const LINK_TTL = "5m";

type LatestApp = { version: string; url: string; fileName: string; size: number; publishedAt: string };
let cache: { at: number; data: LatestApp } | null = null;

async function fetchLatest(): Promise<LatestApp> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "app-download-check" },
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const rel: any = await res.json();
    const exe = (rel.assets ?? []).find((a: any) => /\.exe$/i.test(a.name));
    if (!exe) throw new Error(`Release ${rel.tag_name} has no .exe installer`);

    const data: LatestApp = {
      version: String(rel.tag_name ?? "").replace(/^v/i, ""),
      url: exe.browser_download_url,
      fileName: exe.name,
      size: exe.size,
      publishedAt: rel.published_at,
    };
    cache = { at: Date.now(), data };
    return data;
  } catch (e) {
    if (cache) return cache.data; // GitHub unreachable: serve the last known release
    throw e;
  }
}

/** True when the institute (or, for a company, its master institute) has a running subscription. */
async function hasActiveSubscription(email: string) {
  const prisma = getCentralPrisma();
  const tenant = await prisma.tenant.findUnique({ where: { email } });
  if (!tenant) return false;
  let ownerEmail = email;
  if (tenant.parentTenantId) {
    const master = await prisma.tenant.findUnique({ where: { id: tenant.parentTenantId } });
    ownerEmail = master?.email ?? email;
  }
  const sub = await prisma.portalSubscription.findUnique({ where: { email: ownerEmail } });
  return !!sub && sub.status === "ACTIVE" && sub.expiryDate > new Date();
}

/** GET /app/latest -> the latest stable version number only (no download address). */
export async function latestAppInfo(_req: Request, res: Response) {
  try {
    const { version, size, publishedAt } = await fetchLatest();
    res.json({ version, size, publishedAt });
  } catch (e: any) {
    console.error("latest app lookup failed:", e?.message ?? e);
    res.status(503).json({ error: "Download information is not available right now." });
  }
}

/** POST /portal/app/download-link (portalAuth) -> short-lived download link for subscribers. */
export async function appDownloadLink(req: Request, res: Response) {
  const email = (req as any).portalEmail as string;
  try {
    if (!(await hasActiveSubscription(email))) {
      return res.status(402).json({ error: "Activate a subscription or start your free trial to download the app." });
    }
    const { version } = await fetchLatest();
    const token = jwt.sign({ role: "APP_DOWNLOAD", email }, process.env.JWT_SECRET!, { expiresIn: LINK_TTL });
    res.json({ version, path: `/app/download?t=${encodeURIComponent(token)}` });
  } catch (e: any) {
    console.error("download link failed:", e?.message ?? e);
    res.status(503).json({ error: "The download is not available right now. Please try again shortly." });
  }
}

/** GET /app/download?t=<token> -> streams the latest stable installer. */
export async function downloadLatestApp(req: Request, res: Response) {
  let email: string;
  try {
    const d = jwt.verify(String(req.query.t ?? ""), process.env.JWT_SECRET!) as any;
    if (d.role !== "APP_DOWNLOAD" || !d.email) throw new Error("wrong token");
    email = d.email;
  } catch {
    return res.status(401).send("This download link has expired. Sign in to the portal and click Download again.");
  }

  try {
    if (!(await hasActiveSubscription(email))) {
      return res.status(402).send("Your subscription is not active. Renew it on the portal to download the app.");
    }
    const app = await fetchLatest();
    const file = await fetch(app.url, { headers: { "User-Agent": "app-download" } }); // follows GitHub's redirect
    if (!file.ok || !file.body) throw new Error(`GitHub file responded ${file.status}`);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${app.fileName}"`);
    const len = file.headers.get("content-length");
    if (len) res.setHeader("Content-Length", len);
    res.setHeader("Cache-Control", "no-store");

    const body = Readable.fromWeb(file.body as any);
    body.on("error", (err) => {
      console.error("installer stream failed:", err.message);
      res.destroy(err);
    });
    body.pipe(res);
  } catch (e: any) {
    console.error("app download failed:", e?.message ?? e);
    if (!res.headersSent) res.status(503).send("The download is not available right now. Please try again shortly.");
  }
}
