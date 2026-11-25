"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { escBus } from "@/app/utils/escBus";
import { lockBodyScroll, unlockBodyScroll } from "@/app/utils/ModalManager";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  oncloseModal: () => void;
  onBodyRef?: (el: HTMLDivElement | null) => void; // ✅ NEW
}

const ModalCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  oncloseModal,
  onBodyRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 🔑 ESC handler (modal owns ESC)
  // Keyboard users: Tab / Shift+Tab stay INSIDE the modal (they wrap around) instead of walking into the page behind it.
  const focusables = () =>
    Array.from(
      modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((el) => {
      if ((el as HTMLButtonElement).disabled || el.getAttribute("tabindex") === "-1") return false;
      if (el instanceof HTMLInputElement && el.type === "hidden") return false;
      return el.offsetParent !== null; // visible only
    });

  const handleKeys = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // A time pop-up is open: Esc closes just that (the time field handles it), not the whole modal.
        if (document.querySelector("[data-time-popover]")) return;
        e.preventDefault();
        e.stopPropagation();
        oncloseModal();
        return;
      }
      if (e.key === "Tab") {
        const list = focusables();
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const inside = !!active && !!modalRef.current?.contains(active);
        if (!inside) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [oncloseModal],
  );

  // When a modal opens, put the cursor in its first field unless the form already did that itself.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (modalRef.current && !modalRef.current.contains(document.activeElement)) focusables()[0]?.focus();
    }, 60);
    return () => window.clearTimeout(t);
  }, []);

  // ✅ Claim ESC on mount, release on unmount
  useEffect(() => {
    escBus.modalHandled = true;

    return () => {
      escBus.modalHandled = false;
    };
  }, []);

  // Disable background scroll
  // useEffect(() => {
  //   const originalStyle = window.getComputedStyle(document.body).overflow;
  //   document.body.style.overflow = "hidden";

  //   return () => {
  //     document.body.style.overflow = originalStyle;
  //   };
  // }, []);

   useEffect(() => {
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
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
      // Pop-ups drawn outside the modal (time picker) are part of it: clicking them must not close it.
      if ((event.target as HTMLElement | null)?.closest?.("[data-keep-modal-open]")) return;
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        oncloseModal();
        escBus.modalHandled = false;
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [oncloseModal]);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[32px]">
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
          <button
            onClick={oncloseModal}
            tabIndex={-1}
            aria-label="Close"
            className="text-xl font-bold text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            &times;
          </button>
        </div>

        {/* Description */}
        {desc && (
          <div className="px-6 pt-2 text-sm text-gray-500 dark:text-gray-400">
            {desc}
          </div>
        )}

        {/* Body */}
        <div ref={(el) => onBodyRef?.(el)} className="max-h-[80vh] overflow-y-auto p-6">{children}</div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-700"></div>
      </div>
    </div>
  );
};

// const ModalCard = forwardRef<HTMLDivElement, ComponentCardProps>(
//   ({ title, children, className = "", desc = "", oncloseModal, onBodyRef}) => {
//     const modalRef = useRef<HTMLDivElement>(null);

//     const handleKeys = useCallback(
//       (e: KeyboardEvent) => {
//         if (e.key === "Escape") {
//           e.preventDefault();
//           e.stopPropagation();
//           oncloseModal();
//         }
//       },
//       [oncloseModal],
//     );

//     useEffect(() => {
//       escBus.modalHandled = true;
//       return () => {
//         escBus.modalHandled = false;
//       };
//     }, []);

//     useEffect(() => {
//       const originalStyle = window.getComputedStyle(document.body).overflow;
//       document.body.style.overflow = "hidden";
//       return () => {
//         document.body.style.overflow = originalStyle;
//       };
//     }, []);

//     useEffect(() => {
//       window.addEventListener("keydown", handleKeys, true);
//       return () => window.removeEventListener("keydown", handleKeys, true);
//     }, [handleKeys]);

//     useEffect(() => {
//       function handleClickOutside(event: MouseEvent) {
//         if (
//           modalRef.current &&
//           !modalRef.current.contains(event.target as Node)
//         ) {
//           oncloseModal();
//           escBus.modalHandled = false;
//         }
//       }

//       document.addEventListener("mousedown", handleClickOutside);
//       return () =>
//         document.removeEventListener("mousedown", handleClickOutside);
//     }, [oncloseModal]);

//     return (
//       <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[32px]">
//         <div
//           ref={modalRef}
//           className={`relative mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 ${className}`}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between border-b px-6 py-4">
//             <h3 className="text-lg font-semibold">{title}</h3>
//             <button onClick={oncloseModal}>&times;</button>
//           </div>

//           {desc && <div className="px-6 pt-2 text-sm">{desc}</div>}

//           {/* ✅ SCROLLABLE BODY */}
//           <div
//             ref={(el) => onBodyRef?.(el)}
//             className="max-h-[80vh] overflow-y-auto p-6"
//           >
//             {children}
//           </div>
//         </div>
//       </div>
//     );
//   },
// );

export default ModalCard;
