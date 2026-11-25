"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";

/** Master admin: red banner while the last backup attempt has failed (cleared by the next success). */
export default function BackupAlert() {
  const [fail, setFail] = useState<{ at: string; error?: string } | null>(null);
  useEffect(() => {
    const check = () =>
      apiClient.get("/backup/status").then((r) => setFail(r.data.openFailure ?? null)).catch(() => {});
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);
  if (!fail) return null;
  return (
    <div className="mb-3 rounded border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
      The last database backup failed ({new Date(fail.at).toLocaleString("en-IN")}): {fail.error}.{" "}
      <Link href="/master-dashboard/settings" className="underline">Open Backup settings</Link>
    </div>
  );
}
