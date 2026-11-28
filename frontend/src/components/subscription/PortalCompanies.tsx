"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { City, Country, State } from "country-state-city";
import Select from "@/components/form/Select";
import { portalApi, portalAuthHeader } from "@/lib/portalApi";

type Company = {
  id: string;
  name: string;
  instituteName: string;
  contact: string;
  isMaster?: boolean;
  city: string;
  state: string;
  country?: string;
  zipCode?: string;
  fullAddress?: string;
  createdAt: string;
};

const EMPTY = {
  instituteName: "",
  name: "",
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
export default function PortalCompanies({ active }: { active: boolean; onSwitch?: () => void }) {
  const [rows, setRows] = useState<Company[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  /** Update a field and clear its error (plus dependent location fields). */
  const setField = (key: keyof typeof EMPTY, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      // changing a parent clears the dependent fields
      ...(key === "country" ? { state: "", city: "" } : {}),
      ...(key === "state" ? { city: "" } : {}),
    }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Country -> State -> City chain: each list depends on the one before it.
  const countries = useMemo(() => Country.getAllCountries(), []);
  const countryIso = countries.find((c) => c.name === form.country)?.isoCode ?? "";
  const states = useMemo(() => (countryIso ? State.getStatesOfCountry(countryIso) : []), [countryIso]);
  const stateIso = states.find((s) => s.name === form.state)?.isoCode ?? "";
  const cities = useMemo(
    () => (countryIso && stateIso ? City.getCitiesOfState(countryIso, stateIso) : []),
    [countryIso, stateIso],
  );

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

  const validate = () => {
    const errs: Partial<Record<keyof typeof EMPTY, string>> = {};
    for (const f of FIELDS) {
      if (editingId && (f.key === "financialStartDate" || f.key === "financialEndDate")) continue;
      if (!String(form[f.key] ?? "").trim()) {
        const isPick = f.key === "country" || f.key === "state" || f.key === "city";
        errs[f.key] = `${isPick ? "Please select" : "Please enter"} ${f.label.toLowerCase()}.`;
      }
    }
    const digits = form.contact.replace(/\D/g, "");
    if (!errs.contact && (digits.length < 8 || digits.length > 15)) {
      errs.contact = "Enter a valid contact number (8 to 15 digits).";
    }
    if (
      !editingId &&
      !errs.financialStartDate &&
      !errs.financialEndDate &&
      new Date(form.financialEndDate) <= new Date(form.financialStartDate)
    ) {
      errs.financialEndDate = "Financial year end must be after the start date.";
    }
    return errs;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      setMsg({ ok: false, text: "Please fix the highlighted fields." });
      return;
    }
    setBusy(true);
    try {
      if (editingId) {
        await portalApi.put(`/portal/companies/${editingId}`, form, { headers: portalAuthHeader() });
        setMsg({ ok: true, text: "Company details updated." });
      } else {
        await portalApi.post("/portal/companies", form, { headers: portalAuthHeader() });
        setMsg({ ok: true, text: "Company created. Assign it to users from the Users screen in the desktop app." });
      }
      setForm(EMPTY);
      setAdding(false);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setMsg({
        ok: false,
        text: err?.response?.data?.error || (editingId ? "Could not update the company." : "Could not create the company."),
      });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (c: Company) => {
    setForm({
      ...EMPTY,
      instituteName: c.instituteName,
      name: c.name,
      contact: c.contact,
      country: c.country || "India",
      state: c.state,
      city: c.city,
      zipCode: c.zipCode ?? "",
      fullAddress: c.fullAddress ?? "",
    });
    setEditingId(c.id);
    setAdding(true);
    setMsg(null);
    setErrors({});
  };

  const toggleForm = () => {
    setErrors({});
    if (adding) setEditingId(null);
    else setForm(EMPTY);
    setAdding((v) => !v);
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
          One subscription covers every company. All companies share one institute database and the same user accounts; give each user access to the companies they need.
        </p>
        <button
          onClick={toggleForm}
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
        <form noValidate onSubmit={submit} className={`${card} grid gap-4 sm:grid-cols-2`}>
          {editingId && (
            <p className="text-sm text-gray-500 sm:col-span-2">
              Editing <b>{form.instituteName}</b>. The financial year is set when the company is created.
            </p>
          )}
          {FIELDS.filter(
            (f) =>
              !editingId ||
              !["financialStartDate", "financialEndDate"].includes(f.key),
          ).map((f) => {
            if (f.key === "country" || f.key === "state" || f.key === "city") {
              const opts =
                f.key === "country"
                  ? countries.map((c) => ({ label: c.name, value: c.name }))
                  : f.key === "state"
                    ? states.map((s) => ({ label: s.name, value: s.name }))
                    : cities.map((c) => ({ label: c.name, value: c.name }));
              const placeholder =
                f.key === "state" && !countryIso
                  ? "Select country first"
                  : f.key === "city" && !stateIso
                    ? "Select state first"
                    : `Select ${f.label.toLowerCase()}`;
              return (
                <div key={f.key}>
                  <span className="mb-1 block text-xs text-gray-500">{f.label} *</span>
                  <Select
                    searchable
                    options={opts}
                    placeholder={placeholder}
                    value={form[f.key]}
                    disabled={(f.key === "state" && !countryIso) || (f.key === "city" && !stateIso)}
                    onChange={(v) => setField(f.key, v)}
                  />
                  {errors[f.key] && <span className="mt-1 block text-xs text-red-600">{errors[f.key]}</span>}
                </div>
              );
            }
            return (
            <label key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <span className="mb-1 block text-xs text-gray-500">{f.label} *</span>
              <input
                type={f.key === "contact" ? "tel" : (f.type ?? "text")}
                autoComplete="off"
                value={form[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                aria-invalid={!!errors[f.key]}
                className={`${input} ${errors[f.key] ? "border-red-500 dark:border-red-500" : ""}`}
              />
              {errors[f.key] && <span className="mt-1 block text-xs text-red-600">{errors[f.key]}</span>}
            </label>
            );
          })}
          <div className="sm:col-span-2">
            <button
              disabled={busy}
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? (editingId ? "Saving..." : "Creating company...") : editingId ? "Save changes" : "Create company"}
            </button>
          </div>
        </form>
      )}

      <div className={`${card} overflow-x-auto p-0`}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
            <tr>
              {["Company", "Contact person", "Location", ""].map((h) => (
                <th key={h} className="px-5 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-5 py-3 font-medium">
                  {c.instituteName}
                  {c.isMaster && (
                    <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/10">
                      Primary
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">{c.name}</td>
                <td className="px-5 py-3">{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => startEdit(c)} className="text-sm font-medium text-brand-500 hover:underline">
                    Edit
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
