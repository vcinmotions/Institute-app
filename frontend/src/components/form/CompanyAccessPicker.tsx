"use client";

import { useEffect, useState } from "react";
import { fetchMyCompanies } from "@/lib/api";
import Select from "./Select";
import Label from "./Label";

export type CompanyAssignment = { companyId: string; role: string };

const ROLES = [
  { value: "FRONT_DESK", label: "Front Desk" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "VIEW_ONLY", label: "View Only" },
];

/**
 * Lets an institute admin give one user access to several companies, with a role in each.
 * Renders nothing when the institute has a single company (then the normal role field is used).
 */
export default function CompanyAccessPicker({
  value,
  onChange,
  onMulti,
  defaultRole = "FRONT_DESK",
}: {
  value: CompanyAssignment[];
  onChange: (v: CompanyAssignment[]) => void;
  onMulti?: (multi: boolean) => void;
  defaultRole?: string;
}) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchMyCompanies()
      .then((d) => {
        setCompanies(d.companies);
        const multi = d.companies.length > 1;
        onMulti?.(multi);
        // New user: start with the company the admin is working in.
        if (multi && value.length === 0) onChange([{ companyId: d.currentCompanyId, role: defaultRole }]);
      })
      .catch(() => onMulti?.(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (companies.length < 2) return null;

  const get = (id: string) => value.find((a) => a.companyId === id);
  const toggle = (id: string) =>
    onChange(get(id) ? value.filter((a) => a.companyId !== id) : [...value, { companyId: id, role: defaultRole }]);
  const setRole = (id: string, role: string) => onChange(value.map((a) => (a.companyId === id ? { ...a, role } : a)));

  return (
    <div className="md:col-span-2">
      <Label>Companies and role in each *</Label>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
        {companies.map((c) => {
          const a = get(c.id);
          return (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={!!a} onChange={() => toggle(c.id)} className="h-4 w-4" />
                {c.name}
              </label>
              {a && (
                <div className="w-44">
                  <Select options={ROLES} value={a.role} onChange={(r) => setRole(c.id, r)} showArrow />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-gray-500">The same login works in every ticked company, with that company&apos;s role.</p>
    </div>
  );
}
