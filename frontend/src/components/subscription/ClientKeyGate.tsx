"use client";

import { useCallback, useEffect, useState } from "react";
import { publicApi } from "@/lib/apiClient";

type ClientStatus = {
  local: boolean;
  confirmed: boolean;
  required?: boolean;
  company?: string | null;
  institute?: string | null;
  serverActivated?: boolean;
};

const TOKEN_KEY = "vc_device_token";
const BROWSER_ID_KEY = "vc_browser_device";

/** Id of THIS PC: from the desktop app when available, otherwise a random id kept in the browser. */
async function thisDevice(): Promise<{ deviceId: string; deviceName: string; os: string }> {
  try {
    const d = await window.electronAPI?.device?.get?.();
    if (d?.deviceId) return d;
  } catch { /* fall through */ }
  let id = window.localStorage.getItem(BROWSER_ID_KEY);
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
    window.localStorage.setItem(BROWSER_ID_KEY, id);
  }
  return { deviceId: id, deviceName: "Web browser", os: navigator.platform || "" };
}

/**
 * Client PCs / laptops: confirm the institute's activation key once, before the login screen.
 * Not shown on the server computer itself, and not shown at all unless the build uses keys (ENABLED mode).
 */
export default function ClientKeyGate() {
  const [st, setSt] = useState<ClientStatus | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const token = window.localStorage.getItem(TOKEN_KEY) ?? "";
      const { data } = await publicApi.get<ClientStatus>("/device-activation/client/status", { headers: token ? { "X-Device-Token": token } : {} });
      if (!data.confirmed && token) window.localStorage.removeItem(TOKEN_KEY); // revoked or stale
      setSt(data);
    } catch {
      /* server not reachable: the connection indicator explains it */
    }
  }, []);

  useEffect(() => {
    load();
    const on = () => load();
    window.addEventListener("client-key-required", on);
    const t = setInterval(load, 60_000);
    return () => { clearInterval(t); window.removeEventListener("client-key-required", on); };
  }, [load]);

  if (!st || st.local || st.confirmed || st.required === false) return null;

  const confirm = async () => {
    setErr(""); setBusy(true);
    try {
      const dev = await thisDevice();
      const { data } = await publicApi.post("/device-activation/client/confirm", { key, ...dev });
      window.localStorage.setItem(TOKEN_KEY, data.token);
      window.location.reload();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Could not confirm the key. Check the connection to the server.");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-gray-900/95 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:text-white">
        <h2 className="mb-1 text-xl font-semibold">Connect this PC to {st.company || "the server"}</h2>
        {st.serverActivated === false ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            The server computer has not been activated yet. Ask the Super Admin to open the application on the server and complete the setup, then try again.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Enter your institute&apos;s <b>activation key</b> once. The same key works on every PC and laptop, for every company. The admin finds it under System Settings on the server, or in the portal.
            </p>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && key.trim() && !busy && confirm()}
              placeholder="VCIN-XXXX-XXXX-XXXX-XXXX"
              autoFocus
              className="mb-3 h-11 w-full rounded-lg border border-gray-300 px-3 font-mono text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
            <button onClick={confirm} disabled={busy || !key.trim()} className="w-full rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50">
              {busy ? "Checking..." : "Connect"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
