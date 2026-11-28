"use client";

import { useCallback, useEffect, useState } from "react";
import { publicApi } from "@/lib/apiClient";

type Act = {
  status: string;
  blocked: boolean;
  message: string;
  mode: "ENABLED" | "STANDALONE" | null;
  device?: { deviceId: string; deviceName: string };
  isLocal?: boolean;
};

/**
 * Full-screen activation screen. Shown before login on a PC that is not activated
 * (or whose activation was revoked). The server also refuses every other request meanwhile.
 */
export default function ActivationGate() {
  const [act, setAct] = useState<Act | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await publicApi.get<Act>("/device-activation/status");
      setAct(data);
    } catch {
      // Server not reachable yet: nothing to show.
    }
  }, []);

  useEffect(() => {
    load();
    const onBlocked = () => load();
    window.addEventListener("activation-required", onBlocked);
    const t = setInterval(load, 60_000);
    return () => {
      clearInterval(t);
      window.removeEventListener("activation-required", onBlocked);
    };
  }, [load]);

  if (!act || !act.blocked) return null;

  // A client PC can never activate the server (the server refuses it). Just explain what is wrong.
  if (act.isLocal === false) {
    return (
      <div className="fixed inset-x-0 top-0 z-[190000] bg-red-600 px-4 py-2 text-center text-sm text-white">
        The server computer is not activated: {act.message} Ask the Super Admin to fix it on the server.
      </div>
    );
  }

  const activate = async () => {
    setErr("");
    setBusy(true);
    try {
      await publicApi.post("/device-activation/activate", { key });
      setKey("");
      await load();
      window.location.reload();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Activation failed. Check the key and your internet connection.");
    } finally {
      setBusy(false);
    }
  };

  const denied = act.status === "DEACTIVATED" || act.status === "BUILD_INVALID";

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-gray-900/95 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:text-white"
      >
        <h2 className="mb-1 text-xl font-semibold">{denied ? "Activation required" : "Activate this PC"}</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{act.message}</p>
        {act.status !== "BUILD_INVALID" && (
          <>
            <label className="mb-1 block text-xs font-medium text-gray-500">Activation key</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && key.trim() && !busy && activate()}
              placeholder="VCIN-XXXX-XXXX-XXXX-XXXX"
              autoFocus
              className="mb-3 h-11 w-full rounded-lg border border-gray-300 px-3 font-mono text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
            <button
              onClick={activate}
              disabled={busy || !key.trim()}
              className="w-full rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Activating..." : "Activate"}
            </button>
            <p className="mt-3 text-xs text-gray-500">
              Get the key from your subscriber portal. Internet is needed only for this step
              {act.mode === "STANDALONE" ? "; afterwards the application runs fully on your local server." : "."}
            </p>
          </>
        )}
        {act.device && (
          <p className="mt-3 break-all text-[11px] text-gray-400">
            PC: {act.device.deviceName} / {act.device.deviceId}
          </p>
        )}
      </div>
    </div>
  );
}
