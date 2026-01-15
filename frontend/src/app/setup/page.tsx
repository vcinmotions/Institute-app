"use client";

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

    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());

    // 🔹 force email to lowercase
    if (typeof data.email === "string") {
      data.email = data.email.toLowerCase();
    }

    try {
      const res = await fetch("http://localhost:5001/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setMsg("✅ Initial Setup Complete...");
        
      window.localStorage.setItem("email", JSON.stringify({email: data.email,}));

      setTimeout(() => {
        if (res.ok) {
          // @ts-ignore
          router.replace("/setup/address")
        }
      }, 1000);
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SetupModalCard title="Initial Setup">
      <div className="space-y-6">
        {msg && (
          <Alert
            variant={msg.startsWith("✅") ? "success" : "error"}
            title={msg.startsWith("✅") ? "Success" : "Error"}
            message={msg.replace(/^✅|❌/g, "").trim()}
            showLink={false}
          />
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Client ID</Label>
            <Input
              ref={firstInputRef}
              name="clientId"
              placeholder="Client ID"
              required
            />
          </div>

          <div>
            <Label>Institite Name</Label>
            <Input name="name" className="capitalize" placeholder="Enter Institute Name" />
          </div>

          <div>
            <Label>Registered Email</Label>
            <Input name="email" placeholder="Enter Email" />
          </div>

          <div>
            <Label> Password</Label>
            <Input type="password" name="password" placeholder="Enter Password" />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => {}}
            >
              Cancel
            </Button>
            <Button size="sm" variant="primary"  className="rounded bg-gray-200 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900" disabled={loading}>
              {loading ? "Setting up..." : "Create System"}
            </Button>
          </div>
        </form>
      </div>
    </SetupModalCard>
  );
}
