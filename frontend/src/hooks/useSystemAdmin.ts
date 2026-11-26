"use client";

import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { apiClient } from "@/lib/apiClient";

/**
 * Whether the signed-in user may open the System screens (settings, backup, branding, health, updates).
 * In the desktop EXE that is the institute admin (one admin concept). The server decides; this only asks it.
 */
export function useSystemAdminState() {
  const user = useSelector((state: RootState) => state.auth.user);
  const candidate = user?.role === "ADMIN";
  const { data, isLoading } = useQuery({
    queryKey: ["system-access", user?.id],
    queryFn: async () => {
      try {
        return !!(await apiClient.get("/system/access")).data?.ok;
      } catch {
        return false;
      }
    },
    enabled: candidate,
    staleTime: 5 * 60_000,
    retry: false,
  });
  return { allowed: candidate && !!data, loading: !user || (candidate && isLoading) };
}

export const useSystemAdmin = (): boolean => useSystemAdminState().allowed;
