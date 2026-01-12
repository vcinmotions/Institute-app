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

  // toggle dropdown visibility
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // detect outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // update a specific filter value
  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // apply filters to parent
  const applyFilters = () => {
    setIsOpen(false);
    setIsFilter(true);
    onFilterChange?.(filters);
  };

  // reset filters
  const clearFilters = () => {
    const cleared: Record<string, string | null> = {};
    filterFields.forEach((f) => (cleared[f.key] = null));
    setFilters(cleared);
    setIsFilter(false);
    onFilterChange?.(cleared);
  };

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <div className="flex gap-3">
        
        <button
          onClick={toggleDropdown}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        >

        {isFilter === true && <span
          className={`absolute right-24.5 top-0 z-10 h-2 w-2 rounded-full bg-orange-400 ${
             !isFilter ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>}
          
          <svg
            className="stroke-current fill-white dark:fill-gray-800"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M2.29 5.9H17.71M17.71 14.1H2.29M12.08 3.33a2.57 2.57 0 110 5.14 2.57 2.57 0 010-5.14zM7.92 11.53a2.57 2.57 0 100 5.14 2.57 2.57 0 000-5.14z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Filter
        </button>

        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        >
          Clear All
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 lg:left-auto left-0 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
            Apply Filters
          </h3>

          <div className="space-y-3">
            {filterFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    value={filters[field.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(field.key, e.target.value || null)
                    }
                  >
                    <option value="">Select</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    value={filters[field.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(field.key, e.target.value || null)
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={applyFilters}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBox;
