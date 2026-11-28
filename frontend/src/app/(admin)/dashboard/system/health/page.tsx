"use client";
// Desktop EXE: the institute admin opens the former master screen here, inside the normal dashboard.
import SystemAdminOnly from "@/components/auth/SystemAdminOnly";
import Screen from "../../../master-dashboard/health/page";

export default function SystemPage() {
  return (
    <SystemAdminOnly>
      <Screen />
    </SystemAdminOnly>
  );
}
