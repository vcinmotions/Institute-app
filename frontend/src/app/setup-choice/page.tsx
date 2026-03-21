"use client";

import { useRouter } from "next/navigation";

export default function SetupChoice() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 p-6 space-y-6">

                {/* Header */}
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Welcome to VC Inmotions
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get started by creating a new system or restoring your backup.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/setup")}
                        className="w-full rounded-xl bg-black text-white py-2.5 text-sm font-medium transition hover:bg-gray-800"
                    >
                        Create New System
                    </button>

                    <button
                        onClick={() => router.push("/restore")}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-2.5 text-sm font-medium transition hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        Restore Backup
                    </button>
                </div>

            </div>
        </div>
    );
}