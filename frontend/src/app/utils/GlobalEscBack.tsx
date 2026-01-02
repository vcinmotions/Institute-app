"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { escBus } from "./escBus";

export default function GlobalEscBack() {
  const router = useRouter();
  const pathname = usePathname();

  console.log("GET PATHNAME GLOBALLY:", pathname);

  useEffect(() => {
    // const handleKey = (e: KeyboardEvent) => {
    //   // ESC key (Escape)
    //   if (e.key === "Escape") {
    //     e.preventDefault();
    //     router.back();
    //   }
    // };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      console.log("GET ESCBUS HANDLE IN GLOBAL ESC:", escBus.modalHandled);
      // If modal already consumed ESC, do nothing
      if (escBus.modalHandled) {
        return;
      }

      // Disable ESC on these pages
      //const blockedPaths = ["/dashboard", "/master-dashboard"];

      const currentPath = window.location.pathname; // always current
      // Only block ESC on exact paths
      const blockedPaths = ["/dashboard", "/master-dashboard"];

      const isBlocked = blockedPaths.includes(currentPath);
      console.log("GET BLOCKED PATHNAM:", isBlocked);
      if (isBlocked) return;

      e.preventDefault();
      router.back();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  return null; // no UI
}
