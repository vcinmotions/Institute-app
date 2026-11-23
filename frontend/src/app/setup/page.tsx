"use client";

import { API_BASE_URL } from "@/lib/config";
import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import ModalCard from "@/components/common/ModalCard";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import SetupModalCard from "@/components/common/SetupModal";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const form = new FormData(e.target);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "").trim();

    try {
      // The central server confirms this is the Master Institute Super Admin and returns
      // the institute, its companies and its subscription; this PC builds its database from that.
      const res = await fetch(`${API_BASE_URL}/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const sub = json.subscription?.status;
      setMsg(
        `✅ ${json.instituteName} is ready with ${json.companies} compan${json.companies === 1 ? "y" : "ies"}.` +
          (sub && sub !== "ACTIVE" ? ` Subscription: ${sub}. Renew it on the web portal.` : ""),
      );

      setTimeout(() => {
        // @ts-ignore
        router.replace("/signin");
      }, 2500);
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SetupModalCard title="Institute Setup">
      <div className="space-y-6">
        {msg && (
          <Alert
            variant={msg.startsWith("✅") ? "success" : "error"}
            title={msg.startsWith("✅") ? "Success" : "Error"}
            message={msg.replace(/^✅|❌/g, "").trim()}
            showLink={false}
          />
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in with your Master Institute account from the web portal. Only the Master Super Admin can set up
          this computer. Other computers in your office connect to this one and do not need setup.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Master Super Admin email / username</Label>
            <Input ref={firstInputRef} name="email" required placeholder="Enter your portal login" autoComplete="username" />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" name="password" required placeholder="Enter your portal password" autoComplete="current-password" />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            {/* <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => {}}
            >
              Cancel
            </Button> */}
            <Button size="sm" className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" disabled={loading}>
              {loading ? "Verifying and setting up..." : "Activate this computer"}
            </Button>
          </div>
        </form>
      </div>
    </SetupModalCard>
  );
}
