import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SupportView from "@/components/support/SupportView";
import AdminOnly from "@/components/auth/AdminOnly";

export const metadata: Metadata = { title: "Support center" };

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support center" />
      <AdminOnly>
        <SupportView statusHref="/dashboard/api-status" />
      </AdminOnly>
    </div>
  );
}
