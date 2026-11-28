import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ApiStatusView from "@/components/support/ApiStatusView";

export const metadata: Metadata = { title: "API status" };

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="API status" />
      <ApiStatusView master healthHref="/master-dashboard/health" />
    </div>
  );
}
