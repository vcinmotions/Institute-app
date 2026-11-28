import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import ClassTable from "../../(ui-elements)/class-table/page";

export const metadata: Metadata = {
  title: "Class",
};

export default function ClassPage() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
      <PageBreadcrumb pageTitle="Class" />
      <ClassTable />
    </RoleProtected>
  );
}
