import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import TaskTable from "../../(ui-elements)/task-table/page";

export const metadata: Metadata = {
  title: "Task",
};

export default function Task() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FACULTY"]}>
      <PageBreadcrumb pageTitle="Task" />
      <TaskTable />
    </RoleProtected>
  );
}
