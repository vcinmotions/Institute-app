"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

/** Fallback when the latest-version lookup fails: GitHub's page for the latest stable release. */
const RELEASES_PAGE = "https://github.com/vcinmotions/Institute-app/releases/latest";

type LatestApp = { version: string; url: string; size: number };

/** "Download for Windows" link to the latest stable installer (newest non-draft, non-pre-release). */
export default function DownloadAppButton() {
  const [app, setApp] = useState<LatestApp | null>(null);

  useEffect(() => {
    apiClient
      .get("/app/latest")
      .then(({ data }) => setApp(data))
      .catch(() => setApp(null));
  }, []);

  return (
    <a
      href={app?.url ?? RELEASES_PAGE}
      rel="noopener noreferrer"
      title={
        app
          ? `Download VC-Inmotions ${app.version} for Windows (${(app.size / 1048576).toFixed(0)} MB)`
          : "Download the Windows app"
      }
      className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:border-brand-500 hover:text-brand-500 dark:border-gray-700"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10 3a1 1 0 0 1 1 1v7.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42L9 11.6V4a1 1 0 0 1 1-1Zm-6 13a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z" />
      </svg>
      <span className="hidden sm:inline">Download for Windows</span>
      <span className="sm:hidden">Download</span>
      {app && (
        <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 lg:inline dark:bg-brand-500/10 dark:text-brand-400">
          v{app.version}
        </span>
      )}
    </a>
  );
}
