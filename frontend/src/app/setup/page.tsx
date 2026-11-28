"use client";

import { API_BASE_URL } from "@/lib/config";
import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import SetupModalCard from "@/components/common/SetupModal";
import { useRouter } from "next/navigation";

type Company = { id: string; name: string; instituteName: string; city?: string; state?: string; isMaster?: boolean };
type Done = { company: string; serverKey?: string; clientKey?: string; sub?: string };

const post = async (path: string, body: any) => {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
};

/**
 * First-time setup of the server computer:
 *  1. sign in with the Master Institute account,
 *  2. choose the company this server is for (one server = one company),
 *  3. the server receives that company's keys (when the build uses keys) and builds its own database.
 */
export default function SetupPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [institute, setInstitute] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { firstInputRef.current?.focus(); }, []);

  async function signIn(e: any) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const form = new FormData(e.target);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "").trim();
    try {
      const json = await post("/setup/companies", { email, password });
      setCreds({ email, password });
      setInstitute(json.instituteName);
      setCompanies(json.companies);
      setCompanyId(json.companies.length === 1 ? json.companies[0].id : "");
      setStep(2);
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally { setLoading(false); }
  }

  async function setup() {
    setLoading(true); setMsg("");
    try {
      const json = await post("/setup", { ...creds, companyId });
      const sub = json.subscription?.status;
      setDone({
        company: json.company, serverKey: json.serverKey, clientKey: json.clientKey,
        sub: sub && sub !== "ACTIVE" ? `Subscription: ${sub}. Renew it on the web portal.` : undefined,
      });
      setStep(3);
      if (!json.serverKey) setTimeout(() => router.replace("/signin"), 2500);
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally { setLoading(false); }
  }

  const copy = (v?: string) => v && navigator.clipboard?.writeText(v).catch(() => {});

  return (
    <SetupModalCard title="Server Setup">
      <div className="space-y-6">
        {msg && <Alert variant="error" title="Error" message={msg.replace(/^❌/, "").trim()} showLink={false} />}

        {step === 1 && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in with your Master Institute account from the web portal. Only the Master Super Admin can set up a server.
              Other computers of the company connect to this server and do not need setup.
            </p>
            <form className="space-y-4" onSubmit={signIn}>
              <div>
                <Label>Master Super Admin email / username</Label>
                <Input ref={firstInputRef} name="email" required placeholder="Enter your portal login" autoComplete="username" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" name="password" required placeholder="Enter your portal password" autoComplete="current-password" />
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm" className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" disabled={loading}>
                  {loading ? "Signing in..." : "Continue"}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <b>{institute}</b>: choose the company (branch) this server computer will run. This computer keeps only that company&apos;s data.
            </p>
            <div className="max-h-64 space-y-2 overflow-auto">
              {companies.map((c) => (
                <label key={c.id} className={`flex cursor-pointer items-center gap-3 rounded border p-3 text-sm dark:border-gray-700 ${companyId === c.id ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : ""}`}>
                  <input type="radio" name="company" checked={companyId === c.id} onChange={() => setCompanyId(c.id)} />
                  <span className="dark:text-white">
                    {c.instituteName || c.name}
                    <span className="block text-xs text-gray-500">{[c.city, c.state].filter(Boolean).join(", ")}{c.isMaster ? " - main company" : ""}</span>
                  </span>
                </label>
              ))}
              {companies.length === 0 && <p className="text-sm text-gray-500">No company found. Add one on the web portal first.</p>}
            </div>
            <div className="flex justify-between gap-3">
              <Button size="sm" variant="outline" onClick={() => { setStep(1); setMsg(""); }} disabled={loading}>Back</Button>
              <Button size="sm" className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" disabled={loading || !companyId} onClick={setup}>
                {loading ? "Setting up this server..." : "Set up this server"}
              </Button>
            </div>
          </>
        )}

        {step === 3 && done && (
          <>
            <Alert variant="success" title="Server ready" message={`${done.company} is set up on this computer.${done.sub ? " " + done.sub : ""}`} showLink={false} />
            {done.serverKey && done.serverKey === done.clientKey && (
              <div className="space-y-3 rounded border p-3 text-sm dark:border-gray-700 dark:text-white">
                <div>
                  <div className="text-xs text-gray-500">Your institute&apos;s activation key (this computer is already activated)</div>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono">{done.serverKey}</span><button className="text-xs underline" onClick={() => copy(done.serverKey)}>Copy</button></div>
                </div>
                <p className="text-xs text-gray-500">
                  Use this one key on every other PC and laptop, for every company of your institute. It is also shown later under
                  System Settings and in the portal. Keep it private to your staff.
                </p>
              </div>
            )}
            {done.serverKey && done.serverKey !== done.clientKey && (
              <div className="space-y-3 rounded border p-3 text-sm dark:border-gray-700 dark:text-white">
                <div>
                  <div className="text-xs text-gray-500">Server key (this computer - already activated)</div>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono">{done.serverKey}</span><button className="text-xs underline" onClick={() => copy(done.serverKey)}>Copy</button></div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Client key (type this once on every other PC / laptop of {done.company})</div>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono">{done.clientKey}</span><button className="text-xs underline" onClick={() => copy(done.clientKey)}>Copy</button></div>
                </div>
                <p className="text-xs text-gray-500">Both keys are also shown later under System Settings. Keep the Client key private to your staff.</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button size="sm" className="rounded bg-gray-300 px-4 py-2 text-sm text-black" onClick={() => router.replace("/signin")}>Continue to sign in</Button>
            </div>
          </>
        )}
      </div>
    </SetupModalCard>
  );
}
