import React, { forwardRef } from "react";

type SearchProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ value, onChange, onSubmit }, ref) => {
    return (
      <div className="hidden lg:block">
        <form onSubmit={onSubmit}>
          <div className="relative w-full max-w-xs xl:max-w-sm">
            {/* Search Icon */}
            <span className="absolute -translate-y-1/2 left-3 top-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>

            {/* High Density ERP Input Field */}
            <input
              ref={ref}
              type="text"
              value={value}
              onChange={onChange}
              placeholder="Search record..."
              className="h-7 w-full max-w-[240px] xl:max-w-[320px] rounded border border-slate-200 bg-slate-50/50 py-1 pl-8 pr-12 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 shadow-none transition-colors focus:border-slate-300 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:placeholder:text-slate-500 dark:focus:border-slate-700"
            />

            {/* ERP Style Minimal Shortcut Badge */}
            <div className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200/60 bg-white px-1 py-0.5 text-[9px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500 select-none pointer-events-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </form>
      </div>
    );
  }
);

Search.displayName = "Search";

export default Search;