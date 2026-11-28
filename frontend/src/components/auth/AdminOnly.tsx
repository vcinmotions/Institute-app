"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { usePermissions } from "@/hooks/usePermissions";

/** True only for the admin (institute ADMIN, or the master admin on the web). Custom-role users are not admins. */
export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const user = useSelector((state: RootState) => state.auth.user);
  const { custom, loading } = usePermissions();
  const isAdmin = !!user && ["ADMIN", "MASTER_ADMIN"].includes(user.role) && !custom;
  return { isAdmin, loading: !user || loading };
}

/** Shows the page to the admin only; anyone else is sent to the dashboard. */
export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAdmin, loading } = useIsAdmin();

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/dashboard");
  }, [isAdmin, loading, router]);

  return isAdmin ? <>{children}</> : null;
}
