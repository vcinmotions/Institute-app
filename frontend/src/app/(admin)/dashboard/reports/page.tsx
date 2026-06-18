import { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import SourceTable from "../../(ui-elements)/source-table/page";
import ReportsDashboard from "../../(ui-elements)/reports/page";

export const metadata: Metadata = {
    title: "Reports",
};

export default function Reports() {
    return (
        <RoleProtected allowedRoles={["ADMIN"]}>
            <PageBreadcrumb pageTitle="Reports" />
            <ReportsDashboard />
        </RoleProtected>
    );
}
