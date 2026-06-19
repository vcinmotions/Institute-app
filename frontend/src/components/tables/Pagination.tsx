import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  title?: string;
  noTotal?: boolean;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  limit,
  title = "Items",
  noTotal,
  onPageChange,
}) => {
  const pagesAroundCurrent = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(
      (page) => page >= currentPage - 1 && page <= currentPage + 1
    );

  // Calculate descriptive data ranges
  const fromRecord = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const toRecord = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">

      {/* LEFT ASPECT: High Density ERP Tracking Metrics */}
      {!noTotal && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
          <span className="uppercase text-[9px] tracking-wider text-slate-400 dark:text-slate-500 font-bold">
            Showing
          </span>

          <div className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
            <span>{fromRecord}</span>
            <span className="text-slate-400 dark:text-slate-600 font-normal mx-0.5">to</span>
            <span>{toRecord}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 font-light mx-0.5">|</span>

          <div className="inline-flex items-center gap-1">
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {totalCount}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">
              {title}
            </span>
          </div>
        </div>
      )}

      {/* RIGHT ASPECT: Compact ERP Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Previous Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Page Numeric Matrix */}
        <div className="flex items-center gap-1">
          {currentPage > 2 && (
            <span className="px-1 text-[11px] font-bold text-slate-400 tracking-tight">...</span>
          )}

          {pagesAroundCurrent.map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex h-7 min-w-[28px] px-1.5 items-center justify-center rounded text-[11px] font-semibold transition-colors ${currentPage === page
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950"
                  : "text-slate-600 border border-transparent hover:border-slate-200 hover:bg-slate-50 dark:text-slate-400 dark:hover:border-slate-800 dark:hover:bg-slate-900"
                }`}
            >
              {page}
            </button>
          ))}

          {currentPage < totalPages - 1 && (
            <span className="px-1 text-[11px] font-bold text-slate-400 tracking-tight">...</span>
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Next Page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;