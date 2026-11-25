"use client";

import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiClient } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";

type UState = {
  current: string; status: string; available: string | null; progress: number; error: string | null;
  checkedAt: string | null; packaged: boolean; history: { at: string; from: string; to: string; result: string }[];
};

/** Super Admin: check for a new version, download it, back up the database, then install. */
export default function SoftwareUpdatePage() {
  const api = typeof window !== "undefined" ? window.electronAPI?.update : undefined;
  const [st, setSt] = useState<UState | null>(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const token = () => sessionStorage.getItem("token") ?? "";

  const refresh = useCallback(async () => { if (api) setSt(await api.status()); }, [api]);
  useEffect(() => { refresh(); const t = setInterval(refresh, 2000); return () => clearInterval(t); }, [refresh]);

  const run = async (name: string, fn: () => Promise<any>) => {
    setBusy(name); setMsg(null);
    try { await fn(); await refresh(); } catch (e: any) { setMsg({ ok: false, text: String(e?.message || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, "") }); } finally { setBusy(""); }
  };

  const install = () => run("install", async () => {
    if (!confirm(`Install version ${st?.available}?\n\nA backup of all data is taken first. The application will close and reopen. Your data is not touched by an update.`)) return;
    try { await apiClient.post("/backup"); } // safety net before any update
    catch (e) { if (!confirm(`The safety backup failed (${getApiErrorMessage(e)}). Install anyway?`)) return; }
    await api!.install(token());
  });

  if (!api) {
    return (<div><PageBreadcrumb pageTitle="Software Update" /><p className="text-sm text-gray-500">Updates are managed from the installed desktop application.</p></div>);
  }
  const prev = st?.history.find((h) => h.result === "installing")?.from;

  return (
    <div>
      <PageBreadcrumb pageTitle="Software Update" />
      <section className="max-w-xl space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Installed version</span><b>{st?.current ?? "-"}</b></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Available version</span><b>{st?.available ?? "None (up to date)"}</b></div>
        {st?.checkedAt && <p className="text-xs text-gray-400">Last checked {new Date(st.checkedAt).toLocaleString("en-IN")}</p>}
        {st?.status === "downloading" && (
          <div><div className="h-2 overflow-hidden rounded bg-gray-200"><div className="h-2 bg-brand-500" style={{ width: `${st.progress}%` }} /></div><p className="mt-1 text-xs text-gray-500">Downloading {st.progress}%</p></div>
        )}
        {st?.error && <p className="text-sm text-red-600">{st.error}</p>}
        {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => run("check", () => api.check(token()))} disabled={!!busy || st?.status === "downloading"} className="rounded border px-3 py-1.5 text-sm dark:border-gray-700">Check for updates</button>
          {st?.status === "available" && <button onClick={() => run("download", () => api.download(token()))} disabled={!!busy} className="rounded bg-brand-500 px-3 py-1.5 text-sm text-white">Download {st.available}</button>}
          {st?.status === "downloaded" && <button onClick={install} disabled={!!busy} className="rounded bg-brand-500 px-3 py-1.5 text-sm text-white">Back up &amp; install {st.available}</button>}
        </div>
        <p className="text-xs text-gray-500">Downloads are verified against the checksum published with the release. Update every PC (server and clients) to the same version.</p>
      </section>

      <section className="mt-6 max-w-xl rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Version history</h3>
        {(st?.history ?? []).length === 0 && <p className="text-sm text-gray-400">No updates installed yet.</p>}
        {(st?.history ?? []).map((h, i) => (
          <div key={i} className="flex justify-between border-b py-1 text-sm last:border-0 dark:border-gray-800">
            <span>{h.from} &rarr; {h.to}</span><span className="text-gray-500">{h.result} - {new Date(h.at).toLocaleString("en-IN")}</span>
          </div>
        ))}
        {prev && (
          <button onClick={() => { if (confirm(`Go back to version ${prev}?\n\nUse this only if the new version has a problem. Restore the pre-update backup afterwards if data looks wrong.`)) run("rollback", async () => { await api.rollback(token(), prev); }); }}
            disabled={!!busy} className="mt-3 rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700">Roll back to {prev}</button>
        )}
      </section>
    </div>
  );
}
