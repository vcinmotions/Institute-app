"use client";

import React from "react";

const AppKeyHeader: React.FC = () => {
  return (
    <header className="sticky top-19 z-40 flex w-full border-gray-200 bg-white lg:border-b dark:border-gray-800 dark:bg-gray-900">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4 dark:border-gray-800">
          <div className="flex gap-4 text-sm text-gray-600">
            <span>F2: Create master</span>
            <span>Esc: Back</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppKeyHeader;
