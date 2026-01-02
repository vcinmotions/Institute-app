import React from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";

// Dynamic imports for user profile components
const PageBreadcrumb = dynamic(
  () => import("@/components/common/PageBreadCrumb"),
);
const UserAddressCard = dynamic(
  () => import("@/components/user-profile/UserAddressCard"),
);
const UserInfoCard = dynamic(
  () => import("@/components/user-profile/UserInfoCard"),
);
const UserMetaCard = dynamic(
  () => import("@/components/user-profile/UserMetaCard"),
);

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Profile() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
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
