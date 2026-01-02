// src/hooks/useLogout.ts
"use client";

import { forceLogout } from "@/app/utils/forceLogout";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    // Remove token
    sessionStorage.removeItem("token");

    // Clear global user context (optional)
    forceLogout();

    // Redirect to login or homepage
    //router.replace("/signin");
  };

  return logout;
};
