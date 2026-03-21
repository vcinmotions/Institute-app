"use client";

import { useState } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import SetupModalCard from "@/components/common/SetupModal";

export default function RestoreBackUp() {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [filePath, setFilePath] = useState<string | null>(null);

    /* ---------------- SELECT FILE ---------------- */
    async function handleSelectFile() {
        try {
            const path = await window.electronAPI.selectBackupFile();

            if (!path) return;

            setFilePath(path);
            setMsg("");
        } catch (err: any) {
            setMsg("❌ Failed to select file");
        }
    }

    /* ---------------- DRAG & DROP ---------------- */
    function handleDrop(e: React.DragEvent) {
        e.preventDefault();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Electron gives fake path in browser, but in Electron it's real
        // @ts-ignore
        const fullPath = file.path;

        if (!fullPath.endsWith(".enc")) {
            setMsg("❌ Only .enc backup files allowed");
            return;
        }

        setFilePath(fullPath);
        setMsg("");
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    /* ---------------- RESTORE ---------------- */
    async function handleRestore() {
    if (!filePath) {
        setMsg("❌ Please select a backup file first");
        return;
    }

    try {
        setLoading(true);
        setMsg("🔄 Restoring backup...");

        // ✅ Call Electron instead of backend
        await window.electronAPI.performRestore(filePath);

        // ❗ App will restart automatically
        setMsg("✅ Backup restored. Restarting...");

    } catch (err: any) {
        setMsg("❌ " + err.message);
        setLoading(false);
    }
}

    return (
        <SetupModalCard title="Restore Backup">
            <div className="space-y-6 text-center">

                {/* ALERT */}
                {msg && (
                    <Alert
                        variant={
                            msg.startsWith("✅")
                            ? "success"
                            : msg.startsWith("🔄")
                            ? "info"
                            : "error"
                        }
                        title={
                            msg.startsWith("✅")
                            ? "Success"
                            : msg.startsWith("🔄")
                            ? "Processing"
                            : "Error"
                        }
                        message={msg.replace(/^✅|❌|🔄/g, "").trim()}
                        showLink={false}
                    />
                )}

                {/* DRAG DROP AREA */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-sm text-gray-500 dark:text-gray-400"
                >
                    Drag & Drop your backup file here
                    <br />
                    <span className="text-xs">(Only .enc files supported)</span>
                </div>

                {/* SELECT BUTTON */}
                <Button
                    onClick={handleSelectFile}
                    disabled={loading}
                    className="w-full rounded bg-gray-200 dark:bg-gray-800 text-black dark:text-white py-2.5 text-sm hover:bg-gray-300 dark:hover:bg-gray-700"
                >
                    Choose File
                </Button>

                {/* SELECTED FILE */}
                {filePath && (
                    <div className="text-xs text-green-600 dark:text-green-400 break-all">
                        📂 {filePath}
                    </div>
                )}

                {/* RESTORE BUTTON */}
                <Button
                    onClick={handleRestore}
                    disabled={!filePath || loading}
                    className="w-full rounded bg-black text-white py-2.5 text-sm hover:bg-gray-800"
                >
                    {loading ? "Restoring..." : "Restore Backup"}
                </Button>

            </div>
        </SetupModalCard>
    );
}