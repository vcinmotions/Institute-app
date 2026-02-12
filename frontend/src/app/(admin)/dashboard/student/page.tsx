import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import StudentTable from "../../(ui-elements)/student-table/page";

export const metadata: Metadata = {
  title: "Student",
};

export default function Student() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="Students" />
        <StudentTable />
    </RoleProtected>
  );
}
