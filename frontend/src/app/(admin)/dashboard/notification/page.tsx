import NotificationTable from "../../(ui-elements)/notification-table/page";
import RoleProtected from "@/components/auth/RoleProtected";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notification",
};

export default function Notification() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="Notification" />
        <NotificationTable />
    </RoleProtected>
  );
}
