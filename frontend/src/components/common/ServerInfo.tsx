"use client";

import { useEffect, useState } from "react";

type ModeInfo = { config: { mode: string } | null; ips: string[] };

/**
 * Shown right after setup in the desktop app: tells the owner that this PC is the server and what
 * address other PCs must enter. In Standalone mode it offers a one-click switch to Server mode
 * (the app restarts; the data just created is kept).
 */
export default function ServerInfo() {
    const [info, setInfo] = useState<ModeInfo | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const api = (window as any).electronAPI;
        if (!api?.mode?.get) return; // opened in a normal browser: nothing to show
        api.mode.get().then(setInfo).catch(() => {});
    }, []);

    if (!info) return null;
    const mode = info.config?.mode;
    const box = "rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700 dark:text-gray-200";

    const makeServer = async () => {
        setBusy(true);
        await (window as any).electronAPI.mode.save({ mode: "LAN_SERVER" }); // restarts the app
    };

    if (mode === "LAN_SERVER") {
        return (
            <div className={box}>
                <p className="font-semibold">This computer is your server</p>
                <p className="mt-1">On every other computer, install the app, choose &quot;connect to a Server&quot; and enter:</p>
                <p className="mt-1 font-mono">{info.ips.length ? info.ips.join("  or  ") : "(no network found - connect this PC to your network)"}</p>
                <p className="mt-1 text-xs text-gray-500">Ports 5001 and 3000 (the defaults). Keep this computer switched on while others work.</p>
            </div>
        );
    }
    if (mode === "STANDALONE") {
        return (
            <div className={box}>
                <p className="font-semibold">Use this computer as the server for other PCs?</p>
                <p className="mt-1 text-xs text-gray-500">Right now only this computer can use the data. Switching keeps everything you just created, and the app restarts once.</p>
                <button onClick={makeServer} disabled={busy} className="mt-2 w-full rounded-xl border border-gray-300 bg-gray-100 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {busy ? "Restarting..." : "Make this computer the server"}
                </button>
            </div>
        );
    }
    return null;
}
