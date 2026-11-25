"use client";

import DateTimeField from "@/components/form/DateTimeField";
import { USER_TIERS, DEFAULT_TIER_MULTIPLIERS, tierLabel } from "@/lib/userTiers";
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
  tierPrices?: Record<string, number | string>;
};

type Institute = {
  tenantId: string;
  instituteName: string;
  name: string;
  email: string | null;
  businessEmail: string | null;
  contact: string;
  city: string;
  state: string;
  createdAt: string;
  plan: string | null;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "REVOKED" | "NOT_SUBSCRIBED";
  startDate: string | null;
  expiryDate: string | null;
  totalPaid: number;
  isCompany?: boolean;
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  EXPIRED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  SUSPENDED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  REVOKED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  NOT_SUBSCRIBED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  SUSPENDED: "Suspended",
  REVOKED: "Revoked",
  NOT_SUBSCRIBED: "Registered only",
};
const EXPIRING_DAYS = 10;
const daysLeft = (d: string | null) =>
  d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null;
const isExpiringSoon = (i: Institute) => {
  const left = daysLeft(i.expiryDate);
  return i.status === "ACTIVE" && left !== null && left >= 0 && left <= EXPIRING_DAYS;
};
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

type Settings = {
  announcementActive: boolean;
  announcementText: string;
  supportEmail: string;
  supportPhone: string;
  renewalReminderDays: number;
  minAppVersion: string;
  userTierMultipliers?: Record<string, number>;
};

// "2026-11-23T14:30" (local time) <-> ISO, for the date-time picker.
const toLocalInput = (iso: string | null) => {
  const d = iso ? new Date(iso) : new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const addMonthsTo = (local: string, months: number) => {
  const base = new Date(local);
  const from = isNaN(+base) || +base < Date.now() ? new Date() : base; // extend from the later of now / current expiry
  from.setMonth(from.getMonth() + months);
  return toLocalInput(from.toISOString());
};

/** Popup: make an institute active / inactive and set its expiry date and time. */
function ManageInstituteModal({
  inst,
  onClose,
  onSaved,
}: {
  inst: Institute;
  onClose: () => void;
  onSaved: (patch: Partial<Institute>) => void;
}) {
  const [active, setActive] = useState(inst.status === "ACTIVE" || inst.status === "EXPIRED" ? inst.status === "ACTIVE" : false);
  const [expiry, setExpiry] = useState(toLocalInput(inst.expiryDate && new Date(inst.expiryDate) > new Date() ? inst.expiryDate : null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (isNaN(+new Date(expiry))) return setError("Enter a valid expiry date and time.");
    if (active && new Date(expiry) <= new Date()) return setError("To make an institute active, pick an expiry in the future.");
    setBusy(true);
    try {
      const { data } = await saasApi.put(`/saas/institutes/${inst.tenantId}/subscription`, {
        status: active ? "ACTIVE" : "SUSPENDED",
        expiryDate: new Date(expiry).toISOString(),
      });
      onSaved(data);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={`${card} w-full max-w-md`} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">{inst.name || inst.instituteName}</h3>
        <p className="text-xs text-gray-500">@{inst.email}</p>

        <p className="mt-5 text-sm font-medium">Status</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { v: true, label: "Active", hint: "App works normally", on: "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10" },
            { v: false, label: "Inactive", hint: "App becomes view-only", on: "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setActive(o.v)}
              className={`rounded-lg border px-3 py-2 text-left text-sm ${active === o.v ? o.on : "border-gray-200 dark:border-gray-700"}`}
            >
              <b className="block">{o.label}</b>
              <span className="text-xs opacity-80">{o.hint}</span>
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm font-medium">
          Expiry date and time
          <DateTimeField value={expiry} onChange={(v) => setExpiry(v)} />
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ["+1 month", 1],
            ["+3 months", 3],
            ["+6 months", 6],
            ["+1 year", 12],
          ].map(([label, m]) => (
            <button
              key={String(label)}
              type="button"
              onClick={() => setExpiry(addMonthsTo(expiry, Number(m)))}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:border-brand-500 hover:text-brand-500 dark:border-gray-700"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          The desktop app picks the change up at its next licence check, within a few minutes while it is online.
        </p>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300">
            Cancel
          </button>
          <button onClick={save} disabled={busy} className={btn}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const input =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const card =
  "rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 dark:text-white";
const btn =
  "rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50";

export default function SaasDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"institutes" | "plans" | "settings">("institutes");
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [who, setWho] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [managing, setManaging] = useState<Institute | null>(null);

  useEffect(() => {
    if (!getSaasToken()) {
      router.replace("/saas/login");
      return;
    }
    // The institutes list is optional: if it fails, keep the session and show a message.
    const institutesReq = saasApi
      .get("/saas/institutes")
      .then((r) => r.data as Institute[])
      .catch(() => {
        setMsg("Could not load the institutes list.");
        return [] as Institute[];
      });
    Promise.all([saasApi.get("/saas/me"), saasApi.get("/saas/plans"), saasApi.get("/saas/settings"), institutesReq])
      .then(([me, p, s, i]) => {
        setInstitutes(i);
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
      await saasApi.put(`/saas/plans/${p.code}`, { price: Number(p.price), active: p.active, tierPrices: p.tierPrices ?? {} });
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
      <div className={`mx-auto space-y-6 ${tab === "institutes" ? "max-w-6xl" : "max-w-3xl"}`}>
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold dark:text-white">SaaS Admin</h1>
            <p className="text-sm text-gray-500">{who}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/saas/keys" className="text-sm text-gray-500 underline">Activation keys</a>
            <button onClick={logout} className="text-sm text-gray-500 underline">
              Sign out
            </button>
          </div>
        </header>

        <nav className="flex gap-2">
          {(["institutes", "plans", "settings"] as const).map((t) => (
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
              {t === "institutes" ? "Institutes" : t === "plans" ? "Subscription plans" : "Global settings"}
            </button>
          ))}
        </nav>

        {tab === "institutes" && (() => {
          const q = search.trim().toLowerCase();
          const shown = institutes
            .filter(
            (i) =>
              (filter === "ALL" ||
                (filter === "EXPIRING" ? isExpiringSoon(i) : i.status === filter)) &&
              (!q ||
                [i.instituteName, i.name, i.email, i.businessEmail, i.contact, i.city]
                  .filter(Boolean)
                  .some((v) => String(v).toLowerCase().includes(q))),
            )
            .sort((a, b) =>
              filter === "EXPIRING"
                ? new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime()
                : 0,
            );
          const count = (st: string) => institutes.filter((i) => i.status === st).length;
          const revenue = institutes.reduce((a, i) => a + i.totalPaid, 0);
          const stats = [
            ["Registered", institutes.length],
            ["Active", count("ACTIVE")],
            ["Expiring in 10 days", institutes.filter(isExpiringSoon).length],
            ["Expired", count("EXPIRED")],
            ["Registered only", count("NOT_SUBSCRIBED")],
            ["Revenue (₹)", revenue.toLocaleString("en-IN")],
          ];
          return (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                {stats.map(([label, value]) => (
                  <div key={label} className={card}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search institute, name, email, contact, city"
                  className={`${input} mt-0 flex-1`}
                />
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${input} mt-0 sm:w-48`}>
                  <option value="ALL">All statuses</option>
                  <option value="EXPIRING">Expiring in {EXPIRING_DAYS} days</option>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className={`${card} overflow-x-auto p-0`}>
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
                    <tr>
                      {["Institute", "Contact", "Location", "Registered", "Plan", "Status", "Expires", "Paid (₹)", ""].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((i) => (
                      <tr key={i.tenantId} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                        <td className="px-4 py-3">
                          <p className="font-medium">{i.name || i.instituteName}</p>
                          <p className="text-xs text-gray-500">@{i.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p>{i.businessEmail || "—"}</p>
                          <p className="text-xs text-gray-500">{i.contact}</p>
                        </td>
                        <td className="px-4 py-3">{[i.city, i.state].filter(Boolean).join(", ") || "—"}</td>
                        <td className="px-4 py-3">{fmtDate(i.createdAt)}</td>
                        <td className="px-4 py-3">{i.plan ? i.plan.replace("_", " ") : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[i.status]}`}>
                            {STATUS_LABEL[i.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {fmtDate(i.expiryDate)}
                          {isExpiringSoon(i) && (
                            <p className="text-xs font-medium text-orange-600">
                              {daysLeft(i.expiryDate) === 0 ? "Expires today" : `${daysLeft(i.expiryDate)} day(s) left`}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">{i.totalPaid ? i.totalPaid.toLocaleString("en-IN") : "—"}</td>
                        <td className="px-4 py-3 text-right">
                          {i.isCompany ? (
                            <span className="text-xs text-gray-400" title="Follows its master institute">Company</span>
                          ) : (
                            <button onClick={() => setManaging(i)} className="text-sm font-medium text-brand-500 hover:underline">
                              Manage
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {shown.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                          No institutes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}

        {managing && (
          <ManageInstituteModal
            inst={managing}
            onClose={() => setManaging(null)}
            onSaved={(patch) => {
              setInstitutes((list) => list.map((x) => (x.tenantId === managing.tenantId ? { ...x, ...patch } : x)));
              setMsg(`${managing.name || managing.instituteName} updated`);
            }}
          />
        )}

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
              <p className="mb-3 text-xs text-gray-500">
                Set the price for each login count (maximum people signed in at the same time). Leave a
                box blank to use the automatic price: the 1-login price × the standard multiplier for that login count.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {USER_TIERS.map((n) => {
                  const mult = settings?.userTierMultipliers?.[String(n)] ?? DEFAULT_TIER_MULTIPLIERS[String(n)] ?? 1;
                  const auto = Math.round(Number(p.price || 0) * mult * 100) / 100;
                  return (
                    <label key={n} className="text-sm">
                      {tierLabel(n)} ({p.currency})
                      <input
                        type="number"
                        min={0}
                        value={n === 1 ? p.price : p.tierPrices?.[String(n)] ?? ""}
                        placeholder={n === 1 ? "" : `Auto: ${auto}`}
                        onChange={(e) =>
                          n === 1
                            ? changePlan(p.code, { price: e.target.value as any })
                            : changePlan(p.code, { tierPrices: { ...(p.tierPrices ?? {}), [String(n)]: e.target.value } })
                        }
                        className={input}
                      />
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end">
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
