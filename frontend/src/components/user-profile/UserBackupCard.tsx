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

            // ✅ Electron download (IMPORTANT)
            await window.electronAPI.saveBackupFile(data.filePath);

            setBackupMsg("✅ Backup saved successfully");

        } catch (err: any) {
            console.error(err);
            setBackupMsg("❌ Backup failed");
        } finally {
            setBackupLoading(false);
        }
    }

    console.log("User in Profile", user);
    return (
        <>
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                            Backup Settings
                        </h4>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                            <div className="mt-6 border-t pt-6 space-y-4">

                                {/* BACKUP STATUS */}
                                {backupMsg && (
                                    <div className={`text-sm px-3 py-2 rounded 
                                        ${backupMsg.startsWith("✅") ? "bg-green-100 text-green-700" :
                                            backupMsg.startsWith("❌") ? "bg-red-100 text-red-700" :
                                                "bg-gray-100 text-gray-700"}`}>
                                        {backupMsg}
                                    </div>
                                )}

                                {/* BACKUP BUTTON */}
                                <Button
                                    onClick={handleBackup}
                                    disabled={backupLoading}
                                    className="w-full rounded bg-blue-600 text-white py-2.5 text-sm hover:bg-blue-700"
                                >
                                    {backupLoading ? "Creating Backup..." : "Create Full Backup"}
                                </Button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
