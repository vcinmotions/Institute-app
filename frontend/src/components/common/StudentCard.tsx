import React from "react";

interface StudentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  onCreateClick?: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  onCreateClick,
}) => {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* ERP Style Clean Header Toolbar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 dark:border-slate-800/60">

        {/* Left Zone: Title and metadata description */}
        <div className="flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title}
          </h3>
          {desc && (
            <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {desc}
            </p>
          )}
        </div>

        {/* Right Zone: ERP Contextual Actions Button */}
        {onCreateClick && (
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex h-7 items-center justify-center rounded border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            + Create Record
          </button>
        )}
      </div>

      {/* ERP Compact Card Body */}
      <div className="p-3">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default StudentCard;