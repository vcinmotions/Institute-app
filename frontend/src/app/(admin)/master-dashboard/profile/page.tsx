'use client'
import dynamic from "next/dynamic";

import React from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

const PageBreadcrumb = dynamic(() => import("@/components/common/PageBreadCrumb"));
const UserAddressCard = dynamic(() => import("@/components/user-profile/UserAddressCard"));
const UserInfoCard = dynamic(() => import("@/components/user-profile/UserInfoCard"));
const UserMetaCard = dynamic(() => import("@/components/user-profile/UserMetaCard"));

export default function Profile() {
   const user = useSelector((state: RootState) => state.auth.user);

   console.log("GET USER IN MASTER PROFILE:", user);
  
  return (
    <div>
        <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}
        
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
