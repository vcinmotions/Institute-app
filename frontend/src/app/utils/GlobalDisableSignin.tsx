"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function GlobalDisableSignin() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  console.log("GET USER IN GLOAB DISABLE COMPONENT:", user);
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    // Only block the signin page — no redirects anywhere else
    if (token && pathname === "/signin") {
      if (
        user?.role === "ADMIN" ||
        user?.role === "FRONT_DESK" ||
        user?.role === "ACCOUNTANT" ||
        user?.role === "VIEW_ONLY"
      ) {
        router.replace("/dashboard");
      } else if (user?.role === "MASTER_ADMIN") {
        router.replace("/master-dashboard");
      }
    }
  }, [router, pathname]);

  return null;
}
