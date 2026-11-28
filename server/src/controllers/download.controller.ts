import { Request, Response } from "express";

// The Windows installer is published as a GitHub release by electron-builder (see "publish" in the
// root package.json). GitHub's /releases/latest returns the newest release that is neither a draft
// nor a pre-release, i.e. the latest stable version.
const REPO = process.env.APP_RELEASE_REPO || "vcinmotions/Institute-app";
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;
const CACHE_MS = 10 * 60 * 1000; // GitHub allows 60 unauthenticated API calls an hour per IP

type LatestApp = { version: string; url: string; fileName: string; size: number; publishedAt: string };
let cache: { at: number; data: LatestApp } | null = null;

async function fetchLatest(): Promise<LatestApp> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;

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
}

/** GET /app/latest -> details of the latest stable Windows installer. */
export async function latestAppInfo(_req: Request, res: Response) {
  try {
    res.json(await fetchLatest());
  } catch (e: any) {
    console.error("latest app lookup failed:", e?.message ?? e);
    // Serve the last known version rather than nothing.
    if (cache) return res.json(cache.data);
    res.status(503).json({ error: "Download information is not available right now.", releasesPage: RELEASES_PAGE });
  }
}

/** GET /app/download -> redirects straight to the latest stable installer. */
export async function downloadLatestApp(_req: Request, res: Response) {
  try {
    res.redirect(302, (await fetchLatest()).url);
  } catch (e: any) {
    console.error("latest app download failed:", e?.message ?? e);
    res.redirect(302, cache?.data.url ?? RELEASES_PAGE);
  }
}
