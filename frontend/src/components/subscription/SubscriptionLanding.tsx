"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

const NOTES: Record<string, string> = {
  SIX_MONTH: "Best for a trial season",
  ONE_YEAR: "Best value",
};

/** Public website root: subscription plans -> registration -> payment. */
export default function SubscriptionLanding() {
  const [plans, setPlans] = useState<
    { id: string; name: string; price: string; note: string; featured?: boolean }[]
  >([]);

  // Prices are set by the super admin (Subscription Pricing page).
  useEffect(() => {
    apiClient
      .get("/plans")
      .then(({ data }) =>
        setPlans(
          data.map((p: any) => ({
            id: p.code,
            name: p.name,
            price: p.price > 0 ? String(p.price) : "—",
            note: NOTES[p.code] ?? "",
            featured: p.code === "ONE_YEAR",
          })),
        ),
      )
      .catch(() => setPlans([]));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold md:text-4xl">vcinmotions Institute ERP</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-300">
          Choose a plan, register your institute and pay online. Then install the Windows app and
          sign in with your account.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border bg-white p-8 text-left shadow-sm dark:bg-gray-900 ${
                p.featured ? "border-brand-500 ring-2 ring-brand-500/30" : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <p className="text-sm text-gray-500">{p.note}</p>
              <h2 className="mt-1 text-2xl font-semibold">{p.name}</h2>
              <p className="mt-4 text-3xl font-bold">
                {p.price === "—" ? p.price : `₹${p.price}`}
              </p>
              <Link
                href={`/signup?plan=${p.id}`}
                className="mt-6 block rounded-lg bg-brand-500 px-4 py-3 text-center font-medium text-white hover:bg-brand-600"
              >
                Register &amp; Subscribe
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Already subscribed?{" "}
          <Link href="/subscription" className="text-brand-500 underline">
            Sign in to manage or renew
          </Link>
        </p>
      </div>
    </main>
  );
}
