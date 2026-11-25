"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export type Perm = { view: boolean; add: boolean; update: boolean; delete: boolean };
export type AccessRole = { id: number; name: string; description: string | null; isDefault?: boolean; userCount: number; permissions: Record<string, Perm> };
export type ModuleInfo = { key: string; label: string };

/** Super Admin: custom roles + the module list (also used to offer them in the user form). */
export function useAccessRoles(enabled = true) {
  return useQuery<{ modules: ModuleInfo[]; roles: AccessRole[] }>({
    queryKey: ["access-roles"],
    queryFn: async () => (await apiClient.get("/access-roles")).data,
    enabled: enabled && typeof window !== "undefined" && !!sessionStorage.getItem("token"),
  });
}
