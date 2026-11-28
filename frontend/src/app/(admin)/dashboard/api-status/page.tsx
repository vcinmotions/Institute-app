import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ApiStatusView from "@/components/support/ApiStatusView";
import AdminOnly from "@/components/auth/AdminOnly";

export const metadata: Metadata = { title: "API status" };

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="API status" />
      <AdminOnly>
        <ApiStatusView />
      </AdminOnly>
    </div>
  );
}
