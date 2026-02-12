import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import BatchTable from "../../(ui-elements)/batch-table/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Batch",
};

export default function Batch() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="Batch" />
            <BatchTable />    
    </RoleProtected>
  );
}
