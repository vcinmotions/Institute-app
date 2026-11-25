"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import ServerInfo from "@/components/common/ServerInfo";

const FIELDS: { key: string; label: string; type?: string; section?: string }[] = [
    { key: "instituteName", label: "Institute name", section: "Your institute" },
    { key: "ownerName", label: "Owner / admin name" },
    { key: "contact", label: "Contact number" },
    { key: "fullAddress", label: "Address" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "zipCode", label: "PIN code" },
    { key: "email", label: "Institute admin email", type: "email", section: "Institute admin login (daily work)" },
    { key: "password", label: "Password (min 6 characters)", type: "password" },
    { key: "masterEmail", label: "Master admin email", type: "email", section: "Master admin login (backup, branding, updates, licence)" },
    { key: "masterPassword", label: "Password (min 6 characters)", type: "password" },
];

export default function SetupLocalPage() {
    const router = useRouter();
    const [v, setV] = useState<Record<string, string>>({ country: "India" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/setup/local`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error || "Setup failed");
            setDone(true);
        } catch (err: any) {
            setError(err?.message || "Setup failed");
        } finally {
            setBusy(false);
        }
    };

    const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-950">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">Set up my institute</h1>
                {done ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Setup is complete. Sign in with the institute admin email and password you just chose.</p>
                        <ServerInfo />
                        <button onClick={() => router.push("/signin")} className="w-full rounded-xl bg-black py-2.5 text-sm font-medium text-white">Go to sign in</button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fill this in once. Most details can be changed later in the app.</p>
                        {FIELDS.map((f) => (
                            <div key={f.key}>
                                {f.section && <h2 className="mb-2 mt-4 text-sm font-semibold text-gray-900 dark:text-white">{f.section}</h2>}
                                <label className="mb-1 block text-xs text-gray-600 dark:text-gray-300">{f.label}</label>
                                <input className={input} type={f.type || "text"} value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} required />
                            </div>
                        ))}
                        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => router.push("/setup-choice")} disabled={busy} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">Back</button>
                            <button type="submit" disabled={busy} className="flex-1 rounded-xl bg-black py-2.5 text-sm font-medium text-white disabled:opacity-50">{busy ? "Setting up..." : "Finish setup"}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
