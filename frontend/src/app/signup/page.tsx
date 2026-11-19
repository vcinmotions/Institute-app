"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CompanyForm from "@/app/(admin)/master-dashboard/company/form/createCompany";

function SignupInner() {
  const plan = useSearchParams().get("plan") || "";
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Register your institute
          </h1>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <span aria-hidden>←</span> Back to home
          </Link>
        </div>
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
