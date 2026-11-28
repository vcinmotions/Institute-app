import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import CompanyCompare from "@/components/reports/CompanyCompare";

export const metadata: Metadata = {
  title: "Compare Companies",
};

export default function CompareCompaniesPage() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "ACCOUNTANT"]}>
      <PageBreadcrumb pageTitle="Compare Companies" />
      <CompanyCompare />
    </RoleProtected>
  );
}
