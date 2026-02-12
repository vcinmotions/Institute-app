import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import FacultyTable from "../../(ui-elements)/faculty-table/page";

export const metadata: Metadata = {
  title: "Faculty",
};

export default function Faculty() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="Faculty" />
            <FacultyTable />
    </RoleProtected>
  );
}
