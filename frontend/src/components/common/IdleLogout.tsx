"use client";

import { useEffect, useRef, useState } from "react";
import { forceLogout } from "@/app/utils/forceLogout";

/**
 * Automatic logout after inactivity.
 *  - Timeout (minutes) is read from localStorage "idleTimeoutMinutes" (default 30, 0 = never).
 *  - At timeout a 60 second warning with "Stay signed in" is shown, so nobody loses work by surprise.
 *  - If the PC slept / was locked / hibernated, JS timers stop; on resume the elapsed wall-clock time is
 *    compared with the timeout and the user is signed out if it was exceeded (no warning, the user was away).
 */
const WARN_SECONDS = 60;
const ACTIVITY = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"] as const;

export function getIdleTimeoutMinutes(): number {
  try {
    const v = Number(window.localStorage.getItem("idleTimeoutMinutes"));
    return Number.isFinite(v) && window.localStorage.getItem("idleTimeoutMinutes") !== null ? Math.max(0, v) : 30;
  } catch {
    return 30;
  }
}

export function setIdleTimeoutMinutes(minutes: number) {
  try {
    window.localStorage.setItem("idleTimeoutMinutes", String(Math.max(0, Math.floor(minutes))));
  } catch {
    /* storage unavailable */
  }
}

export default function IdleLogout() {
  const last = useRef(Date.now());
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const mark = () => {
      if (left === null) last.current = Date.now();
    };
    ACTIVITY.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    const tick = () => {
      if (!window.sessionStorage.getItem("token")) return;
      const timeoutMs = getIdleTimeoutMinutes() * 60 * 1000;
      if (!timeoutMs) { setLeft(null); return; }
      const idle = Date.now() - last.current;
      if (idle >= timeoutMs + WARN_SECONDS * 1000) {
        setLeft(null);
        forceLogout();
      } else if (idle >= timeoutMs) {
        setLeft(Math.max(0, Math.ceil((timeoutMs + WARN_SECONDS * 1000 - idle) / 1000)));
      } else {
        setLeft(null);
      }
    };
    const id = window.setInterval(tick, 1000);
    const onVisible = () => document.visibilityState === "visible" && tick(); // resume after sleep / lock
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", tick);
    return () => {
      ACTIVITY.forEach((e) => window.removeEventListener(e, mark));
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", tick);
    };
  }, [left]);

  if (left === null) return null;
  return (
    <div className="fixed inset-0 z-[150000] flex items-center justify-center bg-black/60 p-4">
      <div role="alertdialog" className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl dark:bg-gray-900 dark:text-white">
        <h2 className="mb-2 text-lg font-semibold">Still there?</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          You will be signed out in {left} second(s) because of inactivity.
        </p>
        <button
          onClick={() => { last.current = Date.now(); setLeft(null); }}
          className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600"
        >
          Stay signed in
        </button>
      </div>
    </div>
  );
}
