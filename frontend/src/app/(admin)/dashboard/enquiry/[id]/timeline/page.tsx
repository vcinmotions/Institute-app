"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import TimelineDatatable from "@/app/(admin)/(ui-elements)/timeline/TimelineComponent";
import RoleProtected from "@/components/auth/RoleProtected";

export default function EnquiryTimelinePage() {
    const params = useParams();
    const router = useRouter();

    // Safely extract the ID from route paths
    const enquiryId = Array.isArray(params.id) ? params.id[0] : params.id;

    if (!enquiryId) {
        return <div className="p-6 text-sm text-red-500">Invalid Enquiry Reference.</div>;
    }

    return (
        <RoleProtected allowedRoles={["ADMIN", "FRONT_DESK"]}>
            {/* Back Navigation Bar */}
            {/* <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Enquiries
                </button>
            </div> */}

            <TimelineDatatable enquiryId={enquiryId} />

        </RoleProtected>
    );
}