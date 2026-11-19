"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

type SubState = {
  enforced: boolean;
  status: string;
  locked: boolean;
  daysLeft: number | null;
  expiryDate: string | null;
  renewUrl: string | null;
  message: string;
  settings?: {
    announcementActive?: boolean;
    announcementText?: string;
    supportEmail?: string;
    supportPhone?: string;
    renewalReminderDays?: number;
  };
};

const POLL_MS = 5 * 60 * 1000;

/**
 * Shows the subscription banner + renewal modal.
 * The backend (subscriptionGuard) is what actually blocks add/edit/delete;
 * this component keeps the user informed and sends them to the web portal.
 * Purchase/renewal never happens inside the EXE.
 */
export default function SubscriptionGate() {
  const [state, setState] = useState<SubState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [checking, setChecking] = useState(false);
 

  const load = useCallback(async (refresh: boolean) => {
    try {
      if (refresh) await apiClient.post("/subscription/refresh").catch(() => {});
      const { data } = await apiClient.get<SubState>("/subscription/me");
      setState(data);
      window.dispatchEvent(new CustomEvent("subscription-state", { detail: data }));
      return data;
    } catch {
      return null;
    }
  }, []);

  // On open: show the modal when locked. Re-validate on focus and every 5 minutes.
  useEffect(() => {
    let alive = true;
    load(true).then((s) => {
      if (alive && s?.locked) setModalOpen(true);
    });
    const onFocus = () => load(true);
    const onVisible = () => document.visibilityState === "visible" && load(true);
    const onExpired = () => {
      setModalOpen(true);
      load(false);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("subscription-expired", onExpired);
    const t = setInterval(() => load(true), POLL_MS);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("subscription-expired", onExpired);
    };
  }, [load]);

  // Unlock automatically once the backend confirms a renewal.
  useEffect(() => {
    if (state && !state.locked) {
      setModalOpen(false);
    }
  }, [state]);

  if (!state || !state.enforced) return null;

  const openRenew = async () => {
    const url = state.renewUrl;
    if (!url) return;
    const ok = await window.electronAPI?.openExternal?.(url);
    if (!ok) window.open(url, "_blank", "noopener,noreferrer");
  };

  const recheck = async () => {
    setChecking(true);
    await load(true);
    setChecking(false);
  };

  const reminderDays = state.settings?.renewalReminderDays ?? 7;
  const showBanner =
    state.locked || (state.daysLeft !== null && state.daysLeft <= reminderDays);
  const support = [state.settings?.supportEmail, state.settings?.supportPhone]
    .filter(Boolean)
    .join(" | ");

  return (
    <>
      {state.settings?.announcementActive && state.settings.announcementText && (
        <div className="bg-blue-600 px-4 py-2 text-center text-sm text-white">
          {state.settings.announcementText}
        </div>
      )}
      {showBanner && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm ${
            state.locked ? "bg-red-600 text-white" : "bg-amber-100 text-amber-900"
          }`}
        >
          <span>
            {state.locked
              ? state.message
              : `Subscription expires in ${state.daysLeft} day(s). Renew online to avoid interruption.`}
          </span>
          <button
            onClick={openRenew}
            className="rounded bg-white/90 px-3 py-1 font-medium text-gray-900 hover:bg-white"
          >
            Renew Subscription
          </button>
        </div>
      )}

      {modalOpen && state.locked && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl dark:bg-gray-900 dark:text-white"
          >
            <h2 className="mb-2 text-xl font-semibold">View-Only Mode</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {state.message}
            </p>
            <p className="mb-4 text-xs text-gray-500">
              You can still log in, view and search your records and export reports. Adding,
              editing or deleting is disabled until you renew.
            </p>
            {support && <p className="mb-3 text-xs text-gray-500">Need help? {support}</p>}
            <div className="flex flex-col gap-2">
              <button
                onClick={openRenew}
                disabled={!state.renewUrl}
                className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Renew Subscription
              </button>
              <button
                onClick={recheck}
                disabled={checking}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                {checking ? "Checking..." : "I have renewed - check again"}
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                }}
                className="text-sm text-gray-500 underline"
              >
                Continue in view / export mode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
