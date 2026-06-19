'use client'
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const PageBreadcrumb = dynamic(() => import("@/components/common/PageBreadCrumb"));
const UserBackUpCard = dynamic(() => import("@/components/user-profile/UserBackupCard"));

export default function Profile() {
    const user = useSelector((state: RootState) => state.auth.user);

    console.log("GET USER IN MASTER PROFILE:", user);

    return (
        <div>
            <PageBreadcrumb pageTitle="System Settings" />

            {/* High density structural view panel */}
            <div className="space-y-4">
                <UserBackUpCard />
            </div>
        </div>
    );
}