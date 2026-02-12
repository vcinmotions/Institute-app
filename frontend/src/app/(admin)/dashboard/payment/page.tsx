import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import PaymentTable from "../../(ui-elements)/payment-table/page";

export const metadata: Metadata = {
  title: "Payment",
};

export default function Payment() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "ACCOUNTANT"]}>
        <PageBreadcrumb pageTitle="Student Payment" />

        <PaymentTable />
    </RoleProtected>
  );
}
