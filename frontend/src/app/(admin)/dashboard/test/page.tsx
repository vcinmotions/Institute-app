import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import TaskTable from "../../(ui-elements)/task-table/page";
import TestTable from "../../(ui-elements)/test-table/page";

export const metadata: Metadata = {
  title: "Tests & Exams",
};

export default function Task() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FACULTY"]}>
      <PageBreadcrumb pageTitle="Tests & Exams" />
      <TestTable />
    </RoleProtected>
  );
}
