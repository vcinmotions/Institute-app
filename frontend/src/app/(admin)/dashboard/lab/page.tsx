import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import LabTable from "../../(ui-elements)/lab-table/page";

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Lab() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
      <div>
        <PageBreadcrumb pageTitle="Lab" />
       
            <LabTable />
          </div>
        
    </RoleProtected>
  );
}
