"use client";

import { usePermissions } from "@/hooks/usePermissions";

const MODULES = ["enquiry", "followup", "admission", "payment", "course", "faculty", "batch", "lab", "class", "source", "stationary", "attendance", "task", "test", "expense", "reports", "users", "settings"];
const ACTIONS = ["view", "add", "update", "delete"] as const;

/**
 * Hides every action control (marked data-perm="action:module") the signed-in user may not use
 * (custom roles and built-in roles other than ADMIN). The server enforces permissions regardless.
 */
export default function PermissionStyles() {
  const { restricted, can } = usePermissions();
  if (!restricted) return null; // ADMIN
  const css = MODULES.flatMap((m) => ACTIONS.filter((a) => !can(m, a)).map((a) => `[data-perm="${a}:${m}"]{display:none !important}`)).join("\n");
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
