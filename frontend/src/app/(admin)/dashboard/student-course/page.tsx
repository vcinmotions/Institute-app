import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import StudentCourseTable from "../../(ui-elements)/student-course-table/page";

export const metadata: Metadata = {
  title: "Student Course",
};

export default function StudentCourse() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK", "FACULTY"]}>
      <div>
        <PageBreadcrumb pageTitle="Student Course" />
        <StudentCourseTable />
      </div>
    </RoleProtected>
  );
}
