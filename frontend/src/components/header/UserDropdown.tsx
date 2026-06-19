"use client";

import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useLogout } from "@/hooks/useLogout";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Avatar from "../common/Avatar";
import { capitalizeWords } from "../common/ToCapitalize";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const logout = useLogout();
  const user = useSelector((state: RootState) => state.auth.user);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const role = user?.role?.replace('_', ' ') || 'SYSTEM USER';
  const profileHref = user?.role === "MASTER_ADMIN" ? "/master-dashboard/profile" : "/dashboard/profile";

  return (
    <div className="relative flex items-center">
      <button
        onClick={toggleDropdown}
        className="group flex items-center gap-3 rounded-full h-9 transition-transform active:scale-98"
        aria-expanded={isOpen}
      >
        <span className="flex h-9 w-9 overflow-hidden rounded-full border border-gray-200/80 p-0.5 shadow-sm dark:border-gray-800">
          <Avatar name={user?.name} size={30} />
        </span>

        {/* Shortened username, more professional role placeholder */}
        <div className="hidden text-left md:block">
          {/* <span className="block text-xs font-semibold text-gray-950 dark:text-gray-100">
            {capitalizeWords(user?.name)}
          </span> */}
          <span className="block font-mono text-[10px] font-semibold text-brand-600 uppercase tracking-wide dark:text-brand-400">
            {role}
          </span>
        </div>

        <svg
          className={`ml-1 transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180 text-brand-500" : ""}`}
          width="14" height="14" viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute top-10 right-0 mt-3 flex w-[280px] flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950/95backdrop-blur-lg"
      >
        {/* Account Header */}
        <div className="flex items-start gap-4 border-b border-gray-100 p-4 dark:border-gray-800">
          <Avatar name={user?.name} size={36} />
          <div className="grow">
            <div className="flex gap-2 items-center">
              <span className="block text-sm font-semibold text-gray-950 dark:text-gray-100">
                {capitalizeWords(user?.name)}
              </span>
              <span className="font-mono text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
                {role}
              </span>
            </div>
            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-500 truncate">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Links */}
        <ul className="flex flex-col gap-0.5 p-1.5 border-b border-gray-100 dark:border-gray-800">
          {[
            { label: "Account settings", href: profileHref, icon: "/icons/settings.svg" },
            { label: "Support center", href: "/dashboard/support", icon: "/icons/help.svg" },
            { label: "Check API Status", href: "/dashboard/api-status", icon: "/icons/api.svg" },
          ].map((item, i) => (
            <li key={i}>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href={item.href}
                className="group flex items-center h-8 gap-3 rounded-lg px-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                {/* SVG/Icon Placeholder */}
                <div className="w-4 h-4 rounded border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 group-hover:border-brand-300 dark:group-hover:border-brand-700" />
                {item.label}
              </DropdownItem>
            </li>
          ))}
        </ul>

        {/* Signout Button */}
        <div className="p-1.5">
          <button
            onClick={logout}
            className="flex w-full items-center h-9 gap-3 rounded-lg px-2 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <div className="w-4 h-4 rounded bg-red-100 border border-red-200 flex items-center justify-center text-red-500 dark:bg-red-950 dark:border-red-800">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            Sign out of your account
          </button>
        </div>
      </Dropdown>
    </div>
  );
}