import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import SourceTable from "../../(ui-elements)/source-table/page";

export const metadata: Metadata = {
  title: "Source",
};

export default function Source() {
  return (
    <RoleProtected allowedRoles={["ADMIN"]}>
        <PageBreadcrumb pageTitle="Source" />
            <SourceTable />
    </RoleProtected>
  );
}
