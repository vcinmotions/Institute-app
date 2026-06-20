import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import AdmissionTable from "../../(ui-elements)/admission-table/page";

export const metadata: Metadata = {
  title: "Admission",
};

export default function Admission() {
  return (
    <RoleProtected allowedRoles={["ADMIN"]}>
      <PageBreadcrumb pageTitle="Admission" />

      <AdmissionTable />

    </RoleProtected>
  );
}
