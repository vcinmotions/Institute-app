"use client";
import React, { useCallback, useEffect, useRef } from "react";
import Button from "../ui/button/Button";
import { escBus } from "@/app/utils/escBus";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;

}

const SetupModalCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 🔑 ESC handler (modal owns ESC)
  const handleKeys = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [],
  );

  // ✅ Claim ESC on mount, release on unmount
  useEffect(() => {
    escBus.modalHandled = true;

    return () => {
      escBus.modalHandled = false;
    };
  }, []);

  // Disable background scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // ✅ Global key listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeys, true);
    return () => window.removeEventListener("keydown", handleKeys, true);
  }, [handleKeys]);

  // ✅ Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        escBus.modalHandled = false;
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white-400/50 backdrop-blur-[32px]">
      {/* Modal card container */}
      <div
        ref={modalRef}
        className={`relative mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {title}
          </h3>
        
        </div>

        {/* Description */}
        {desc && (
          <div className="px-6 pt-2 text-sm text-gray-500 dark:text-gray-400">
            {desc}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-700"></div>
      </div>
    </div>
  );
};

export default SetupModalCard;
