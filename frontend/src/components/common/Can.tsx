"use client";

import React from "react";
import { Action, usePermissions } from "@/hooks/usePermissions";

/** Renders children only if the user may perform `action` on `module` (always true for built-in roles). */
export default function Can({ module, action = "view", children }: { module: string; action?: Action; children: React.ReactNode }) {
  const { can, loading, custom } = usePermissions();
  if (loading && !custom) return <>{children}</>;
  return can(module, action) ? <>{children}</> : null;
}
