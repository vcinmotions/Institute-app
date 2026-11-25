"use client";

import { useCallback, useEffect, useState } from "react";
import { portalApi, portalAuthHeader } from "@/lib/portalApi";

type Dev = { id: string; deviceId: string; deviceName: string; os: string; status: string; activatedAt: string; lastVerifiedAt: string };
type Key = {
  id: string; key: string; instituteName: string; companyName: string; maxActivations: number; activatedPCs: number;
  transferLimit: number; transfersUsed: number; status: string; devices: Dev[];
};

const fmt = (d: string) => new Date(d).toLocaleString("en-IN");

/** Institute Super Admin: see activation keys and PCs, and deactivate an old PC to free its slot. */
export default function PortalDevices() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await portalApi.get("/portal/activation", { headers: portalAuthHeader() });
      setKeys(data.keys);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Could not load activation keys.");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const deactivate = async (d: Dev) => {
    if (!confirm(`Deactivate ${d.deviceName}? It will lose access at its next check and this counts as one device transfer.`)) return;
    setMsg("");
    try {
      await portalApi.post(`/portal/activation/devices/${d.id}/deactivate`, {}, { headers: portalAuthHeader() });
      await load();
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Could not deactivate.");
    }
  };

  return (
    <section className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold dark:text-white">Activation keys &amp; devices</h2>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      {keys.length === 0 && <p className="text-sm text-gray-500">No activation key has been issued for your institute yet. Contact support.</p>}
      {keys.map((k) => (
        <div key={k.id} className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <p className="font-mono font-semibold">{k.key}</p>
          <p className="text-sm text-gray-500">
            {k.instituteName} / {k.companyName} - {k.activatedPCs} of {k.maxActivations} PCs activated - device transfers {k.transfersUsed}/{k.transferLimit}
          </p>
          <table className="mt-2 w-full text-left text-xs">
            <thead className="text-gray-500"><tr><th>Device</th><th>Activated</th><th>Last verified</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {k.devices.map((d) => (
                <tr key={d.id} className="border-t dark:border-gray-800">
                  <td className="py-1">{d.deviceName}<div className="text-gray-400">{d.os}</div></td>
                  <td>{fmt(d.activatedAt)}</td>
                  <td>{fmt(d.lastVerifiedAt)}</td>
                  <td>{d.status}</td>
                  <td>{d.status === "ACTIVE" && <button className="underline" onClick={() => deactivate(d)}>Deactivate</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
