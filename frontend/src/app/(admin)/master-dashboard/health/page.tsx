"use client";

import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiClient } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";

type Health = any;

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString("en-IN") : "-");
const Dot = ({ ok }: { ok: boolean }) => (
  <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-500" : "bg-rose-500"}`} />
);
const Row = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 border-b py-1.5 text-sm last:border-0 dark:border-gray-800">
    <span className="text-gray-500">{k}</span>
    <span className="text-right font-medium dark:text-white">{children}</span>
  </div>
);
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">{title}</h3>
    {children}
  </section>
);

export default function SystemHealthPage() {
  const [h, setH] = useState<Health | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setH((await apiClient.get("/system/health")).data);
      setErr("");
    } catch (e) {
      setErr(getApiErrorMessage(e, "Could not read system health."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageBreadcrumb pageTitle="System Health" />
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">{h ? `Checked ${fmt(h.checkedAt)}` : ""}</p>
        <button onClick={load} disabled={loading} className="rounded border px-3 py-1 text-xs dark:border-gray-700 dark:text-white">{loading ? "Checking..." : "Re-check"}</button>
      </div>
      {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
      {h && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Server & database">
            <Row k="Local server"><Dot ok={h.server.ok} />Running (up {Math.round(h.server.uptimeSeconds / 60)} min)</Row>
            <Row k="Central database"><Dot ok={h.database.central.ok} />{h.database.central.ok ? `Connected (${h.database.central.ms} ms)` : h.database.central.error}</Row>
            {h.database.institutes.map((i: any) => (
              <Row key={i.name} k={`Database: ${i.name}`}><Dot ok={i.ok} />{i.ok ? `Connected (${i.ms} ms)` : i.error}</Row>
            ))}
            <Row k="Database version">{h.database.version}</Row>
            <Row k="Application version">{h.app.version}</Row>
          </Card>

          <Card title="Subscription & licence">
            <Row k="Mode">{h.app.mode === "STANDALONE" ? "Standalone (local, 364-day licence)" : h.app.mode === "ENABLED" ? "Subscription validation" : "Unmanaged"}</Row>
            <Row k="Subscription status"><Dot ok={!h.subscription.locked} />{h.subscription.status}</Row>
            <Row k="Expiry date">{fmt(h.subscription.expiryDate)}{h.subscription.daysLeft !== null && h.subscription.daysLeft !== undefined ? ` (${h.subscription.daysLeft} days)` : ""}</Row>
            <Row k="Last licence verification">{fmt(h.subscription.lastLicenseVerification)}</Row>
          </Card>

          <Card title="Activation & device">
            <Row k="Activation"><Dot ok={h.activation.status === "ACTIVATED"} />{h.activation.status}</Row>
            <Row k="Institute / company">{h.activation.institute ?? "-"} / {h.activation.company ?? "-"}</Row>
            <Row k="Activated on">{fmt(h.activation.activatedAt)}</Row>
            <Row k="This PC">{h.activation.device.deviceName}</Row>
            <Row k="Device ID"><span className="font-mono text-xs">{h.activation.device.deviceId}</span></Row>
          </Card>

          <Card title="Backup & network">
            <Row k="Last successful backup"><Dot ok={!h.backup.openFailure} />{fmt(h.backup.lastSuccess?.at)}</Row>
            {h.backup.openFailure && <Row k="Backup problem"><span className="text-rose-600">{h.backup.openFailure.error}</span></Row>}
            <Row k="Automatic backup">{h.backup.enabled ? "On" : "Off"}</Row>
            <Row k="Internet"><Dot ok={h.network.internet} />{h.network.internet ? "Reachable" : "Not reachable"}</Row>
            <Row k="Operating mode">{h.network.operatingMode}</Row>
          </Card>
        </div>
      )}
    </div>
  );
}
