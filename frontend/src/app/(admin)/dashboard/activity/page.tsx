"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamic imports now work with ssr: false
const PageBreadcrumb = dynamic(
  () => import("@/components/common/PageBreadCrumb"),
  { ssr: false },
);
const RoleProtected = dynamic(() => import("@/components/auth/RoleProtected"), {
  ssr: false,
});
const ActivityTable = dynamic(
  () => import("../../(ui-elements)/activity-table/page"),
  { ssr: false },
);

export default function Activity() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
      <div>
        <PageBreadcrumb pageTitle="Activity" />

        <ActivityTable />
      </div>
    </RoleProtected>
  );
}
