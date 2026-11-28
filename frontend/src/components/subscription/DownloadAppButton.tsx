"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config";
import { portalApi, portalAuthHeader } from "@/lib/portalApi";

type Props =
  /** Public website: visitors must sign in or register first. */
  | { mode: "public" }
  /** Signed-in portal: downloads only while the subscription (or free trial) is active. */
  | { mode: "portal"; active: boolean; onInactive?: () => void };

const btn =
  "flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:border-brand-500 hover:text-brand-500 disabled:opacity-60 dark:border-gray-700";

/** "Download for Windows": the latest stable installer, for subscribers only. */
export default function DownloadAppButton(props: Props) {
  const [version, setVersion] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // Version label only; the file itself is never public.
  useEffect(() => {
    apiClient
      .get("/app/latest")
      .then(({ data }) => setVersion(data.version))
      .catch(() => setVersion(null));
  }, []);

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 6000);
    return () => window.clearTimeout(t);
  }, [note]);

  const content = (
    <>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10 3a1 1 0 0 1 1 1v7.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42L9 11.6V4a1 1 0 0 1 1-1Zm-6 13a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z" />
      </svg>
      <span className="hidden sm:inline">{busy ? "Preparing..." : "Download for Windows"}</span>
      <span className="sm:hidden">Download</span>
      {version && (
        <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 lg:inline dark:bg-brand-500/10 dark:text-brand-400">
          v{version}
        </span>
      )}
    </>
  );

  if (props.mode === "public") {
    return (
      <Link href="/subscription" title="Sign in or register your institute to download the app" className={btn}>
        {content}
      </Link>
    );
  }

  const download = async () => {
    if (!props.active) {
      setNote("Activate a subscription or start your free trial to download the app.");
      props.onInactive?.();
      return;
    }
    setBusy(true);
    try {
      const { data } = await portalApi.post("/portal/app/download-link", {}, { headers: portalAuthHeader() });
      window.location.href = `${API_BASE_URL}${data.path}`;
    } catch (err: any) {
      setNote(err?.response?.data?.error || "The download is not available right now. Please try again shortly.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        title={props.active ? "Download the latest Windows app" : "Available with an active subscription"}
        className={btn}
      >
        {content}
      </button>
      {note && (
        <p
          role="status"
          className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700 shadow dark:border-orange-500/30 dark:bg-gray-900 dark:text-orange-400"
        >
          {note}
        </p>
      )}
    </div>
  );
}
