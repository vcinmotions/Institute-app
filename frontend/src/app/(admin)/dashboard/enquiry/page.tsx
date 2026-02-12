import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EnquiryTable from "../../(ui-elements)/enquiry-table/page";
import RoleProtected from "@/components/auth/RoleProtected";

export const metadata: Metadata = {
  title: "Enquiry",
};

export default function Enquiry() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
      <PageBreadcrumb pageTitle="Enquiry" />
      <EnquiryTable />
    </RoleProtected>
  );
}
