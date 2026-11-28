"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config";

type State = "pending" | "ok" | "warn" | "fail";
type Check = { key: string; label: string; hint: string; state: State; detail?: string; ms?: number };

const START: Check[] = [
  { key: "server", label: "Server", hint: "Can this PC reach the application server?", state: "pending" },
  { key: "session", label: "Your sign-in", hint: "Is your login session accepted by the server?", state: "pending" },
  { key: "database", label: "Database", hint: "Can the server read the institute database?", state: "pending" },
  { key: "licence", label: "Licence", hint: "Is the software licence active?", state: "pending" },
  { key: "internet", label: "Internet", hint: "Needed only for licence renewal and updates.", state: "pending" },
];

const DOT: Record<State, string> = {
  pending: "bg-gray-300 animate-pulse",
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  fail: "bg-rose-500",
};
const WORD: Record<State, string> = { pending: "Checking...", ok: "Working", warn: "Needs attention", fail: "Not working" };

const timed = async <T,>(fn: () => Promise<T>): Promise<{ value?: T; ms: number; error?: string }> => {
  const t = performance.now();
  try {
    return { value: await fn(), ms: Math.round(performance.now() - t) };
  } catch (e: any) {
    return { ms: Math.round(performance.now() - t), error: e?.response?.data?.error || e?.message || "Failed" };
  }
};

/** "Check API Status": a live, plain-language check of everything the app needs to work. */
export default function ApiStatusView({ healthHref, master = false }: { healthHref?: string; master?: boolean }) {
  const [checks, setChecks] = useState<Check[]>(START);
  const [running, setRunning] = useState(false);
  const [at, setAt] = useState<Date | null>(null);
  const busy = useRef(false);

  const run = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setRunning(true);
    const set = (key: string, patch: Partial<Check>) => setChecks((c) => c.map((x) => (x.key === key ? { ...x, ...patch } : x)));

    // 1. server reachable (needs no login)
    const srv = await timed(async () => {
      const r = await fetch(`${API_BASE_URL}/subscription/locked`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
      if (r.status >= 500) throw new Error(`The server answered with an error (${r.status}).`);
      return r.status;
    });
    set("server", srv.error
      ? { state: "fail", detail: srv.error.includes("fetch") || srv.error.includes("abort") || srv.error.includes("Timeout") ? "Cannot reach the server. Check it is running and the network is connected." : srv.error }
      : { state: srv.ms > 1500 ? "warn" : "ok", ms: srv.ms, detail: srv.ms > 1500 ? "Reachable but slow." : "Reachable." });

    // 2. signed in (the master admin uses different routes from institute users)
    const ses = await timed(() => apiClient.get(master ? "/master-user" : "/my-permissions"));
    set("session", ses.error ? { state: "fail", detail: ses.error } : { state: "ok", ms: ses.ms, detail: "Your session is valid." });

    if (master) {
      // 3 + 4. database and licence come from the system health report
      const h = await timed(() => apiClient.get("/system/health"));
      if (h.error) {
        set("database", { state: "fail", detail: h.error });
        set("licence", { state: "fail", detail: h.error });
      } else {
        const d: any = (h.value as any).data;
        const bad = (d.database.institutes as any[]).filter((i) => !i.ok);
        set("database", !d.database.central.ok || bad.length
          ? { state: "fail", ms: h.ms, detail: !d.database.central.ok ? "The central database is not reachable." : `${bad.length} institute database(s) not reachable.` }
          : { state: "ok", ms: h.ms, detail: `Connected (${d.database.institutes.length} institute database(s)).` });
        const sub = d.subscription;
        set("licence", sub.locked
          ? { state: "warn", detail: sub.message || "The application is in view-only mode." }
          : { state: "ok", detail: sub.daysLeft != null ? `${sub.status}, ${sub.daysLeft} day(s) left.` : String(sub.status) });
      }
    } else {
      // 3. database (a real read)
      const db = await timed(() => apiClient.get("/my-companies"));
      set("database", db.error
        ? { state: "fail", detail: db.error }
        : { state: db.ms > 2500 ? "warn" : "ok", ms: db.ms, detail: db.ms > 2500 ? "Readable but slow." : "Connected." });

      // 4. licence
      const lic = await timed(() => apiClient.get("/subscription/me"));
      if (lic.error) set("licence", { state: "fail", detail: lic.error });
      else {
        const s: any = (lic.value as any).data;
        if (!s.enforced) set("licence", { state: "ok", ms: lic.ms, detail: "No licence check is configured." });
        else if (s.locked) set("licence", { state: "warn", ms: lic.ms, detail: s.message || "The application is in view-only mode." });
        else set("licence", { state: "ok", ms: lic.ms, detail: s.daysLeft != null ? `Active, ${s.daysLeft} day(s) left.` : "Active." });
      }
    }

    // 5. internet (only a hint)
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    set("internet", online ? { state: "ok", detail: "This computer is online." } : { state: "warn", detail: "No internet. The app keeps working; renewals and updates need it." });

    setAt(new Date());
    setRunning(false);
    busy.current = false;
  }, [master]);

  useEffect(() => {
    run();
    const t = setInterval(run, 15000);
    return () => clearInterval(t);
  }, [run]);

  const done = checks.every((c) => c.state !== "pending");
  const failed = checks.filter((c) => c.state === "fail").length;
  const warned = checks.filter((c) => c.state === "warn").length;
  const banner =
    !done ? { cls: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300", text: "Checking..." }
    : failed ? { cls: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300", text: `${failed} check${failed > 1 ? "s" : ""} not working. Details below.` }
    : warned ? { cls: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300", text: "Working, with something that needs attention." }
    : { cls: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300", text: "Everything is working." };

  return (
    <div className="max-w-2xl space-y-4">
      <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${banner.cls}`}>{banner.text}</div>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        {checks.map((c) => (
          <div key={c.key} className="flex items-start gap-3 px-4 py-3">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[c.state]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.label}</span>
                <span className="text-xs text-gray-500">{WORD[c.state]}{c.ms !== undefined && c.state !== "pending" ? ` - ${c.ms} ms` : ""}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{c.detail ?? c.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>Server address: <span className="font-mono">{API_BASE_URL}</span>{at ? ` · checked ${at.toLocaleTimeString("en-IN")}` : ""}</span>
        <span className="flex gap-3">
          {healthHref && <a href={healthHref} className="underline">Full system health</a>}
          <button onClick={run} disabled={running} className="rounded border px-3 py-1 text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200">
            {running ? "Checking..." : "Check again"}
          </button>
        </span>
      </div>
    </div>
  );
}
