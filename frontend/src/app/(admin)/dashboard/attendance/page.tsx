import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import RoleProtected from "@/components/auth/RoleProtected";

import AttendanceTable from "../../(ui-elements)/attendance-table/page";

export const metadata: Metadata = {
  title: "Attendance",
};

export default function Attendance() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FACULTY"]}>
        <PageBreadcrumb pageTitle="Attendance" />
        <AttendanceTable />
    </RoleProtected>
  );
}
