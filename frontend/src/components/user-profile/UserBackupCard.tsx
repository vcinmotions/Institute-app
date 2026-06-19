"use client";
import React, { useState } from "react";
import Button from "../ui/button/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function UserBackUpCard() {
    const user = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.token);

    const [backupLoading, setBackupLoading] = useState(false);
    const [backupMsg, setBackupMsg] = useState("");

    async function handleBackup() {
        try {
            setBackupLoading(true);
            setBackupMsg("📦 Creating backup...");

            const res = await fetch("http://localhost:5001/api/backup", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error("Backup failed");
            }

            setBackupMsg("📦 Backup ready. Saving file...");

            // Electron desktop channel download
            await window.electronAPI.saveBackupFile(data.filePath);
            setBackupMsg("✅ Backup saved successfully");

        } catch (err: any) {
            console.error(err);
            setBackupMsg("❌ Backup failed");
        } finally {
            setBackupLoading(false);
        }
    }

    return (
        <div className="rounded border border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800/80 dark:bg-slate-900/10">
            <div className="max-w-xl">

                {/* Module Header */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Database Backup Settings
                </h4>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">
                    Generate an absolute dump file of application configurations, courses, leads, and transaction ledger tables.
                </p>

                <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 max-w-sm space-y-3">

                    {/* ERP Styled Dynamic Alert Notifications Banner */}
                    {backupMsg && (
                        <div className={`text-[11px] font-mono font-semibold px-3 py-1.5 rounded border tracking-wide shadow-none
              ${backupMsg.startsWith("✅") ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400" :
                                backupMsg.startsWith("❌") ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-400" :
                                    "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"}`}
                        >
                            {backupMsg}
                        </div>
                    )}

                    {/* Core ERP Action Trigger */}
                    <button
                        type="button"
                        onClick={handleBackup}
                        disabled={backupLoading}
                        className="inline-flex h-8 w-full items-center justify-center rounded bg-slate-900 px-4 text-[11px] font-semibold tracking-wide text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                        {backupLoading ? "Executing Maintenance Process..." : "Run Global System Backup"}
                    </button>

                </div>
            </div>
        </div>
    );
}