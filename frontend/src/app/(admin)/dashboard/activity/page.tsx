import RoleProtected from "@/components/auth/RoleProtected";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import ActivityTable from "../../(ui-elements)/activity-table/page";

export const metadata: Metadata = {
  title: "Logs",
};

export default function Activity() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="Activity" />
        <ActivityTable />
    </RoleProtected>
  );
}
