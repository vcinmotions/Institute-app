"use client";

import { useEffect, useState, useCallback } from "react";
import JumpModal from "./JumpModal";
import { useRouter, usePathname } from "next/navigation";
import { masterRoutes } from "@/app/utils/MasterRoutes";
import { escBus } from "@/app/utils/escBus";

type JumpType = "create" | "list" | "view" | null;

function isSelectDropdownOpen() {
  return document.querySelector(".react-select__menu") !== null;
}

function getMasterFromFocusedElement() {
  let el = document.activeElement as HTMLElement | null;

  console.log("get el;", el);

  while (el) {
    const master = el.getAttribute("data-master");
    console.log("get master:", master);
    if (master) return master;
    el = el.parentElement;
  }

  return null;
}

function extractMasterKey(pathname: string) {
  const clean = pathname.split("?")[0]; // remove query
  const parts = clean.split("/").filter(Boolean); // remove empty segments

  // parts[0] = dashboard
  // parts[1] = enquiry (THIS IS WHAT YOU WANT)

  return parts[1] || null;
}

export default function JumpHotkeys({ children, userRole }: any) {
  const [jump, setJump] = useState<JumpType>(null);
  const router = useRouter();
  const pathname = usePathname();

  console.log("GET PATHNAMe:", pathname);

  const handleKeys = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;

      if (isSelectDropdownOpen()) return;

      const isFunctionKey = ["F2", "F3", "F4"].includes(e.key);

      // ALLOW ESC EVEN IF INPUT IS FOCUSED
      if (e.key === "Escape") {
        e.preventDefault();
      } else {
        // For all other keys keep your old logic
        if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) && !isFunctionKey)
          return;
      }

      // if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) && !isFunctionKey) {
      //   return;
      // }

      // if (e.key === "F2") {
      //   e.preventDefault();
      //   setJump("create");
      // }

      if (e.key === "F2") {
        e.preventDefault();
        if (isSelectDropdownOpen()) return;

        const master = getMasterFromFocusedElement();
        const masterKey = extractMasterKey(pathname);

        console.log("Focused master:", master);
        console.log("MASTER KEY FROM PATH:", masterKey);

        // 1️⃣ — HIGHEST PRIORITY
        // If input has data-master → redirect to that master create
        if (master && masterRoutes[master]?.create) {
          console.log("Redirecting from focused master:", master);
          router.push(masterRoutes[master].create!);
          return;
        }

        // 2️⃣ — If current page IS NOT a create page
        // Example: /dashboard/enquiry  → go to  /dashboard/enquiry/create
        if (!pathname.endsWith("/create")) {
          if (masterKey && masterRoutes[masterKey]?.create) {
            console.log("Redirecting to main module create:", masterKey);
            router.push(masterRoutes[masterKey].create!);
            escBus.modalHandled = false;

            return;
          }
        }

        // 3️⃣ — IN CREATE PAGE with NO focused data-master → open modal
        console.log("Opening Jump Modal");
        setJump("create");
        // escBus.modalHandled = true;
        // console.log("GET ESCBUS HANDLE IN F2:", escBus.modalHandled);
      }

      // if (e.key === "F2") {
      //   e.preventDefault();

      //   //const focused = document.activeElement as HTMLElement;
      //   // Skip react-select dropdown
      //   if (isSelectDropdownOpen()) return;

      //   // Check if focused input has direct master shortcut
      //   // const master = focused?.getAttribute("data-master");
      //   const master = getMasterFromFocusedElement();

      //   console.log("master modal:", master);
      //   console.log("Pathname in master modal:", pathname);

      //   if (master) {
      //     // Auto redirect based on masterRoutes
      //     const route = masterRoutes[master]?.create;

      //     console.log("GET ROUTE TO Redirect:", route);

      //     if (route) {
      //       router.push(route);
      //       return; // STOP - don't open JumpModal
      //     }
      //   }

      //   const masterKey = extractMasterKey(pathname);
      //   console.log("MASTER KEY FROM PATH:", masterKey);

      //   if (masterKey && masterRoutes[masterKey]) {
      //     const route = masterRoutes[masterKey].create;
      //     console.log("Redirecting to create page:", route);

      //     if (route) {
      //       router.push(route);
      //       return;
      //     }
      //   }

      //   // Otherwise open jump modal
      //   setJump("create");
      // }

      // if (e.key === "F3") {
      //   e.preventDefault();
      //   setJump("list");
      // }

      if (e.key === "F3") {
        e.preventDefault();

        //const focused = document.activeElement as HTMLElement;
        // Skip react-select dropdown
        if (isSelectDropdownOpen()) return;

        // Check if focused input has direct master shortcut
        // const master = focused?.getAttribute("data-master");
        const master = getMasterFromFocusedElement();

        console.log("master modal:", master);
        if (master) {
          // Auto redirect based on masterRoutes
          const route = masterRoutes[master]?.list;

          console.log("GET ROUTE TO Redirect:", route);
          if (route) {
            router.push(route);

            return; // STOP - don't open JumpModal
          }
        }

        // Otherwise open jump modal
        setJump("list");
        // escBus.modalHandled = true;
        // console.log("GET ESCBUS HANDLE IN F3:", escBus.modalHandled);
      }

      // if (e.key === "F4") {
      //   e.preventDefault();
      //   setJump("view");
      // }

      if (e.key === "F4") {
        e.preventDefault();

        //const focused = document.activeElement as HTMLElement;
        // Skip react-select dropdown
        if (isSelectDropdownOpen()) return;

        // Check if focused input has direct master shortcut
        // const master = focused?.getAttribute("data-master");
        const master = getMasterFromFocusedElement();

        console.log("master modal:", master);

        if (master) {
          // Auto redirect based on masterRoutes
          const route = masterRoutes[master]?.list;

          console.log("GET ROUTE TO Redirect:", route);

          if (route) {
            router.push(route);
            return; // STOP - don't open JumpModal
          }
        }

        // Otherwise open jump modal
        setJump("view");
        // escBus.modalHandled = true;
        // console.log("GET ESCBUS HANDLE IN F4:", escBus.modalHandled);
      }

      // ESC BEHAVIOR
      // if (e.key === "Escape") {
      //   e.preventDefault();

      //   if (jump) {
      //     // Mark ESC as handled by modal
      //     escBus.modalHandled = true;

      //     // Close modal
      //     setJump(null);

      //     // // 🔥 IMPORTANT FIX: return focus to window
      //     setTimeout(() => {
      //       window.focus();
      //     }, 10);

      //     // Reset flag after small delay
      //     setTimeout(() => {
      //       escBus.modalHandled = false;
      //     }, 50);

      //     return;
      //   } else {
      //     // Redirect if user is on /create
      //     if (pathname.endsWith("/create")) {
      //       router.push(pathname.replace("/create", ""));
      //     }
      //   }
      // }

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (jump) {
          // Mark ESC as handled BEFORE bubbling reaches global listener
          escBus.modalHandled = true;
          console.log(
            "GET ESCBUS HANDLE IN ESCKEY JUMPHOTKEYS:",
            escBus.modalHandled,
          );
          setJump(null);

          // restore default after small delay
          setTimeout(() => (escBus.modalHandled = false), 50);

          return;
        }

        // Normal ESC behavior (only when no modal)
        if (pathname.endsWith("/create")) {
          router.push(pathname.replace("/create", ""));
        }

        // if (!pathname.endsWith("/create")) {
        //   escBus.modalHandled = false;

        //   return;
        // }

        return;
      }

      // ESC BEHAVIOR
      // if (e.key === "Escape") {
      //   e.preventDefault();

      //   if (jump) {
      //     // Close modal
      //     setJump(null);

      //     // 🔥 IMPORTANT FIX: return focus to window
      //     setTimeout(() => {
      //       window.focus();
      //     }, 10);
      //   } else {
      //     // Redirect if user is on /create
      //     if (pathname.endsWith("/create")) {
      //       router.push(pathname.replace("/create", ""));
      //     }
      //   }
      // }
    },
    [jump, pathname, router],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [handleKeys]);

  return (
    <>
      {children}
      {/* {jump && (
        <JumpModal
          type={jump}
          close={() => setJump(null)}
          userRole={userRole}
        />
      )} */}
    </>
  );
}
