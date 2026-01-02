"use client";

import { useEffect, useState } from "react";
import AdminJumpModal from "./AdminJumpModal";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { adminMasterRoutes } from "@/app/utils/MasterRoutes";
import { escBus } from "@/app/utils/escBus";

type JumpType = "create" | "list" | "view" | null;

function isSelectDropdownOpen() {
  return document.querySelector(".react-select__menu") !== null;
}

export default function AdminJumpHotkeys({ children, userRole }: any) {
  const [jump, setJump] = useState<JumpType>(null);
  const router = useRouter();
  const pathname = usePathname();

  console.log("GET ROLES in ADMINHOTKEYS:", userRole);

  const handleKeys = (e: KeyboardEvent) => {
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

    if (e.key === "F2") {
      e.preventDefault();

      if (pathname == "/master-dashboard") {
        // Auto redirect based on masterRoutes
        const route = adminMasterRoutes["company"]?.create;

        console.log("GET ROUTE TO Redirect:", route);

        if (route) {
          router.push(route);
          return; // STOP - don't open JumpModal
        }
      }

      setJump("create");
    }

    if (e.key === "F3") {
      e.preventDefault();
      setJump("list");
    }

    if (e.key === "F4") {
      e.preventDefault();
      setJump("view");
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
    //     if (pathname.endsWith("/company")) {
    //       router.push(pathname.replace("/company", ""));
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
        setTimeout(() => (escBus.modalHandled = false), 200);

        return;
      }

      // Normal ESC behavior (only when no modal)
      if (pathname.endsWith("/company")) {
        router.push(pathname.replace("/company", ""));
      }

      return;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [jump, pathname, router]);

  return (
    <>
      {children}
      {/* {jump && (
        <AdminJumpModal
          type={jump}
          close={() => setJump(null)}
          userRole={userRole}
        />
      )} */}
    </>
  );
}
