"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { portalApi, getPortalToken, setPortalToken, portalAuthHeader } from "@/lib/portalApi";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type Plan = { code: string; name: string; months: number; price: number; currency: string };
type Me = { email: string; status: string; plan: string; expiryDate: string | null; daysLeft: number };

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

/** Web portal: sign in, see status, buy or renew a plan (Razorpay). */
export default function PortalSubscription() {
  const wantedPlan = useSearchParams().get("plan");
  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [login, setLogin] = useState({ email: "", password: "" });

  const load = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([
        portalApi.get("/portal/me", { headers: portalAuthHeader() }),
        portalApi.get("/plans"),
      ]);
      setMe(m.data);
      setPlans(p.data);
      setAuthed(true);
    } catch {
      setPortalToken(null);
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    if (getPortalToken()) load();
  }, [load]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await portalApi.post("/portal/login", login);
      setPortalToken(data.token);
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.error || "Sign in failed");
    }
  };

  const pay = async (plan: Plan) => {
    setMsg("");
    setBusy(plan.code);
    try {
      if (!(await loadRazorpay())) throw new Error("Could not load the payment window");
      const { data: o } = await portalApi.post(
        "/portal/order",
        { plan: plan.code },
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
            setMsg(
              "Payment successful. Your subscription is active - open the app and it will unlock automatically.",
            );
            await load();
          } catch {
            setMsg("Payment received. Activation may take a minute - refresh shortly.");
          }
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rz.open();
    } catch (err: any) {
      setMsg(err?.response?.data?.error || err?.message || "Payment failed");
    } finally {
      setBusy(null);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
        <form
          onSubmit={doLogin}
          className="mx-auto max-w-sm space-y-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <h1 className="text-xl font-semibold dark:text-white">
            Sign in to manage your subscription
          </h1>
          {(["email", "password"] as const).map((k) => (
            <input
              key={k}
              type={k === "email" ? "text" : "password"}
              autoComplete={k === "email" ? "username" : "current-password"}
              placeholder={k === "email" ? "Username" : "Password"}
              value={login[k]}
              onChange={(e) => setLogin({ ...login, [k]: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          ))}
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button className="w-full rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600">
            Sign in
          </button>
          <p className="text-center text-sm text-gray-500">
            New here?{" "}
            <a href="/" className="text-brand-500 underline">
              See plans and register
            </a>
          </p>
        </form>
      </main>
    );
  }

  const active = me?.status === "ACTIVE";
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <p className="text-sm text-gray-500">Username: {me?.email}</p>
          <h1 className="text-2xl font-semibold">
            {active ? `Active - ${me?.daysLeft} day(s) left` : "No active subscription"}
          </h1>
          {me?.expiryDate && (
            <p className="text-sm text-gray-500">
              {active ? "Valid until" : "Expired on"} {new Date(me.expiryDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <div
              key={p.code}
              className={`rounded-2xl border bg-white p-6 dark:bg-gray-900 dark:text-white ${
                wantedPlan === p.code ? "border-brand-500 ring-2 ring-brand-500/30" : "dark:border-gray-800"
              }`}
            >
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="mt-2 text-3xl font-bold">₹{p.price}</p>
              <button
                onClick={() => pay(p)}
                disabled={busy !== null || !(p.price > 0)}
                className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {busy === p.code ? "Opening payment..." : active ? "Renew / extend" : "Pay & activate"}
              </button>
            </div>
          ))}
        </div>
        {msg && <p className="text-sm text-gray-700 dark:text-gray-300">{msg}</p>}
        <button
          onClick={() => {
            setPortalToken(null);
            setAuthed(false);
          }}
          className="text-sm text-gray-500 underline"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
