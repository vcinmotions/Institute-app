"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

type Logins = { master: { email: string; password: string }; admin: { email: string; password: string } };

export default function SetupChoice() {
    const router = useRouter();
    const [local, setLocal] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [demo, setDemo] = useState<Logins | null>(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/setup/options`, { cache: "no-store" })
            .then((r) => r.json())
            .then((o) => setLocal(!!o?.local))
            .catch(() => {});
    }, []);

    const createDemo = async () => {
        setBusy(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/setup/demo`, { method: "POST" });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error || "Could not create the demo");
            setDemo(json.logins);
        } catch (e: any) {
            setError(e?.message || "Could not create the demo");
        } finally {
            setBusy(false);
        }
    };

    const primary = "w-full rounded-xl bg-black text-white py-2.5 text-sm font-medium transition hover:bg-gray-800 disabled:opacity-50";
    const secondary = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 text-sm font-medium transition hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 p-6 space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome to VC Inmotions</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {demo ? "Your demo is ready." : "Get started by setting up your institute or restoring your backup."}
                    </p>
                </div>

                {demo ? (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700 dark:text-gray-200">
                            <p className="font-semibold">Institute login (daily work)</p>
                            <p>Email: <span className="font-mono">{demo.admin.email}</span></p>
                            <p>Password: <span className="font-mono">{demo.admin.password}</span></p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700 dark:text-gray-200">
                            <p className="font-semibold">Master login (backup, branding, updates, licence)</p>
                            <p>Email: <span className="font-mono">{demo.master.email}</span></p>
                            <p>Password: <span className="font-mono">{demo.master.password}</span></p>
                        </div>
                        <button onClick={() => router.push("/signin")} className={primary}>Go to sign in</button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                        {local ? (
                            <>
                                <button onClick={() => router.push("/setup-local")} disabled={busy} className={primary}>Set up my institute</button>
                                <button onClick={createDemo} disabled={busy} className={secondary}>{busy ? "Creating demo..." : "Try with demo data"}</button>
                            </>
                        ) : (
                            <button onClick={() => router.push("/setup")} className={primary}>Create New System</button>
                        )}
                        <button onClick={() => router.push("/restore")} disabled={busy} className={secondary}>Restore Backup</button>
                    </div>
                )}
            </div>
        </div>
    );
}
