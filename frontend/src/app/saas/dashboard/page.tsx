"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saasApi, getSaasToken, setSaasToken } from "@/lib/saasApi";

type Plan = {
  code: string;
  name: string;
  months: number;
  price: number;
  currency: string;
  active: boolean;
};

type Settings = {
  announcementActive: boolean;
  announcementText: string;
  supportEmail: string;
  supportPhone: string;
  renewalReminderDays: number;
  minAppVersion: string;
};

const input =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const card =
  "rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 dark:text-white";
const btn =
  "rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50";

export default function SaasDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"plans" | "settings">("plans");
  const [who, setWho] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!getSaasToken()) {
      router.replace("/saas/login");
      return;
    }
    Promise.all([saasApi.get("/saas/me"), saasApi.get("/saas/plans"), saasApi.get("/saas/settings")])
      .then(([me, p, s]) => {
        setWho(me.data.email);
        setPlans(p.data);
        setSettings(s.data);
      })
      .catch(() => {
        setSaasToken(null);
        router.replace("/saas/login");
      });
  }, [router]);

  const logout = () => {
    setSaasToken(null);
    router.replace("/saas/login");
  };

  const changePlan = (code: string, patch: Partial<Plan>) =>
    setPlans((ps) => ps.map((p) => (p.code === code ? { ...p, ...patch } : p)));

  const savePlan = async (p: Plan) => {
    setSaving(p.code);
    setMsg("");
    try {
      await saasApi.put(`/saas/plans/${p.code}`, { price: Number(p.price), active: p.active });
      setMsg(`${p.name} saved`);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Save failed");
    } finally {
      setSaving(null);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving("settings");
    setMsg("");
    try {
      const { data } = await saasApi.put("/saas/settings", settings);
      setSettings(data);
      setMsg("Settings saved. EXE clients pick them up on their next sync.");
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "Save failed");
    } finally {
      setSaving(null);
    }
  };

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setSettings((s) => (s ? { ...s, [k]: v } : s));

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold dark:text-white">SaaS Admin</h1>
            <p className="text-sm text-gray-500">{who}</p>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 underline">
            Sign out
          </button>
        </header>

        <nav className="flex gap-2">
          {(["plans", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setMsg("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                tab === t
                  ? "bg-brand-500 text-white"
                  : "bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {t === "plans" ? "Subscription plans" : "Global settings"}
            </button>
          ))}
        </nav>

        {tab === "plans" &&
          plans.map((p) => (
            <div key={p.code} className={card}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {p.name} <span className="text-sm text-gray-500">({p.months} months)</span>
                </h3>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={(e) => changePlan(p.code, { active: e.target.checked })}
                  />
                  Show on website
                </label>
              </div>
              <div className="flex items-end gap-3">
                <label className="flex-1 text-sm">
                  Price ({p.currency})
                  <input
                    type="number"
                    min={0}
                    value={p.price}
                    onChange={(e) => changePlan(p.code, { price: e.target.value as any })}
                    className={input}
                  />
                </label>
                <button onClick={() => savePlan(p)} disabled={saving === p.code} className={btn}>
                  {saving === p.code ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ))}

        {tab === "settings" && settings && (
          <div className={`${card} space-y-4`}>
            <p className="text-sm text-gray-500">
              These settings apply to every installed EXE. Clients receive them whenever they sync
              online and keep the last copy for offline use.
            </p>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.announcementActive}
                onChange={(e) => set("announcementActive", e.target.checked)}
              />
              Show announcement banner in the app
            </label>
            <label className="block text-sm">
              Announcement text
              <textarea
                rows={2}
                maxLength={500}
                value={settings.announcementText}
                onChange={(e) => set("announcementText", e.target.value)}
                className={input}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Support email
                <input
                  value={settings.supportEmail}
                  onChange={(e) => set("supportEmail", e.target.value)}
                  className={input}
                />
              </label>
              <label className="text-sm">
                Support phone
                <input
                  value={settings.supportPhone}
                  onChange={(e) => set("supportPhone", e.target.value)}
                  className={input}
                />
              </label>
              <label className="text-sm">
                Renewal reminder (days before expiry)
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={settings.renewalReminderDays}
                  onChange={(e) => set("renewalReminderDays", Number(e.target.value))}
                  className={input}
                />
              </label>
              <label className="text-sm">
                Minimum app version (e.g. 1.0.13)
                <input
                  value={settings.minAppVersion}
                  onChange={(e) => set("minAppVersion", e.target.value)}
                  className={input}
                />
              </label>
            </div>

            <button onClick={saveSettings} disabled={saving === "settings"} className={btn}>
              {saving === "settings" ? "Saving..." : "Save settings"}
            </button>
          </div>
        )}

        {msg && <p className="text-sm text-gray-700 dark:text-gray-300">{msg}</p>}
      </div>
    </main>
  );
}
