"use client";
import React, { useEffect } from "react";
import { getMasterUser } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
//import PageBreadcrumb from "@/components/common/PageBreadCrumb";
//import CompanyTable from "../(ui-elements)/company-table/page";
import { setCountry, setStateLocation, setUser } from "@/store/slices/authSlice";
import RoleProtected from "@/components/auth/RoleProtected";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompanyTable from "../(ui-elements)/company-table/page";

// export const metadata: Metadata = {
//   title:
//     "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };

export default function MasterDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // ✅ Prevent UI flash

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.warn("No token found.");
        router.replace("/signin"); // or "/login"
        return; // ✅ return early to prevent `getUser(null)`
      }

      try {
        const data = await getMasterUser(token);
        setLoading(false); // ✅ All good, show dashboard
        dispatch(setUser(data.userdata));
        dispatch(setCountry(data.userdata));
        dispatch(setStateLocation(data.userdata));
        console.log("👤 Get Master User Data in Master Admin Layout:", data);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  // if (loading) {
  //   return null; // or a loading spinner
  // }

  return (
    <RoleProtected allowedRoles={["MASTER_ADMIN"]}>
      <div>
        <PageBreadcrumb pageTitle="Company" />

        <CompanyTable />
      </div>
    </RoleProtected>
  );
}
