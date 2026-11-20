"use client";

import { useCallback, useEffect, useState } from "react";
import { portalApi, portalAuthHeader, setPortalToken } from "@/lib/portalApi";

type Company = {
  id: string;
  name: string;
  instituteName: string;
  email: string;
  contact: string;
  city: string;
  state: string;
  createdAt: string;
};

const EMPTY = {
  instituteName: "",
  name: "",
  email: "",
  password: "",
  contact: "",
  country: "India",
  state: "",
  city: "",
  zipCode: "",
  fullAddress: "",
  financialStartDate: "",
  financialEndDate: "",
};

const FIELDS: { key: keyof typeof EMPTY; label: string; type?: string; wide?: boolean }[] = [
  { key: "instituteName", label: "Company name" },
  { key: "name", label: "Contact person" },
  { key: "email", label: "Login username" },
  { key: "password", label: "Password (min 6)", type: "password" },
  { key: "contact", label: "Contact number" },
  { key: "country", label: "Country" },
  { key: "state", label: "State" },
  { key: "city", label: "City" },
  { key: "zipCode", label: "Zip code" },
  { key: "financialStartDate", label: "Financial year start", type: "date" },
  { key: "financialEndDate", label: "Financial year end", type: "date" },
  { key: "fullAddress", label: "Full address", wide: true },
];

const card = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900";
const input =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";

/** Master institute: list its companies, add new ones, and open one. Needs an active subscription. */
export default function PortalCompanies({ active, onSwitch }: { active: boolean; onSwitch: () => void }) {
  const [rows, setRows] = useState<Company[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await portalApi.get("/portal/companies", { headers: portalAuthHeader() });
      setRows(data);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      await portalApi.post("/portal/companies", form, { headers: portalAuthHeader() });
      setForm(EMPTY);
      setAdding(false);
      setMsg({ ok: true, text: "Company created. It can now sign in with its own username and password." });
      await load();
    } catch (err: any) {
      setMsg({ ok: false, text: err?.response?.data?.error || "Could not create the company" });
    } finally {
      setBusy(false);
    }
  };

  const open = async (id: string) => {
    try {
      const { data } = await portalApi.post(`/portal/companies/${id}/switch`, {}, { headers: portalAuthHeader() });
      setPortalToken(data.token);
      onSwitch();
    } catch (err: any) {
      setMsg({ ok: false, text: err?.response?.data?.error || "Could not open the company" });
    }
  };

  return (
    <div className="space-y-6">
      {msg && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            msg.ok
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          One subscription covers every company. Each company has its own database and login.
        </p>
        <button
          onClick={() => setAdding((v) => !v)}
          disabled={!active}
          title={active ? "" : "Activate a subscription first"}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {adding ? "Cancel" : "+ Add company"}
        </button>
      </div>
      {!active && (
        <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
          Pay for a plan first. Companies can be added only while your subscription is active.
        </p>
      )}

      {adding && (
        <form onSubmit={submit} className={`${card} grid gap-4 sm:grid-cols-2`}>
          {FIELDS.map((f) => (
            <label key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <span className="mb-1 block text-xs text-gray-500">{f.label} *</span>
              <input
                required
                type={f.type ?? "text"}
                autoComplete={f.type === "password" ? "new-password" : "off"}
                minLength={f.type === "password" ? 6 : undefined}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className={input}
              />
            </label>
          ))}
          <div className="sm:col-span-2">
            <button
              disabled={busy}
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Creating company..." : "Create company"}
            </button>
          </div>
        </form>
      )}

      <div className={`${card} overflow-x-auto p-0`}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
            <tr>
              {["Company", "Username", "Location", ""].map((h) => (
                <th key={h} className="px-5 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-5 py-3 font-medium">{c.instituteName}</td>
                <td className="px-5 py-3 text-gray-500">@{c.email}</td>
                <td className="px-5 py-3">{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => open(c.id)} className="text-sm font-medium text-brand-500 hover:underline">
                    Open
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                  No companies yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
