"use client";
import React, { FC, useEffect, useRef, useState } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBoxProps {
  className?: string;
  onFilterChange?: (filters: Record<string, string | null>) => void;
  filterFields?: {
    label: string;
    key: string;
    options?: FilterOption[];
    type?: "select" | "date";
  }[];
}

const defaultFilters = [
  {
    label: "Payment Status",
    key: "paymentStatus",
    type: "select",
    options: [
      { label: "SUCCESS", value: "SUCCESS" },
      { label: "PENDING", value: "PENDING" },
      { label: "FAILED", value: "FAILED" },
    ],
  },
  {
    label: "Payment Mode",
    key: "paymentMode",
    type: "select",
    options: [
      { label: "Cash", value: "CASH" },
      { label: "UPI", value: "UPI" },
      { label: "Card", value: "CARD" },
    ],
  },
  {
    label: "Date Range (From)",
    key: "fromDate",
    type: "date",
  },
  {
    label: "Date Range (To)",
    key: "toDate",
    type: "date",
  },
];

const FilterBox: FC<FilterBoxProps> = ({ className, onFilterChange, filterFields = defaultFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string | null>>({});
  const [isFilter, setIsFilter] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setIsOpen(false);
    setIsFilter(true);
    onFilterChange?.(filters);
  };

  const clearFilters = () => {
    const cleared: Record<string, string | null> = {};
    filterFields.forEach((f) => (cleared[f.key] = null));
    setFilters(cleared);
    setIsFilter(false);
    onFilterChange?.(cleared);
  };

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <div className="flex items-center gap-1.5">

        {/* Main Filter Action Trigger Toggle */}
        <button
          type="button"
          onClick={toggleDropdown}
          className="relative inline-flex h-7 items-center justify-center gap-1.5 rounded border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {/* Active Filter Notification Ping */}
          {isFilter && (
            <span className="absolute -top-0.5 -right-0.5 z-10 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
          )}

          <svg
            className="text-slate-500 dark:text-slate-400"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 11 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filter
        </button>

        {/* Clear Actions Trigger */}
        {isFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-7 items-center justify-center rounded border border-transparent bg-slate-100/70 px-2.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Popover Card Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 rounded border border-slate-200 bg-white p-3.5 shadow-md dark:border-slate-800 dark:bg-slate-950 z-50">
          <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Query Criteria Filters
          </h3>

          <div className="space-y-3">
            {filterFields.map((field) => (
              <div key={field.key}>
                <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    className="h-8 w-full rounded border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:focus:border-slate-700"
                    value={filters[field.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(field.key, e.target.value || null)
                    }
                  >
                    <option value="">All parameters</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    className="h-8 w-full rounded border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:focus:border-slate-700"
                    value={filters[field.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(field.key, e.target.value || null)
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Action Operations Footer */}
          <div className="mt-4 flex justify-end gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800/60">
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex h-6 items-center justify-center rounded border border-slate-200 bg-white px-2.5 text-[10px] font-medium text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="inline-flex h-6 items-center justify-center rounded bg-slate-900 px-3 text-[10px] font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBox;