"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export type Action = "view" | "add" | "update" | "delete";
type Perm = { view: boolean; add: boolean; update: boolean; delete: boolean };
type MyPerms = { custom: boolean; role: string; permissions: Record<string, Perm> | null };

/**
 * Permissions of the signed-in user: custom roles (Role Access) and the built-in roles (FRONT_DESK, ACCOUNTANT,
 * VIEW_ONLY, FACULTY) both get a permission table from the server; ADMIN can do everything.
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
  // Custom roles AND built-in roles other than ADMIN come with a permission table from the server
  // (the same rules it enforces). No table (ADMIN) = everything allowed.
  const restricted = !!data?.permissions;
  const can = (module: string, action: Action = "view") =>
    !restricted || !!data?.permissions?.[module]?.[action];
  return { custom, restricted, loading: isLoading, can, roleName: data?.role };
}
