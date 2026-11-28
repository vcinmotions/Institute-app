"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import DownloadAppButton from "./DownloadAppButton";

const NOTES: Record<string, string> = {
  SIX_MONTH: "Best for a trial season",
  ONE_YEAR: "Best value",
};

const FEATURES = [
  { icon: "📥", title: "Enquiry & Admission", text: "Capture enquiries, follow them up and convert them into admissions in a few clicks." },
  { icon: "🎓", title: "Students & Courses", text: "Manage student records, courses, batches and course enrolments from one place." },
  { icon: "💳", title: "Fees & Receipts", text: "Collect payments, track pending fees and print branded receipts with your logo, stamp and signature." },
  { icon: "🗓️", title: "Attendance", text: "Mark and review attendance by batch, so you always know who is turning up." },
  { icon: "🧑‍🏫", title: "Faculty & Roles", text: "Add faculty and staff, and control exactly what each role is allowed to see and do." },
  { icon: "🖥️", title: "Labs & Timetable", text: "Plan lab slots and batch schedules without clashes." },
  { icon: "📝", title: "Tests & Certificates", text: "Run tests, record results and issue certificates from ready-made templates." },
  { icon: "📊", title: "Reports & Expenses", text: "Track income and expenses by financial year and get the reports you need at a glance." },
];

const STEPS = [
  { n: "1", title: "Choose a plan", text: "Pick the 6-month or 1-year plan that suits your institute." },
  { n: "2", title: "Register your institute", text: "Fill in your institute details and create your admin account." },
  { n: "3", title: "Pay online", text: "Complete a secure online payment. Your subscription starts right away." },
  { n: "4", title: "Install & sign in", text: "Install the Windows app and sign in with the account you just created." },
];

const HIGHLIGHTS = [
  "Your own private database for every institute",
  "Automatic backup database",
  "Financial-year based accounting",
  "Role-based access for your team",
  "Works as a Windows desktop app",
  "Renew any time from this website",
];

const FAQ = [
  { q: "Do I need to register anything before subscribing?", a: "No. Choose a plan, register your institute on the next page and pay online. Nothing else is required." },
  { q: "Is there a free trial?", a: "Yes. New customers can start with a 1-month free trial when they register: no payment up front, and you pick a plan before the month ends. One trial per business email or phone number." },
  { q: "Where do I use the software after paying?", a: "Install the Windows app and sign in with the username and password you chose while registering." },
  { q: "How do I renew?", a: "Use “Sign in to manage or renew” on this page, sign in with your account and pay for a new plan." },
  { q: "Is my institute's data kept separate from others?", a: "Yes. Every institute gets its own database, so your records are never mixed with anyone else's." },
];

/** Public website root: subscription plans -> registration -> payment. */
export default function SubscriptionLanding() {
  const [plans, setPlans] = useState<
    { id: string; name: string; price: string; note: string; featured?: boolean }[]
  >([]);

  // The page appears after a client-side check, so the browser's own scroll to "#pricing" can
  // fire before the section exists. Scroll to the hash once the landing page is on screen.
  useEffect(() => {
    const go = () => {
      const id = window.location.hash.replace("#", "");
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t = window.setTimeout(go, 50);
    window.addEventListener("hashchange", go);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", go);
    };
  }, []);

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
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold tracking-tight">
            vcin<span className="text-brand-500">motions</span>
          </span>
          <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex dark:text-gray-300">
            <a href="#features" className="hover:text-brand-500">Features</a>
            <a href="#how" className="hover:text-brand-500">How it works</a>
            <a href="#pricing" className="hover:text-brand-500">Pricing</a>
            <a href="#faq" className="hover:text-brand-500">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <DownloadAppButton />
            <Link href="/subscription" className="rounded-lg px-3 py-2 text-sm font-medium hover:text-brand-500">
              Sign in
            </Link>
            <a href="#pricing" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(70,95,255,0.18),transparent)]" />
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center md:pt-24">
          <span className="inline-block rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400">
            Institute management, simplified
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Run your whole institute from{" "}
            <span className="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">
              one smart ERP
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Enquiries, admissions, fees, attendance, tests and reports — everything your coaching
            institute needs, in one place. Choose a plan, register and start in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#pricing" className="rounded-lg bg-brand-500 px-6 py-3 font-medium text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600">
              View plans
            </a>
            <a href="#features" className="rounded-lg border border-gray-300 px-6 py-3 font-medium hover:border-brand-500 hover:text-brand-500 dark:border-gray-700">
              See features
            </a>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["20+", "Modules"],
              ["1", "Private DB per institute"],
              ["Role-based", "Team access"],
              ["Online", "Payments & renewal"],
            ].map(([big, small]) => (
              <div key={small} className="rounded-xl border border-gray-200 bg-white/70 p-4 dark:border-gray-800 dark:bg-gray-900/70">
                <p className="text-xl font-bold text-brand-500">{big}</p>
                <p className="mt-1 text-xs text-gray-500">{small}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Everything your institute needs</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            From the first enquiry to the final certificate, manage every step without spreadsheets.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl dark:bg-brand-500/10">
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900/50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Built for safety and day-to-day speed</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Your records stay yours. Each institute is set up with its own database and a backup,
              and your team only sees what their role allows.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-900">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs text-white">✓</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Get started in four steps</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 bg-gray-50 py-16 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Every plan includes all modules. Pick the length that fits you.
          </p>

          <div className={`mx-auto mt-10 grid gap-6 ${plans.length > 1 ? "max-w-5xl md:grid-cols-3" : "max-w-md"}`}>
            {/* Free trial for new customers */}
            <div className="relative rounded-2xl border border-green-500/60 bg-white p-8 text-left shadow-sm dark:bg-gray-900">
              <span className="absolute -top-3 left-6 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                New customers
              </span>
              <p className="text-sm text-gray-500">Try everything first</p>
              <h3 className="mt-1 text-2xl font-semibold">Free Trial</h3>
              <p className="mt-4 text-4xl font-bold">
                ₹0 <span className="text-base font-medium text-gray-500">for 1 month</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {["All modules included", "Windows app access", "No payment needed to start", "Choose a plan before it ends"].map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-500">✓</span> {i}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?trial=1"
                className="mt-6 block rounded-lg bg-green-500 px-4 py-3 text-center font-medium text-white hover:bg-green-600"
              >
                Start free trial
              </Link>
            </div>

            {plans.map((p) => (
              <div
                key={p.id}
                className={`relative rounded-2xl border bg-white p-8 text-left shadow-sm dark:bg-gray-900 ${
                  p.featured
                    ? "border-brand-500 ring-2 ring-brand-500/30 md:-translate-y-2"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 right-6 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
                <p className="text-sm text-gray-500">{p.note}</p>
                <h3 className="mt-1 text-2xl font-semibold">{p.name}</h3>
                <p className="mt-4 text-4xl font-bold">
                  {p.price === "—" ? p.price : `₹${p.price}`}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {["All modules included", "Windows app access", "Private database & backup", "Online renewal"].map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-brand-500">✓</span> {i}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/signup?plan=${p.id}`}
                  className={`mt-6 block rounded-lg px-4 py-3 text-center font-medium ${
                    p.featured
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                  }`}
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
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <span className="ml-4 text-brand-500 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-brand-500 to-purple-600 px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to organise your institute?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Register today, pay online and start managing students, fees and attendance right away.
          </p>
          <a href="#pricing" className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-medium text-brand-600 hover:bg-gray-100">
            Choose your plan
          </a>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800">
        © {new Date().getFullYear()} vcinmotions Institute ERP. All rights reserved.
      </footer>
    </main>
  );
}
