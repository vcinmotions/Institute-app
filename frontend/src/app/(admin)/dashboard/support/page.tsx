import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SupportView from "@/components/support/SupportView";

export const metadata: Metadata = { title: "Support center" };

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support center" />
      <SupportView statusHref="/dashboard/api-status" />
    </div>
  );
}
