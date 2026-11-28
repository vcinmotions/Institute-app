import React, { useEffect, useMemo, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  ref?: any;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  tabIndex?: number;     // ⭐ ADD THIS
  value?: string | null; // ⭐ ADD THIS
  onKeyDown?: any | null;
  searchable?: boolean;  // select2-style type-to-filter dropdown
  disabled?: boolean;
  showArrow?: boolean;   // native select: draw a chevron (searchable always does)
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  ref,
  onKeyDown,
  className = "",
  defaultValue = "",
  tabIndex,
  value, // ← new controlled value
  searchable = false,
  disabled = false,
  showArrow = false,
}) => {
  // Manage the selected value
  // const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const value = e.target.value;
  //   setSelectedValue(value);
  //   onChange(value); // Trigger parent handler
  // };

  const [internalValue, setInternalValue] = useState<string>(defaultValue);

  const selectedValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;

    if (value === undefined) {
      // use internal state only when uncontrolled
      setInternalValue(newValue);
    }

    onChange(newValue);
  };

  if (searchable) {
    return (
      <SearchableSelect
        options={options}
        placeholder={placeholder}
        onChange={(v) => {
          if (value === undefined) setInternalValue(v);
          onChange(v);
        }}
        className={className}
        tabIndex={tabIndex}
        value={selectedValue ?? ""}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="relative">
    <select
      disabled={disabled}
      className={`shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
        selectedValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      // value={selectedValue}
      onChange={handleChange}
      value={selectedValue ?? ""} // ⭐ THIS MAKES PLACEHOLDER SHOW AGAIN
      tabIndex={tabIndex}
      ref={ref}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
    {showArrow && <ChevronIcon />}
    </div>
  );
};

const ChevronIcon = () => (
  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const SearchableSelect: React.FC<{
  options: Option[];
  placeholder: string;
  onChange: (v: string) => void;
  className: string;
  tabIndex?: number;
  value: string;
  disabled: boolean;
}> = ({ options, placeholder, onChange, className, tabIndex, value, disabled }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => setActive(0), [query, open]);
  useEffect(() => {
    (listRef.current?.children[active] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const pick = (o: Option) => {
    onChange(o.value);
    setOpen(false);
    setQuery("");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && open) { e.preventDefault(); if (filtered[active]) pick(filtered[active]); }
    else if (e.key === "Escape" || e.key === "Tab") { setOpen(false); setQuery(""); }
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        tabIndex={tabIndex}
        disabled={disabled}
        autoComplete="off"
        value={open ? query : selected?.label ?? ""}
        placeholder={open && selected ? selected.label : placeholder}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={onKey}
        className={`shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`}
      />
      <ChevronIcon />
      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {filtered.length === 0 && <li className="px-4 py-2 text-gray-400">No results found</li>}
          {filtered.map((o, i) => (
            <li
              key={o.value}
              onMouseDown={(e) => { e.preventDefault(); pick(o); }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 ${
                i === active ? "bg-brand-50 dark:bg-white/5" : ""
              } ${o.value === value ? "font-medium text-brand-500" : ""}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
