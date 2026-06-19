'use client'
import { RootState } from "@/store";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const homePath = user?.role === "MASTER_ADMIN" ? "/master-dashboard" : "/dashboard";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-2 border-b border-slate-100 dark:border-slate-800/40">

      {/* Structural ERP Module Context Head */}
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
        {pageTitle}
      </h2>

      {/* Tightly Compact Trail Map Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-[11px] font-medium tracking-wide">
          <li>
            <Link
              href={homePath}
              className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
            >
              Dashboard
            </Link>
          </li>

          {/* Lightweight Structural Angle Separator */}
          <li className="text-slate-300 dark:text-slate-700 select-none pointer-events-none" aria-hidden="true">
            <svg
              className="h-3 w-3 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </li>

          <li className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[160px]">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;