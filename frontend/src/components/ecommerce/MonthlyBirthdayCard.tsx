"use client";
import React, { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";

interface StudentBirthdayData {
  id: string;
  fullName: string;
  dob: string;
  studentCode: string;
}

interface MonthlyBirthdayCardProps {
  birthdays: StudentBirthdayData[];
}

export default function MonthlyBirthdayCard({
  birthdays,
}: MonthlyBirthdayCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col h-[350px]">

      {/* ERP Compact Header Toolbar Zone */}
      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </span>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Today's Birthdays
          </h3>
        </div>

        {/* Dropdown Tools Trigger */}
        <div className="relative inline-block h-4">
          <button
            onClick={toggleDropdown}
            type="button"
            className="p-0.5 rounded transition hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <MoreDotIcon className="text-slate-400 hover:text-slate-600 dark:text-slate-500" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 rounded border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-950 z-50"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded px-2.5 py-1.5 text-left text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60"
            >
              Send Greetings
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full rounded px-2.5 py-1.5 text-left text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60"
            >
              View Month List
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* High Density Data Content Zone */}
      <div className="p-2 flex-1 overflow-y-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-1.5 pl-1">Student / Code</th>
              <th className="pb-1.5 text-right pr-1">Date of Birth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 text-[11px] font-medium text-slate-600 dark:text-slate-400">
            {birthdays && birthdays.length > 0 ? (
              birthdays.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-2 pl-1">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {student.fullName}
                      </span>
                      <span className="text-[10px] font-mono tracking-wide text-slate-400 dark:text-slate-500">
                        {student.studentCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 text-right pr-1 font-mono text-slate-500 dark:text-slate-400">
                    {new Date(student.dob).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-12 text-center text-slate-400 font-normal">
                  No birthdays recorded for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Operational Matrix Metric Footer */}
      <div className="border-t border-slate-100 px-3.5 py-2 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/10 shrink-0 text-left">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Total active registry flags: <span className="font-bold text-slate-800 dark:text-slate-200">{birthdays.length} items today</span>
        </p>
      </div>
    </div>
  );
}