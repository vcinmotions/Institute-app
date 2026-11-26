"use client";
import { useDialog } from "@/components/common/AppDialog";
import { MESSAGE_VISIBLE_MS } from "@/lib/uiTimings";
import React, { useCallback, useEffect, useState } from "react";
import TimePicker from "@/components/form/TimePicker";
import { apiClient } from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/apiError";

type Frequency = "DAILY" | "TWICE_DAILY" | "WEEKLY" | "FIFTEEN_DAYS" | "MONTHLY";
type Config = {
  enabled: boolean; frequency: Frequency; time: string; time2: string; weekday: number; monthDay: number;
  directory: string; externalDir: string;
};
type Log = { id: string; at: string; type: "AUTO" | "MANUAL"; ok: boolean; file?: string; sizeBytes?: number; error?: string; externalError?: string };
type FileInfo = { name: string; path: string; sizeBytes: number; modifiedAt: string; location: "primary" | "external" };
type Status = { config: Config; nextRun: string | null; lastSuccess: Log | null; openFailure: Log | null; files: FileInfo[]; log: Log[]; running: boolean };

const fmt = (d: string) => new Date(d).toLocaleString("en-IN");
const mb = (n?: number) => (n ? `${(n / 1048576).toFixed(1)} MB` : "-");
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;

/** Backup & recovery for the admin: schedule, destinations, history and restore. */
export default function UserBackUpCard() {
  const dialog = useDialog();
  const [st, setSt] = useState<Status | null>(null);
  const [cfg, setCfg] = useState<Config | null>(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get<Status>("/backup/status");
      setSt(data);
      setCfg((c) => c ?? data.config);
    } catch (e) {
      setMsg({ ok: false, text: getApiErrorMessage(e, "Could not load backup status.") });
    }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);

  const flash = (ok: boolean, text: string) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), MESSAGE_VISIBLE_MS); };

  const saveSettings = async () => {
    setBusy("save");
    try {
      const { data } = await apiClient.put<Status>("/backup/config", cfg);
      setSt(data); setCfg(data.config);
      flash(true, "Backup settings saved.");
    } catch (e) { flash(false, getApiErrorMessage(e)); } finally { setBusy(""); }
  };

  const backupNow = async () => {
    setBusy("now");
    try {
      const { data } = await apiClient.post("/backup");
      flash(true, data.externalError ? `Backup saved. ${data.externalError}` : "Backup completed.");
      await load();
    } catch (e) { flash(false, getApiErrorMessage(e, "Backup failed.")); await load(); } finally { setBusy(""); }
  };

  const restore = async (f: FileInfo) => {
    if (!window.electronAPI?.performRestore) return flash(false, "Restore is available in the desktop app only.");
    if (!(await dialog.confirm({ title: `Restore "${f.name}"?`, message: `This REPLACES all current data with the data in this backup, then restarts the application. Anything entered after ${fmt(f.modifiedAt)} will be lost.`, confirmText: "Restore", danger: true }))) return;
    // Take a safety backup first so a wrong restore can be undone.
    try { await apiClient.post("/backup"); } catch { if (!(await dialog.confirm({ title: "No safety backup", message: "A safety backup of the current data could not be made. Restore anyway?", confirmText: "Restore anyway", danger: true }))) return; }
    await window.electronAPI.performRestore(f.path);
  };

  // Desktop app on the server PC: pick a folder with the Windows folder dialog.
  const canBrowse = typeof window !== "undefined" && !!window.electronAPI?.selectFolder;
  const browse = async (key: "directory" | "externalDir", title: string) => {
    if (!cfg || !window.electronAPI?.selectFolder) return;
    try {
      const r = await window.electronAPI.selectFolder({ title, defaultPath: cfg[key] || cfg.directory });
      if (r?.error) return flash(false, r.error);
      if (r?.path) setCfg({ ...cfg, [key]: r.path });
    } catch (e) { flash(false, getApiErrorMessage(e, "Could not open the folder picker.")); }
  };

  const saveCopy = async (f: FileInfo) => {
    try { await window.electronAPI?.saveBackupFile(f.path); } catch (e) { flash(false, getApiErrorMessage(e, "Could not save a copy.")); }
  };

  const input = "h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  return (
    <div className="space-y-4 rounded border border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800/80 dark:bg-slate-900/10">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Backup &amp; Recovery</h4>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Encrypted backups of all institute data. Stored outside the application data folder, with an optional second copy.
          Only the admin can change these settings; there is no option to delete a backup.
        </p>
      </div>

      {st?.openFailure && (
        <div className="rounded border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          <strong>The last backup failed</strong> ({fmt(st.openFailure.at)}): {st.openFailure.error}. Fix the folder or drive and press &quot;Back up now&quot;.
        </div>
      )}
      {msg && (
        <div className={`rounded border px-3 py-1.5 text-xs ${msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{msg.text}</div>
      )}

      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <div className="rounded border bg-white p-2 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          <div className="text-slate-500">Last successful backup</div>
          <div className="font-semibold">{st?.lastSuccess ? fmt(st.lastSuccess.at) : "Never"}</div>
        </div>
        <div className="rounded border bg-white p-2 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          <div className="text-slate-500">Backups kept (last month)</div>
          <div className="font-semibold">{st?.files.filter((f) => f.location === "primary").length ?? 0}</div>
        </div>
        <div className="rounded border bg-white p-2 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          <div className="text-slate-500">Next automatic backup</div>
          <div className="font-semibold">{st?.config.enabled ? (st?.nextRun ? fmt(st.nextRun) : "On") : "Off"}</div>
        </div>
      </div>

      {cfg && (
        <div className="grid gap-3 text-xs sm:grid-cols-2">
          <label className="flex items-center gap-2 dark:text-white">
            <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} /> Automatic backups
          </label>
          <div />
          <label className="dark:text-white">Frequency
            <select className={input} disabled={!cfg.enabled} value={cfg.frequency} onChange={(e) => setCfg({ ...cfg, frequency: e.target.value as Frequency })}>
              <option value="DAILY">Daily (once a day)</option>
              <option value="TWICE_DAILY">Daily (twice a day)</option>
              <option value="WEEKLY">Weekly</option>
              <option value="FIFTEEN_DAYS">Every 15 days (1st and 16th)</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </label>
          {cfg.frequency === "WEEKLY" && (
            <label className="dark:text-white">Day of the week
              <select className={input} disabled={!cfg.enabled} value={cfg.weekday} onChange={(e) => setCfg({ ...cfg, weekday: Number(e.target.value) })}>
                {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </label>
          )}
          {cfg.frequency === "MONTHLY" && (
            <label className="dark:text-white">Day of the month
              <select className={input} disabled={!cfg.enabled} value={cfg.monthDay} onChange={(e) => setCfg({ ...cfg, monthDay: Number(e.target.value) })}>
                {MONTH_DAYS.map((d) => <option key={d} value={d}>{ordinal(d)}{d > 28 ? " (or the last day of a shorter month)" : ""}</option>)}
              </select>
            </label>
          )}
          {(cfg.frequency === "DAILY" || cfg.frequency === "TWICE_DAILY" || cfg.frequency === "FIFTEEN_DAYS") && <div className="hidden sm:block" />}
          <label className="dark:text-white">{cfg.frequency === "TWICE_DAILY" ? "First backup time" : "Backup time"}
            <TimePicker size="sm" disabled={!cfg.enabled} value={cfg.time} onChange={(v) => setCfg({ ...cfg, time: v || cfg.time })} />
          </label>
          {cfg.frequency === "TWICE_DAILY" ? (
            <label className="dark:text-white">Second backup time
              <TimePicker size="sm" disabled={!cfg.enabled} value={cfg.time2} onChange={(v) => setCfg({ ...cfg, time2: v || cfg.time2 })} />
            </label>
          ) : <div className="hidden sm:block" />}
          <p className="text-[11px] text-slate-500 sm:col-span-2">
            The backup runs at the set time. If this computer is off then, it runs once when the application starts again.
            Backups older than one month are deleted automatically (the newest backup is always kept).
          </p>
          <div className="sm:col-span-2 dark:text-white">
            <label htmlFor="backup-dir">Backup folder</label>
            <div className="flex gap-2">
              <input id="backup-dir" className={input} value={cfg.directory} onChange={(e) => setCfg({ ...cfg, directory: e.target.value })} placeholder="D:\Backups\VC-Inmotions" />
              {canBrowse && (
                <button type="button" onClick={() => browse("directory", "Select the backup folder")} className="h-8 shrink-0 rounded border border-slate-300 px-3 text-[11px] font-semibold dark:border-slate-700">Browse...</button>
              )}
            </div>
          </div>
          <div className="sm:col-span-2 dark:text-white">
            <label htmlFor="backup-ext">External copy (optional: USB drive or network folder)</label>
            <div className="flex gap-2">
              <input id="backup-ext" className={input} value={cfg.externalDir} onChange={(e) => setCfg({ ...cfg, externalDir: e.target.value })} placeholder="E:\VC-Backups  or  \\server\share\backups" />
              {canBrowse && (
                <button type="button" onClick={() => browse("externalDir", "Select the external copy folder")} className="h-8 shrink-0 rounded border border-slate-300 px-3 text-[11px] font-semibold dark:border-slate-700">Browse...</button>
              )}
              {cfg.externalDir && (
                <button type="button" onClick={() => setCfg({ ...cfg, externalDir: "" })} className="h-8 shrink-0 rounded border border-slate-300 px-3 text-[11px] font-semibold dark:border-slate-700">Clear</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={saveSettings} disabled={!cfg || busy !== ""} className="h-8 rounded bg-slate-900 px-4 text-[11px] font-semibold text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-950">
          {busy === "save" ? "Saving..." : "Save settings"}
        </button>
        <button onClick={backupNow} disabled={busy !== "" || st?.running} className="h-8 rounded border border-slate-300 px-4 text-[11px] font-semibold disabled:opacity-40 dark:border-slate-700 dark:text-white">
          {busy === "now" || st?.running ? "Backing up..." : "Back up now"}
        </button>
      </div>

      <div>
        <h5 className="mb-1 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Available backups</h5>
        <div className="max-h-52 overflow-auto rounded border bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-[11px] dark:text-white">
            <tbody>
              {(st?.files ?? []).map((f) => (
                <tr key={f.location + f.name} className="border-b last:border-0 dark:border-slate-800">
                  <td className="px-2 py-1">{fmt(f.modifiedAt)}</td>
                  <td className="px-2">{mb(f.sizeBytes)}</td>
                  <td className="px-2 text-slate-500">{f.location === "primary" ? "Backup folder" : "External"}</td>
                  <td className="space-x-3 px-2 text-right">
                    <button className="underline" onClick={() => saveCopy(f)}>Save copy</button>
                    <button className="text-rose-600 underline" onClick={() => restore(f)}>Restore</button>
                  </td>
                </tr>
              ))}
              {(st?.files.length ?? 0) === 0 && <tr><td className="px-2 py-3 text-slate-400">No backups yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h5 className="mb-1 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Backup log</h5>
        <div className="max-h-44 overflow-auto rounded border bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-[11px] dark:text-white">
            <tbody>
              {(st?.log ?? []).map((l) => (
                <tr key={l.id} className="border-b last:border-0 dark:border-slate-800">
                  <td className="px-2 py-1">{fmt(l.at)}</td>
                  <td className="px-2">{l.type === "AUTO" ? "Automatic" : "Manual"}</td>
                  <td className={`px-2 font-medium ${l.ok ? "text-emerald-600" : "text-rose-600"}`}>{l.ok ? "Success" : "Failed"}</td>
                  <td className="px-2 text-slate-500">{l.ok ? mb(l.sizeBytes) : l.error}{l.externalError ? ` - ${l.externalError}` : ""}</td>
                </tr>
              ))}
              {(st?.log.length ?? 0) === 0 && <tr><td className="px-2 py-3 text-slate-400">Nothing logged yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
