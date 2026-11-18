"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CompanyForm from "@/app/(admin)/master-dashboard/company/form/createCompany";

function SignupInner() {
  const plan = useSearchParams().get("plan") || "";
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
          Register your institute
        </h1>
        <CompanyForm portal plan={plan} />
      </div>
    </main>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}
