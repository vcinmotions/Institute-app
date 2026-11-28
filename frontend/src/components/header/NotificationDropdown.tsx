"use client";

import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNotifications } from "@/context/NotificationContext";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Apply extension globally once
dayjs.extend(relativeTime);

type AlertKind = "followup" | "payment" | "enquiry" | "other";

// One fixed colour and icon per kind of alert (the old avatar picked a random colour
// from the text, so identical alerts looked different).
function kindOf(message: string): AlertKind {
  const m = (message || "").toLowerCase();
  if (m.startsWith("follow")) return "followup";
  if (m.startsWith("fee") || m.startsWith("payment")) return "payment";
  if (m.startsWith("new enquiry")) return "enquiry";
  return "other";
}

const KIND_STYLE: Record<AlertKind, { bg: string; icon: React.ReactNode }> = {
  followup: {
    bg: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  },
  payment: {
    bg: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
  },
  enquiry: {
    bg: "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
  },
  other: {
    bg: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    icon: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
  },
};

function AlertIcon({ message }: { message: string }) {
  const k = KIND_STYLE[kindOf(message)];
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${k.bg}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {k.icon}
      </svg>
    </div>
  );
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const context = useNotifications();

  if (!context) {
    return <div className="animate-pulse w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800" />
  }

  const { notifications, unreadCount, markAllRead } = context;

  useEffect(() => {
    if (unreadCount >= 1) {
      setNotifying(true);
    } else {
      setNotifying(false);
    }
  }, [unreadCount])

  const handleClick = () => {
    setIsOpen(!isOpen);
    // Optional: Mark as notifying false on click, 
    // but better to rely strictly on unreadCount
  };

  return (
    <div className="relative flex items-center">
      <button
        className="group relative flex items-center justify-center rounded-full transition-all duration-200 border border-gray-200/80 bg-white/50 text-gray-500 shadow-sm backdrop-blur-sm h-9 w-9 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 active:scale-95 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-900 dark:hover:text-white"
        onClick={handleClick}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {/* Modern Dot Indicator */}
        {notifying && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 font-mono text-[9px] font-bold text-white shadow-sm ring-1 ring-white/80 dark:ring-gray-900/80">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative tabular-nums">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}

        <svg
          className="opacity-80 group-hover:opacity-100"
          width="17"
          height="17"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute -right-16 md:-right-1 top-8 mt-3 flex w-[320px] flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950/95backdrop-blur-lg sm:w-[361px]"
      >
        <div className="flex h-[400px] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h5 className="text-base font-semibold tracking-tight text-gray-950 dark:text-gray-100">
                System notifications
              </h5>
              {unreadCount > 0 && (
                <span className="font-mono text-[10px] font-bold text-gray-400 dark:text-gray-600">
                  /{unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-400"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="grow overflow-y-auto custom-scrollbar p-1.5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
                <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.287a6 6 0 010 7.427M13.812 10.938a3 3 0 010 2.124M10 12a2 2 0 110-4 2 2 0 010 4zM2 12v.01M6.5 21v.01" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">All clear!</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">You don't have any new system alerts or user updates.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {notifications.map((notification, index) => (
                  <li key={index}>
                    <DropdownItem
                      onItemClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    >
                      <AlertIcon message={notification.notificationMessage} />
                      <div className="grow">
                        <p className="text-xs font-medium leading-relaxed text-gray-800 dark:text-gray-200">
                          {notification.notificationMessage}
                        </p>
                        <time className="mt-1 font-mono text-[10px] text-gray-500 dark:text-gray-400">
                          {dayjs(notification.createdAt).fromNow()}
                        </time>
                      </div>
                      {/* {!notification.isRead && (
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-500" />
                      )} */}
                    </DropdownItem>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length >= 1 && (
            <div className="p-3 mt-auto border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20 rounded-b-xl">
              <button
                onClick={markAllRead}
                className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200/80 bg-white text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Mark all notifications as read
              </button>
            </div>
          )}
        </div>
      </Dropdown>
    </div>
  );
}