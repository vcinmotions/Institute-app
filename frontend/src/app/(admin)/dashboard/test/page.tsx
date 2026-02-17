import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import CourseTable from "../../(ui-elements)/course-table/page";

export const metadata: Metadata = {
  title: "Course",
};

export default function Course() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="Course" />
        
            <CourseTable />
        
    </RoleProtected>
  );
}
