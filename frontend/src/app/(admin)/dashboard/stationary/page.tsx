import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import CourseTable from "../../(ui-elements)/course-table/page";
import StationaryTable from "../../(ui-elements)/stationary-table/page";

export const metadata: Metadata = {
  title: "Stationary",
};

export default function Stationary() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="Stationary" />
        
            <StationaryTable />
        
    </RoleProtected>
  );
}
