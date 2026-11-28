import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import RolesTable from "../../(ui-elements)/roles-table/page";

export const metadata: Metadata = {
  title: "App Users",
};

export default function Roles() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
        <PageBreadcrumb pageTitle="App Users" />
        <RolesTable />
    </RoleProtected>
  );
}
