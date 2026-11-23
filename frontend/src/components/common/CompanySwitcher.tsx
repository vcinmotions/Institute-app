"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMyCompanies, switchCompanyApi } from "@/lib/api";
import { persistLogin } from "@/lib/session";

/**
 * Header pill showing the company the user is working in. With several companies it
 * becomes a dropdown: switching issues a new token for that company (same login seat)
 * and reloads so every screen shows that company's data.
 */
export default function CompanySwitcher({ fallbackName }: { fallbackName: string }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string; role: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMyCompanies()
      .then((d) => {
        setCurrent(d.currentCompanyId);
        setCompanies(d.companies);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const name = companies.find((c) => c.id === current)?.name || fallbackName;
  const pill =
    "inline-flex h-9 max-w-[220px] items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-gray-500 shadow-sm dark:border-gray-800 dark:text-gray-400";

  if (companies.length < 2) {
    return (
      <div title={name} className={pill}>
        <span className="truncate text-xs font-medium text-blue-600">{name}</span>
      </div>
    );
  }

  const choose = async (id: string) => {
    if (id === current || busy) return setOpen(false);
    setBusy(true);
    try {
      const data = await switchCompanyApi(id);
      window.sessionStorage.setItem("token", data.token);
      persistLogin(data);
      window.location.reload();
    } catch {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Switch company"
        onClick={() => setOpen((v) => !v)}
        className={`${pill} hover:bg-gray-50 dark:hover:bg-gray-800`}
      >
        <span className="truncate text-xs font-medium text-blue-600">{name}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="absolute left-0 z-50 mt-1 max-h-72 min-w-[220px] overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {companies.map((c) => (
            <li
              key={c.id}
              onClick={() => choose(c.id)}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 ${
                c.id === current ? "font-medium text-blue-600" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {c.name}
              <span className="ml-2 text-xs text-gray-400">{c.role.replace("_", " ").toLowerCase()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
