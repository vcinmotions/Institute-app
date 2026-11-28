"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSystemAdminState } from "@/hooks/useSystemAdmin";

/** Shows a System page only to the admin the server allows (see useSystemAdmin); others go to the dashboard. */
export default function SystemAdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { allowed, loading } = useSystemAdminState();

  useEffect(() => {
    if (!loading && !allowed) router.replace("/dashboard");
  }, [allowed, loading, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
