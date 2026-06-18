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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">

      {/* LEFT ASPECT: Premium Range tracking metrics */}
      {!noTotal && (
        <div className="flex items-center gap-2.5 text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
          <span className="uppercase text-[10px] tracking-widest text-slate-400 dark:text-slate-500 font-bold">
            Showing
          </span>

          <div className="inline-flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/40 shadow-inner text-slate-800 dark:text-slate-200 font-semibold tabular-nums">
            <span>{fromRecord}</span>
            <span className="text-slate-400 dark:text-slate-600 font-normal">to</span>
            <span>{toRecord}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 font-light text-base">·</span>

          <div className="inline-flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
              {totalCount}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">
              {title}
            </span>
          </div>
        </div>
      )}

      {/* RIGHT ASPECT: Pagination Actions */}
      <div className="flex items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm font-medium transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center gap-1.5">
          {currentPage > 2 && <span className="px-2 text-gray-400 font-medium">...</span>}

          {pagesAroundCurrent.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex w-10 h-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${currentPage === page
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {page}
            </button>
          ))}

          {currentPage < totalPages - 1 && <span className="px-2 text-gray-400 font-medium">...</span>}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] font-medium transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
