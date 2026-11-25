"use client";

import { usePermissions } from "@/hooks/usePermissions";

const MODULES = ["enquiry", "admission", "payment", "course", "faculty", "batch", "lab", "source", "stationary", "attendance", "task", "test", "expense", "reports", "users", "settings"];
const ACTIONS = ["add", "update", "delete"] as const;

/**
 * Hides every action control (marked data-perm="action:module") the signed-in custom-role user may not use.
 * Built-in roles produce no rules, so their screens are unchanged. The server enforces permissions regardless.
 */
export default function PermissionStyles() {
  const { custom, can } = usePermissions();
  if (!custom) return null;
  const css = MODULES.flatMap((m) => ACTIONS.filter((a) => !can(m, a)).map((a) => `[data-perm="${a}:${m}"]{display:none !important}`)).join("\n");
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
