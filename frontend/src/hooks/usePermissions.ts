"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export type Action = "view" | "add" | "update" | "delete";
type Perm = { view: boolean; add: boolean; update: boolean; delete: boolean };
type MyPerms = { custom: boolean; role: string; permissions: Record<string, Perm> | null };

/**
 * Permissions of the signed-in user for the custom (Super-Admin defined) roles.
 * Built-in roles (ADMIN, FRONT_DESK, ...) keep their existing UI rules, so `can()` is true for them.
 * This only hides/disables UI; the server enforces every request regardless.
 */
export function usePermissions() {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  const { data, isLoading } = useQuery<MyPerms>({
    queryKey: ["my-permissions", token?.slice(-12)],
    queryFn: async () => (await apiClient.get("/my-permissions")).data,
    enabled: !!token,
    staleTime: 30_000,
  });
  const custom = !!data?.custom;
  const can = (module: string, action: Action = "view") =>
    !custom || !!data?.permissions?.[module]?.[action];
  return { custom, loading: isLoading, can, roleName: data?.role };
}
