'use client'
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const PageBreadcrumb = dynamic(() => import("@/components/common/PageBreadCrumb"));
const UserBackUpCard = dynamic(() => import("@/components/user-profile/UserBackupCard"));
const LicenseCard = dynamic(() => import("@/components/user-profile/LicenseCard"));
const SessionSettingsCard = dynamic(() => import("@/components/user-profile/SessionSettingsCard"));

export default function Profile() {
    const user = useSelector((state: RootState) => state.auth.user);

    console.log("GET USER IN MASTER PROFILE:", user);
    // Desktop EXE: no idle sign-out (only the weekly sign-out), so its setting is not shown there.
    const [inExe, setInExe] = useState(false);
    useEffect(() => setInExe(!!window.electronAPI), []);

    return (
        <div>
            <PageBreadcrumb pageTitle="System Settings" />

            {/* High density structural view panel */}
            <div className="space-y-4">
                <LicenseCard />
                <UserBackUpCard />
                {inExe ? (
                    <div className="rounded border border-slate-100 bg-slate-50/40 p-4 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/10 dark:text-slate-300">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Sign-out</h4>
                        <p className="mt-1">
                            Users stay signed in when the application is closed or the PC is not in use. Everyone is signed out
                            automatically once a week, on Sunday at 11:59 PM, and signs in again on next use.
                        </p>
                    </div>
                ) : (
                    <SessionSettingsCard />
                )}
            </div>
        </div>
    );
}