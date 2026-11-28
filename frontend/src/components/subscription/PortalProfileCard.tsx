"use client";

import { useState } from "react";
import { portalApi, portalAuthHeader } from "@/lib/portalApi";

export type PortalProfile = {
  instituteName: string;
  name: string;
  businessEmail: string | null;
  contact: string;
  fullAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  createdAt: string;
} | null;

const card = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900";
const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PortalProfileCard({
  profile,
  email,
  onSaved,
}: {
  profile: PortalProfile;
  email: string;
  onSaved: () => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [f, setF] = useState({
    name: "", businessEmail: "", contact: "", fullAddress: "", city: "", state: "", country: "", zipCode: "",
  });

  const startEdit = () => {
    setF({
      name: profile?.name ?? "",
      businessEmail: profile?.businessEmail ?? "",
      contact: profile?.contact ?? "",
      fullAddress: profile?.fullAddress ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      country: profile?.country ?? "",
      zipCode: profile?.zipCode ?? "",
    });
    setError("");
    setNotice("");
    setEditing(true);
  };

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const v = Object.fromEntries(Object.entries(f).map(([k, val]) => [k, val.trim()])) as typeof f;
    if (!v.name || !v.contact || !v.fullAddress || !v.city || !v.state || !v.country || !v.zipCode) {
      return setError("Please fill in all fields.");
    }
    if (!EMAIL_RE.test(v.businessEmail)) return setError("Please enter a valid business email.");
    setSaving(true);
    try {
      await portalApi.put("/portal/profile", v, { headers: portalAuthHeader() });
      await onSaved();
      setEditing(false);
      setNotice("Institute details updated.");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    const rows: [string, string | null | undefined][] = [
      ["Institute name", profile?.instituteName],
      ["Display name", profile?.name],
      ["Username", email],
      ["Business email", profile?.businessEmail],
      ["Contact", profile?.contact],
      ["Registered on", fmtDate(profile?.createdAt)],
      [
        "Address",
        [profile?.fullAddress, profile?.city, profile?.state, profile?.country, profile?.zipCode].filter(Boolean).join(", "),
      ],
    ];
    return (
      <div className={card}>
        <div className="mb-4 flex items-center justify-between">
          {notice ? <p className="text-sm text-green-600">{notice}</p> : <span />}
          <button
            onClick={startEdit}
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Edit details
          </button>
        </div>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className={label === "Address" ? "sm:col-span-2" : ""}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="mt-0.5 font-medium">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  const fixed: [string, string | null | undefined][] = [
    ["Institute name", profile?.instituteName],
    ["Username", email],
    ["Registered on", fmtDate(profile?.createdAt)],
  ];

  return (
    <form onSubmit={save} className={card}>
      <dl className="mb-2 grid gap-x-8 gap-y-4 sm:grid-cols-3">
        {fixed.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="mt-0.5 font-medium">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mb-5 text-xs text-gray-500">Institute name and username cannot be changed here.</p>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <label className="text-xs text-gray-500">Display name
          <input className={inputCls} value={f.name} onChange={set("name")} />
        </label>
        <label className="text-xs text-gray-500">Business email
          <input type="email" className={inputCls} value={f.businessEmail} onChange={set("businessEmail")} />
        </label>
        <label className="text-xs text-gray-500">Contact
          <input className={inputCls} value={f.contact} onChange={set("contact")} />
        </label>
        <label className="text-xs text-gray-500">Zip code
          <input className={inputCls} value={f.zipCode} onChange={set("zipCode")} />
        </label>
        <label className="text-xs text-gray-500 sm:col-span-2">Address
          <textarea rows={2} className={inputCls} value={f.fullAddress} onChange={set("fullAddress")} />
        </label>
        <label className="text-xs text-gray-500">City
          <input className={inputCls} value={f.city} onChange={set("city")} />
        </label>
        <label className="text-xs text-gray-500">State
          <input className={inputCls} value={f.state} onChange={set("state")} />
        </label>
        <label className="text-xs text-gray-500">Country
          <input className={inputCls} value={f.country} onChange={set("country")} />
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
