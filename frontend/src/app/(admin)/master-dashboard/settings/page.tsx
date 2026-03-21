'use client'
import dynamic from "next/dynamic";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import UserBackUpCard from "@/components/user-profile/UserBackupCard";

const PageBreadcrumb = dynamic(() => import("@/components/common/PageBreadCrumb"));
const UserAddressCard = dynamic(() => import("@/components/user-profile/UserAddressCard"));

export default function Profile() {
    const user = useSelector((state: RootState) => state.auth.user);

    console.log("GET USER IN MASTER PROFILE:", user);

    return (
        <div>
            <PageBreadcrumb pageTitle="Settings" />
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

                <div className="space-y-6">
                    <UserBackUpCard />
                </div>
            </div>
        </div>
    );
}
