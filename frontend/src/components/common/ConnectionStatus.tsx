"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/config";

/**
 * Database / server connection indicator.
 * Pings the local server every 8 s. When it stops answering (LAN cable, server PC restarted, Wi-Fi drop)
 * a banner explains it, and the app reconnects by itself when the server is back - no restart needed.
 * Also listens for a failed SAVE ("network-write-failed") so the user checks before re-submitting.
 */
export default function ConnectionStatus() {
  const [online, setOnline] = useState(true);
  const [writeWarn, setWriteWarn] = useState(false);
  const fails = useRef(0);

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/subscription/locked`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
        if (!alive) return;
        fails.current = 0;
        setOnline(r.status < 500);
      } catch {
        if (!alive) return;
        if (++fails.current >= 2) setOnline(false); // two misses in a row = really down
      }
    };
    ping();
    const id = setInterval(ping, 8000);
    const onWrite = () => setWriteWarn(true);
    window.addEventListener("network-write-failed", onWrite);
    return () => { alive = false; clearInterval(id); window.removeEventListener("network-write-failed", onWrite); };
  }, []);

  // Once the connection is back, the "check before re-submitting" note can go after the user has seen it.
  useEffect(() => {
    if (online && writeWarn) {
      const t = setTimeout(() => setWriteWarn(false), 15000);
      return () => clearTimeout(t);
    }
  }, [online, writeWarn]);

  return (
    <>
      <div title={online ? "Connected to the server" : "Connection lost"} className="fixed bottom-3 left-3 z-[90000] flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] shadow dark:bg-gray-800/90 dark:text-white">
        <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "animate-pulse bg-rose-500"}`} />
        {online ? "Connected" : "Reconnecting..."}
      </div>
      {(!online || writeWarn) && (
        <div className="fixed inset-x-0 top-0 z-[190000] bg-rose-600 px-4 py-2 text-center text-sm text-white">
          {!online
            ? "Connection to the server was lost. Your last action may not have been saved. Reconnecting automatically..."
            : "The last save may not have completed while the connection was down. Check the record list before saving again, to avoid a duplicate."}
          {online && writeWarn && (
            <button className="ml-3 underline" onClick={() => setWriteWarn(false)}>OK</button>
          )}
        </div>
      )}
    </>
  );
}
