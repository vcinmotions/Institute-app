import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleProtected from "@/components/auth/RoleProtected";
import BatchTable from "../../(ui-elements)/batch-table/page";

export default function Batch() {
  return (
    <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
      <div>
        <PageBreadcrumb pageTitle="Batch" />
        
            <BatchTable />
          </div>
        
    </RoleProtected>
  );
}
