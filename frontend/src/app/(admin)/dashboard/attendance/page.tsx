import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import RoleProtected from "@/components/auth/RoleProtected";

import AttendanceTable from "../../(ui-elements)/attendance-table/page";

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Attendance() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FACULTY"]}>
      <div>
        <PageBreadcrumb pageTitle="Attendance" />
       
            <AttendanceTable />
          </div>
        
    </RoleProtected>
  );
}
