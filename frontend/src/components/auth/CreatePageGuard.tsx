"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

/** /dashboard/<folder>/create -> permission module (same names as Role Access). */
const MODULE_BY_FOLDER: Record<string, string> = {
  "admission-config": "settings",
  batch: "batch",
  class: "class",
  course: "course",
  enquiry: "enquiry",
  faculty: "faculty",
  lab: "lab",
  roles: "users",
  source: "source",
  stationary: "stationary",
  task: "task",
  test: "test",
};

/**
 * A "Create ..." page opened by a user who may not add in that module (typed address, F2 shortcut, old link)
 * shows nothing and goes back to the list. The menu and buttons are already hidden; the server refuses regardless.
 */
export default function CreatePageGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { can, loading } = usePermissions();

  const folder = /^\/dashboard\/([^/]+)\/create\/?$/.exec(pathname)?.[1];
  const mod = folder ? MODULE_BY_FOLDER[folder] : undefined;
  const blocked = !!mod && !loading && !can(mod, "add");

  useEffect(() => {
    if (blocked && folder) router.replace(`/dashboard/${folder}`);
  }, [blocked, folder, router]);

  if (mod && (loading || blocked)) return null;
  return <>{children}</>;
}
