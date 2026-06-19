"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { RootState } from "@/store";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeFinancialYear = user?.financialYears?.find((fy: any) => fy.isActive);

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/85 dark:bg-gray-900/80 transitions-all duration-200">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LEFT AREA: Control & Branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>

          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
            <span className="text-[10px] text-blue-600">CRM</span>
          </div>

          <Link href="/dashboard" className="block lg:hidden transition-opacity hover:opacity-90">
            <Image width={120} height={28} className="dark:hidden" src="/images/logo/logo.svg" alt="ERP Logo" unoptimized />
            <Image width={120} height={28} className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="ERP Logo" unoptimized />
          </Link>

          {/* <div className="hidden md:block lg:ml-4">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search resources, records or actions..."
                className="h-9 w-64 xl:w-96 rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-12 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-brand-500 dark:focus:bg-gray-950"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-semibold text-gray-400 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500">
                <span>⌘</span><span>K</span>
              </kbd>
            </div>
          </div> */}
        </div>

        {/* RIGHT AREA: Metadata Metasystem & Profile Actions */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* ERP Context Pill Dashboard */}
          <div className="hidden xl:flex items-center h-9 gap-3 rounded-lg border border-gray-200 bg-gray-50/60 px-3 dark:border-gray-800 dark:bg-gray-950/30">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-brand-600 dark:text-brand-400 uppercase">
                FY {activeFinancialYear?.name || "N/A"}
              </span>
            </div>

            <div className="h-4.5 w-px bg-gray-200 dark:bg-gray-800" />

            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {formattedDate}
            </div>

            <div className="h-4.5 w-px bg-gray-200 dark:bg-gray-800" />

            <div className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[72px] tabular-nums">
              {formattedTime}
            </div>
          </div>

          {/* Action Modules */}
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-1.5 dark:border-gray-800 sm:gap-2 sm:pr-3">
            <ThemeToggleButton />
            <div className="relative">
              <NotificationDropdown />
            </div>
          </div>

          {/* User Profile Container */}
          <div className="flex items-center transition-transform active:scale-98">
            <UserDropdown />
          </div>

          {/* Mobile Collapse Toggle Trigger */}
          <button
            onClick={() => setApplicationMenuOpen(!isApplicationMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE APPLICATION DRAWER (Conditional Context Expandable) */}
      {isApplicationMenuOpen && (
        <div className="border-t border-gray-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 md:hidden">
          <div className="flex flex-col gap-3">
            {/* Embedded Mini Search for Mobile */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search system..."
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs outline-none dark:border-gray-800 dark:bg-gray-950"
              />
            </div>
            {/* System Status Tracker metadata block */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-2.5 dark:border-gray-800">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                FY {activeFinancialYear?.name || "N/A"}
              </span>
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {formattedDate} {formattedTime}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;