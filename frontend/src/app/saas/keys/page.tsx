"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { saasApi, getSaasToken } from "@/lib/saasApi";

type Dev = { id: string; deviceId: string; deviceName: string; os: string; status: string; activatedAt: string; lastVerifiedAt: string };
type Key = {
  id: string; key: string; kind?: "SERVER" | "CLIENT" | "INSTITUTE"; unlimited?: boolean; instituteName: string; companyName: string; maxActivations: number; activatedPCs: number;
  transferLimit: number; transfersUsed: number; status: string; devices: Dev[];
};
type Inst = { tenantId: string; instituteName: string; name: string; isCompany?: boolean };

const fmt = (d: string) => new Date(d).toLocaleString("en-IN");

export default function ActivationKeysPage() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [insts, setInsts] = useState<Inst[]>([]);
  const [form, setForm] = useState({ tenantId: "", companyName: "", maxActivations: 1, transferLimit: 3 });
  const [msg, setMsg] = useState("");
  const [rc, setRc] = useState({ deviceId: "", months: 6, code: "" });
  const makeCode = async () => {
    setMsg("");
    try { const { data } = await saasApi.post("/saas/local-renewal", { deviceId: rc.deviceId.trim(), months: rc.months }); setRc((r) => ({ ...r, code: data.code })); }
    catch (e: any) { setMsg(e?.response?.data?.error || "Could not make the code"); }
  };

  const load = useCallback(async () => {
    try {
      const [k, i] = await Promise.all([saasApi.get("/saas/activation-keys"), saasApi.get("/saas/institutes")]);
      setKeys(k.data.keys);
      setInsts((i.data.institutes ?? i.data) as Inst[]);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Could not load. Please sign in at /saas/login.");
    }
  }, []);

  useEffect(() => {
    if (getSaasToken()) load();
    else setMsg("Please sign in at /saas/login first.");
  }, [load]);

  const create = async () => {
    setMsg("");
    try {
      await saasApi.post("/saas/activation-keys", form);
      await load();
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Could not create key");
    }
  };
  const setDevice = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    try {
      await saasApi.put(`/saas/activation-devices/${id}`, { status });
      await load();
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Failed");
    }
  };
  const patchKey = async (id: string, body: any) => {
    await saasApi.put(`/saas/activation-keys/${id}`, body);
    await load();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Activation Keys &amp; Devices</h1>
          <Link href="/saas/dashboard" className="text-sm underline">Back to SaaS Admin</Link>
        </header>
        {msg && <p className="text-sm text-red-600">{msg}</p>}

        <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
          <h2 className="mb-3 font-medium">Create keys for an institute</h2>
          <div className="grid gap-3 md:grid-cols-5">
            <select className="rounded border p-2 text-sm dark:bg-gray-800" value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })}>
              <option value="">Select institute / company</option>
              {insts.map((i) => (
                <option key={i.tenantId} value={i.tenantId}>{i.instituteName}{i.isCompany ? ` - ${i.name}` : ""}</option>
              ))}
            </select>
            <input className="rounded border p-2 text-sm dark:bg-gray-800" placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <input type="number" min={1} className="rounded border p-2 text-sm dark:bg-gray-800" title="Total allowed activations" value={form.maxActivations} onChange={(e) => setForm({ ...form, maxActivations: Number(e.target.value) })} />
            <input type="number" min={0} className="rounded border p-2 text-sm dark:bg-gray-800" title="PC transfer limit" value={form.transferLimit} onChange={(e) => setForm({ ...form, transferLimit: Number(e.target.value) })} />
            <button onClick={create} disabled={!form.tenantId} className="rounded bg-brand-500 px-3 py-2 text-sm text-white disabled:opacity-50">Create / show keys</button>
          </div>
          <p className="mt-2 text-xs text-gray-500">Every institute gets ONE activation key, created automatically. It activates the server PC of every company and is typed on every client PC / laptop. PCs are unlimited unless you use &quot;Set PC limit&quot; on the key. This button makes the key if it is missing.</p>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
          <h2 className="mb-3 font-medium">Renewal code (local mode, no keys)</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <input className="rounded border p-2 text-sm font-mono md:col-span-2 dark:bg-gray-800" placeholder="PC id from the customer's System Settings" value={rc.deviceId} onChange={(e) => setRc({ ...rc, deviceId: e.target.value })} />
            <input type="number" min={1} max={60} className="rounded border p-2 text-sm dark:bg-gray-800" title="Months to add" value={rc.months} onChange={(e) => setRc({ ...rc, months: Number(e.target.value) })} />
            <button onClick={makeCode} disabled={!rc.deviceId.trim()} className="rounded bg-brand-500 px-3 py-2 text-sm text-white disabled:opacity-50">Make code</button>
          </div>
          {rc.code && <textarea readOnly rows={3} value={rc.code} onFocus={(e) => e.currentTarget.select()} className="mt-3 w-full rounded border p-2 font-mono text-[11px] dark:bg-gray-800" />}
          <p className="mt-2 text-xs text-gray-500">The code works once, only on that PC, and adds the months to its current end date.</p>
        </section>

        {keys.map((k) => (
          <section key={k.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-base font-semibold"><span className="mr-2 rounded bg-gray-100 px-1.5 py-0.5 font-sans text-[10px] dark:bg-gray-800">{k.kind === "INSTITUTE" ? "INSTITUTE" : k.kind === "CLIENT" ? "CLIENT (old)" : "SERVER (old)"}</span>{k.key} {k.status !== "ACTIVE" && <span className="text-red-600">({k.status})</span>}</p>
                <p className="text-sm text-gray-500">{k.instituteName} / {k.companyName}</p>
              </div>
              <div className="text-right text-sm">
                <p>{k.kind === "CLIENT" ? "Unlimited client PCs (checked by each company server)" : k.kind === "INSTITUTE" ? `${k.activatedPCs} server PC(s) / ${k.maxActivations ? k.maxActivations : "unlimited"}; client PCs unlimited; transfers ${k.transfersUsed}/${k.transferLimit}` : `${k.activatedPCs} / ${k.maxActivations} server PC activated, transfers ${k.transfersUsed}/${k.transferLimit}`}</p>
                <div className="mt-1 flex justify-end gap-3">
                  {k.kind === "INSTITUTE" && (
                    <button
                      className="underline"
                      onClick={() => {
                        const v = window.prompt("Maximum server PCs for this key (0 = unlimited):", String(k.maxActivations ?? 0));
                        if (v !== null && /^\d+$/.test(v.trim())) patchKey(k.id, { maxActivations: Number(v.trim()) });
                      }}
                    >
                      Set PC limit
                    </button>
                  )}
                  <button className="underline" onClick={() => patchKey(k.id, { status: k.status === "ACTIVE" ? "REVOKED" : "ACTIVE" })}>{k.status === "ACTIVE" ? "Revoke key" : "Restore key"}</button>
                </div>
              </div>
            </div>
            <table className="mt-3 w-full text-left text-xs">
              <thead className="text-gray-500"><tr><th>Device</th><th>Device ID</th><th>Activated</th><th>Last verified</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {k.devices.map((d) => (
                  <tr key={d.id} className="border-t dark:border-gray-800">
                    <td className="py-1">{d.deviceName}<div className="text-gray-400">{d.os}</div></td>
                    <td className="font-mono">{d.deviceId.slice(0, 12)}...</td>
                    <td>{fmt(d.activatedAt)}</td>
                    <td>{fmt(d.lastVerifiedAt)}</td>
                    <td>{d.status}</td>
                    <td><button className="underline" onClick={() => setDevice(d.id, d.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}>{d.status === "ACTIVE" ? "Deactivate" : "Reactivate"}</button></td>
                  </tr>
                ))}
                {k.devices.length === 0 && <tr><td colSpan={6} className="py-2 text-gray-400">{k.kind === "CLIENT" ? "Client PCs are managed on each company server." : "No server has activated this key yet."}</td></tr>}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </main>
  );
}
