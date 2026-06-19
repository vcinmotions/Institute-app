"use client";

import React from "react";

const AppKeyHeader: React.FC = () => {
  return (
    <header className="sticky top-16 z-35 w-full border-b border-gray-200/60 bg-white/70 backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-900/70 transition-all duration-200">
      <div className="mx-auto flex h-10 items-center px-4 sm:px-6 lg:px-8">

        {/* Shortcut Action Badges Container */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">

          {/* Action: Create Master */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <kbd className="inline-flex h-5 min-w-[24px] items-center justify-center rounded border border-gray-300 bg-gray-50 px-1.5 font-mono text-[10px] font-bold text-gray-700 shadow-xs transition-colors group-hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-gray-700">
              F2
            </kbd>
            <span className="font-medium text-gray-600 dark:text-gray-400 transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-200">
              Create master
            </span>
          </div>

          {/* Divider */}
          <div className="h-3 w-px bg-gray-200 dark:bg-gray-800" />

          {/* Action: Back */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <kbd className="inline-flex h-5 min-w-[24px] items-center justify-center rounded border border-gray-300 bg-gray-50 px-1.5 font-mono text-[10px] font-bold text-gray-700 shadow-xs transition-colors group-hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-gray-700">
              Esc
            </kbd>
            <span className="font-medium text-gray-600 dark:text-gray-400 transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-200">
              Back
            </span>
          </div>

        </div>

      </div>
    </header>
  );
};

export default AppKeyHeader;