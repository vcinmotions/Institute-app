"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PortalCompanies from "./PortalCompanies";
import PortalProfileCard from "./PortalProfileCard";
import { USER_TIERS, DEFAULT_TIER_MULTIPLIERS, tierLabel, planPrice, Plan } from "@/lib/userTiers";
import { portalApi, getPortalToken, setPortalToken, portalAuthHeader } from "@/lib/portalApi";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type Profile = {
  instituteName: string;
  name: string;
  businessEmail: string | null;
  contact: string;
  fullAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  createdAt: string;
} | null;
type Me = {
  email: string;
  status: string;
  plan: string;
  expiryDate: string | null;
  startDate: string | null;
  daysLeft: number;
  profile: Profile;
  isCompany?: boolean;
  maxUsers?: number;
  masterName?: string | null;
};
type Payment = {
  orderId: string;
  paymentId: string | null;
  planCode: string;
  amount: number;
  currency: string;
  createdAt: string;
};

type Tab = "overview" | "plans" | "billing" | "companies" | "account";

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "plans", label: "Plans & Payment", icon: "💳" },
  { id: "billing", label: "Billing History", icon: "🧾" },
  { id: "companies", label: "Companies", icon: "🏢" },
  { id: "account", label: "My Institute", icon: "🏫" },
];

const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const card = "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900";

/** Web portal: sign in, see status, buy or renew a plan (Razorpay). */
export default function PortalSubscription() {
  const wantedPlan = useSearchParams().get("plan");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [maxUsers, setMaxUsers] = useState(1);
  const [mult, setMult] = useState<Record<string, number>>(DEFAULT_TIER_MULTIPLIERS);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [tab, setTab] = useState<Tab>(wantedPlan ? "plans" : "overview");

  const load = useCallback(async () => {
    try {
      const [m, p, pay] = await Promise.all([
        portalApi.get("/portal/me", { headers: portalAuthHeader() }),
        portalApi.get("/plans"),
        portalApi.get("/portal/payments", { headers: portalAuthHeader() }).catch(() => ({ data: [] })),
      ]);
      setMe(m.data);
      if (m.data?.maxUsers) setMaxUsers(m.data.maxUsers);
      setPlans(p.data);
      setPayments(pay.data);
      setAuthed(true);
    } catch {
      setPortalToken(null);
      setAuthed(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    portalApi
      .get("/app-settings")
      .then((r) => r.data?.userTierMultipliers && setMult(r.data.userTierMultipliers))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (getPortalToken()) load();
    else setChecking(false);
  }, [load]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const { data } = await portalApi.post("/portal/login", login);
      setPortalToken(data.token);
      await load();
    } catch (err: any) {
      setMsg({ type: "err", text: err?.response?.data?.error || "Sign in failed" });
    }
  };

  const logout = () => {
    setPortalToken(null);
    setAuthed(false);
    setMe(null);
  };

  const pay = async (plan: Plan) => {
    setMsg(null);
    setBusy(plan.code);
    try {
      if (!(await loadRazorpay())) throw new Error("Could not load the payment window");
      const { data: o } = await portalApi.post(
        "/portal/order",
        { plan: plan.code, maxUsers },
        { headers: portalAuthHeader() },
      );
      const rz = new window.Razorpay({
        key: o.keyId,
        order_id: o.orderId,
        amount: o.amount,
        currency: o.currency,
        name: "vcinmotions",
        description: `${o.planName} subscription`,
        handler: async (r: any) => {
          try {
            await portalApi.post("/portal/verify", r, { headers: portalAuthHeader() });
            setMsg({
              type: "ok",
              text: "Payment successful. Your subscription is active - open the app and it will unlock automatically.",
            });
            await load();
            setTab("overview");
          } catch {
            setMsg({ type: "ok", text: "Payment received. Activation may take a minute - refresh shortly." });
          }
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rz.open();
    } catch (err: any) {
      setMsg({ type: "err", text: err?.response?.data?.error || err?.message || "Payment failed" });
    } finally {
      setBusy(null);
    }
  };

  // ---------------- Sign in ----------------
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-4 inline-block text-sm text-gray-600 hover:text-brand-500 dark:text-gray-300">
            ← Back to home
          </Link>
          {checking ? (
            <div className={`${card} text-center text-sm text-gray-500`}>Loading...</div>
          ) : (
            <form onSubmit={doLogin} className={`${card} space-y-4`}>
              <div>
                <h1 className="text-xl font-semibold dark:text-white">Welcome back</h1>
                <p className="mt-1 text-sm text-gray-500">Sign in to manage your subscription.</p>
              </div>
              {(["email", "password"] as const).map((k) => (
                <input
                  key={k}
                  type={k === "email" ? "text" : "password"}
                  autoComplete={k === "email" ? "username" : "current-password"}
                  placeholder={k === "email" ? "Username" : "Password"}
                  value={login[k]}
                  onChange={(e) => setLogin({ ...login, [k]: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              ))}
              {msg && <p className="text-sm text-red-600">{msg.text}</p>}
              <button className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-white hover:bg-brand-600">
                Sign in
              </button>
              <p className="text-center text-sm text-gray-500">
                New here?{" "}
                <Link href="/#pricing" className="text-brand-500 underline">
                  See plans and register
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    );
  }

  // ---------------- Signed in: admin-style layout ----------------
  const active = me?.status === "ACTIVE";
  const isTrial = me?.plan === "TRIAL";
  const currentPlan = plans.find((p) => p.code === me?.plan);
  const totalDays = isTrial ? 30 : currentPlan ? currentPlan.months * 30 : 0;
  const pct = active && totalDays ? Math.min(100, Math.round(((me?.daysLeft ?? 0) / totalDays) * 100)) : 0;
  const expiringSoon = active && (me?.daysLeft ?? 0) <= 10;
  const displayName = me?.profile?.name || me?.profile?.instituteName || me?.email;
  const totalPaid = payments.reduce((a, p) => a + p.amount, 0);

  const badge = active
    ? expiringSoon
      ? ["Expiring soon", "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400"]
      : ["Active", "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"]
    : ["Inactive", "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white md:flex">
      {/* Sidebar */}
      <aside className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Link href="/" className="text-lg font-bold tracking-tight">
            vcin<span className="text-brand-500">motions</span>
          </Link>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-brand-500 md:hidden">
            Sign out
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-1 md:px-3 md:pb-0">
          <p className="mb-1 hidden px-3 pt-2 text-xs font-medium uppercase tracking-wider text-gray-400 md:block">
            Menu
          </p>
          {NAV.filter((n) => !(me?.isCompany && (n.id === "plans" || n.id === "companies"))).map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setTab(n.id);
                setMsg(null);
              }}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                tab === n.id
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="hidden px-3 md:absolute md:bottom-0 md:block md:w-64 md:pb-4">
          <div className="mb-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-gray-500">@{me?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-red-400 hover:text-red-600 dark:border-gray-700 dark:text-gray-200"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900 md:px-8">
          <h1 className="text-lg font-semibold">{NAV.find((n) => n.id === tab)?.label}</h1>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge[1]}`}>{badge[0]}</span>
            <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white sm:flex">
              {(displayName || "?").charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="space-y-6 p-5 md:p-8">
          {msg && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                msg.type === "ok"
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* ---------- Overview ---------- */}
          {tab === "overview" && (
            <>
              <div className={card}>
                <p className="text-sm text-gray-500">Hello, {displayName}</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold">
                    {active
                      ? isTrial
                        ? `Free trial: ${me?.daysLeft} day(s) left`
                        : `${me?.daysLeft} day(s) left on your plan`
                      : "No active subscription"}
                  </h2>
                  <button
                    onClick={() => setTab("plans")}
                    className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    {isTrial ? "Choose a plan" : active ? "Renew / extend" : "Choose a plan"}
                  </button>
                </div>

                {active && (
                  <div className="mt-5">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full ${expiringSoon ? "bg-orange-500" : "bg-brand-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {fmt(me?.startDate)} → {fmt(me?.expiryDate)}
                    </p>
                  </div>
                )}
                {isTrial && active && !expiringSoon && (
                  <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    You are on the free trial with everything included. Choose a plan before it ends to keep using the app.
                  </p>
                )}
                {expiringSoon && (
                  <p className="mt-4 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                    Your plan ends soon. Renew now so the app keeps working without a break.
                  </p>
                )}
                {!active && me?.expiryDate && (
                  <p className="mt-3 text-sm text-gray-500">Your last plan ended on {fmt(me.expiryDate)}.</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Current plan", isTrial ? "Free trial" : (currentPlan?.name ?? (active ? me?.plan : "None"))],
                  ["Status", badge[0]],
                  ["Valid until", fmt(me?.expiryDate)],
                  ["Total paid", `₹${totalPaid.toLocaleString("en-IN")}`],
                ].map(([label, value]) => (
                  <div key={label as string} className={card}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="mt-1 text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className={card}>
                <h3 className="font-semibold">Get started with the app</h3>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
                  <li>Make sure your subscription is active.</li>
                  <li>Install the Windows app on your computer.</li>
                  <li>
                    Sign in with your username <strong>@{me?.email}</strong> and your password.
                  </li>
                </ol>
              </div>
            </>
          )}

          {/* ---------- Plans ---------- */}
          {tab === "plans" && (
            <>
              <p className="text-sm text-gray-500">
                {active
                  ? "Renewing adds the new period on top of your current expiry date."
                  : "Pick a plan and pay securely online. Your subscription starts right after payment."}
              </p>
              <div className={card}>
                <label className="block text-sm font-medium">Maximum simultaneous logins</label>
                <select
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(Number(e.target.value))}
                  className="mt-2 w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {USER_TIERS.map((n) => (
                    <option key={n} value={n}>
                      {tierLabel(n)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  How many people can be signed in at the same time. The price shown on each plan is for this choice. Renewing lets you raise or lower it.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {plans.map((p) => {
                  const featured = p.code === "ONE_YEAR";
                  return (
                    <div
                      key={p.code}
                      className={`relative ${card} ${
                        wantedPlan === p.code || featured ? "border-brand-500 ring-2 ring-brand-500/20" : ""
                      }`}
                    >
                      {featured && (
                        <span className="absolute -top-3 right-5 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                          Best value
                        </span>
                      )}
                      <h2 className="text-xl font-semibold">{p.name}</h2>
                      <p className="mt-2 text-4xl font-bold">
                        ₹{planPrice(p, maxUsers, mult).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">
                        for {p.months} months · {tierLabel(maxUsers)}
                      </p>
                      <ul className="mt-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                        {["All modules included", "Windows app access", "Private database & backup"].map((i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-brand-500">✓</span> {i}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => pay(p)}
                        disabled={busy !== null || !(p.price > 0)}
                        className="mt-5 w-full rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                      >
                        {busy === p.code ? "Opening payment..." : active ? "Renew / extend" : "Pay & activate"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ---------- Billing ---------- */}
          {tab === "billing" && (
            <div className={`${card} overflow-x-auto p-0`}>
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-gray-800">
                  <tr>
                    {["Date", "Plan", "Amount", "Payment ID"].map((h) => (
                      <th key={h} className="px-5 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.orderId} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                      <td className="px-5 py-3">{fmt(p.createdAt)}</td>
                      <td className="px-5 py-3">{plans.find((x) => x.code === p.planCode)?.name ?? p.planCode}</td>
                      <td className="px-5 py-3">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.paymentId ?? "—"}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                        No payments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ---------- Companies ---------- */}
          {tab === "companies" && !me?.isCompany && (
            <PortalCompanies
              active={!!active}
              onSwitch={async () => {
                setTab("overview");
                await load();
              }}
            />
          )}

          {/* ---------- Account ---------- */}
          {tab === "account" && me && (
            <PortalProfileCard profile={me.profile} email={me.email} onSaved={load} />
          )}
        </main>
      </div>
    </div>
  );
}
