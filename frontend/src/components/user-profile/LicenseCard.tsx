"use client";
import { useDialog } from "@/components/common/AppDialog";
import { useCallback, useEffect, useState } from "react";
import { apiClient, publicApi } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";

type Sub = { mode: "ENABLED" | "STANDALONE" | null; status: string; locked: boolean; daysLeft: number | null; expiryDate: string | null; message: string };
type Keys = { serverKey: string | null; clientKey: string | null; company: string | null; institute: string | null; scope: string; activation: string };
type Dev = { id: string; deviceId: string; deviceName: string; os: string; status: "ACTIVE" | "REVOKED"; confirmedAt: string; lastSeenAt: string; lastIp: string | null };

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString("en-IN") : "-");

/**
 * Master admin, System Settings:
 *  - keys in use (build with SUBSCRIPTION_MODE=ENABLED): this company's Server key, Client key and the client PCs that confirmed it
 *  - local mode (anything else): how long the licence runs and a box for the portal's renewal code
 */
export default function LicenseCard() {
  const dialog = useDialog();
  const [sub, setSub] = useState<Sub | null>(null);
  const [keys, setKeys] = useState<Keys | null>(null);
  const [devices, setDevices] = useState<Dev[]>([]);
  const [pcId, setPcId] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const flash = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 6000); };

  const load = useCallback(async () => {
    try {
      const s = (await apiClient.get<Sub>("/subscription/me")).data;
      setSub(s);
      const st = (await publicApi.get("/device-activation/status")).data;
      setPcId(st?.device?.deviceId ?? "");
      if (s.mode === "ENABLED") {
        setKeys((await apiClient.get<Keys>("/license-keys")).data);
        setDevices((await apiClient.get("/client-devices")).data.devices);
      }
    } catch (e) { flash(false, getApiErrorMessage(e, "Could not load licence details.")); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const apply = async () => {
    try {
      await apiClient.post("/device-activation/apply-local-renewal", { code });
      setCode(""); flash(true, "Renewal applied."); await load();
    } catch (e) { flash(false, getApiErrorMessage(e)); }
  };
  const setStatus = async (d: Dev, status: "ACTIVE" | "REVOKED") => {
    if (status === "REVOKED" && !(await dialog.confirm({ title: `Block ${d.deviceName}?`, message: "It can no longer connect until you restore it.", confirmText: "Block", danger: true }))) return;
    await apiClient.put(`/client-devices/${d.id}`, { status }); await load();
  };
  const copy = (v?: string | null) => v && navigator.clipboard?.writeText(v).catch(() => {});

  if (!sub) return null;
  const box = "rounded border border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800/80 dark:bg-slate-900/10";

  if (sub.mode === "ENABLED") {
    return (
      <div className={box}>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Keys &amp; client PCs{keys?.company ? ` - ${keys.company}` : ""}</h4>
        {msg && <p className={`mt-1 text-xs ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>{msg.text}</p>}
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded border bg-white p-2 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <div className="text-slate-500">Server key (this computer)</div>
            <div className="flex items-center justify-between gap-2"><span className="font-mono">{keys?.serverKey ?? "-"}</span>{keys?.serverKey && <button className="underline" onClick={() => copy(keys.serverKey)}>Copy</button>}</div>
          </div>
          <div className="rounded border bg-white p-2 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <div className="text-slate-500">Client key (every other PC / laptop of this company)</div>
            <div className="flex items-center justify-between gap-2"><span className="font-mono">{keys?.clientKey ?? "-"}</span>{keys?.clientKey && <button className="underline" onClick={() => copy(keys.clientKey)}>Copy</button>}</div>
          </div>
        </div>
        <h5 className="mb-1 mt-4 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Client PCs connected ({devices.filter((d) => d.status === "ACTIVE").length})</h5>
        <div className="max-h-52 overflow-auto rounded border bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-[11px] dark:text-white">
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b last:border-0 dark:border-slate-800">
                  <td className="px-2 py-1">{d.deviceName}<div className="text-slate-400">{d.os}</div></td>
                  <td className="px-2 font-mono">{d.deviceId.slice(0, 10)}...</td>
                  <td className="px-2">Last seen {fmt(d.lastSeenAt)}<div className="text-slate-400">{d.lastIp ?? ""}</div></td>
                  <td className="px-2 text-right">
                    {d.status === "ACTIVE"
                      ? <button className="text-rose-600 underline" onClick={() => setStatus(d, "REVOKED")}>Block</button>
                      : <button className="underline" onClick={() => setStatus(d, "ACTIVE")}>Restore</button>}
                  </td>
                </tr>
              ))}
              {devices.length === 0 && <tr><td className="px-2 py-3 text-slate-400">No client PC has connected yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">Any number of PCs and laptops can use the Client key. Block a lost laptop here.</p>
      </div>
    );
  }

  return (
    <div className={box}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Licence (local mode)</h4>
      <p className="mt-0.5 text-[11px] text-slate-500">No activation keys are needed. The application runs for a fixed period from its first start, then becomes view-only until it is renewed.</p>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3 dark:text-white">
        <div className="rounded border bg-white p-2 dark:border-slate-800 dark:bg-slate-900"><div className="text-slate-500">Status</div><b>{sub.locked ? "View-only" : "Active"}</b></div>
        <div className="rounded border bg-white p-2 dark:border-slate-800 dark:bg-slate-900"><div className="text-slate-500">Valid until</div><b>{fmt(sub.expiryDate)}</b></div>
        <div className="rounded border bg-white p-2 dark:border-slate-800 dark:bg-slate-900"><div className="text-slate-500">Days left</div><b>{sub.daysLeft ?? "-"}</b></div>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{sub.message}</p>
      <div className="mt-3 space-y-2 text-xs">
        <div className="dark:text-white">PC id (give this to your provider to get a renewal code): <span className="font-mono">{pcId}</span> <button className="underline" onClick={() => copy(pcId)}>Copy</button></div>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={3} placeholder="Paste the renewal code here"
          className="w-full rounded border border-slate-300 p-2 font-mono text-[11px] dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        <button onClick={apply} disabled={!code.trim()} className="h-8 rounded bg-slate-900 px-4 text-[11px] font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-950">Apply renewal code</button>
        {msg && <p className={msg.ok ? "text-emerald-600" : "text-rose-600"}>{msg.text}</p>}
      </div>
    </div>
  );
}
