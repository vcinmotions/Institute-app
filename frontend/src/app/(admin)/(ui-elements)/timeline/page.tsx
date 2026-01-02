"use client";

import React from "react";

export default function Timeline() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Blank Page" /> */}
      <div className="h-max rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
            Follow-Up Timeline
          </h3>
          <ul className="timeline timeline-vertical">
            <li>
              <div className="timeline-middle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  className="h-5 w-5 fill-gray-700 dark:fill-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {/* <div className="timeline-end timeline-box">First Macintosh computer</div> */}
              <div className="timeline-end dark:border-base-300 dark:bg-base-100 rounded border bg-white px-4 py-2 text-xs text-black shadow-sm dark:text-white"></div>
              <hr />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
