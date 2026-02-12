import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import LabTable from "../../(ui-elements)/lab-table/page";

export const metadata: Metadata = {
  title: "Lab",
};

export default function Lab() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="Lab" />
            <LabTable />
    </RoleProtected>
  );
}
