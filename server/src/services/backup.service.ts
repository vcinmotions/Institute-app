import fs from "fs";
import os from "os";
import path from "path";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { backupFullSystem } from "../utils/backUp";

/**
 * Automatic + manual database backups.
 *  - Runs on the machine that hosts the database (the server PC in LAN mode).
 *  - Files are stored OUTSIDE the application data folder (default: Documents\VC-Inmotions-Backups), with an
 *    optional second copy to an external destination (USB drive / network share).
 *  - Backups older than one month are deleted automatically (the newest one is always kept); there is no API to delete a backup.
 *  - Every run is recorded in a log; a failure stays flagged until the next successful backup.
 * Backups are encrypted (AES-256, see utils/crypto.ts) and restored through the desktop app's Restore screen.
 */
export type BackupFrequency = "DAILY" | "TWICE_DAILY" | "WEEKLY" | "FIFTEEN_DAYS" | "MONTHLY";
export const FREQUENCIES: BackupFrequency[] = ["DAILY", "TWICE_DAILY", "WEEKLY", "FIFTEEN_DAYS", "MONTHLY"];

export type BackupConfig = {
  enabled: boolean;
  frequency: BackupFrequency;
  time: string; // HH:MM local time of the scheduled run (every frequency)
  time2: string; // HH:MM second run of the day (TWICE_DAILY only)
  weekday: number; // 0 = Sunday ... 6 = Saturday (WEEKLY only)
  monthDay: number; // 1-31 (MONTHLY only; a shorter month runs on its last day)
  // FIFTEEN_DAYS runs on the 1st and the 16th of every month.
  /** When the schedule was last saved: slots before this are never run (no surprise backup right after saving). */
  scheduleFrom?: string;
  directory: string; // primary backup folder
  externalDir: string; // optional second copy ("" = off)
};

export type BackupLogEntry = {
  id: string;
  at: string;
  type: "AUTO" | "MANUAL";
  ok: boolean;
  file?: string;
  sizeBytes?: number;
  error?: string;
  externalError?: string;
};

const dataDir = () => path.join(getUserDataPath(), "data");
const configFile = () => path.join(dataDir(), "backup-config.json");
const logFile = () => path.join(dataDir(), "backup-log.json");
const MAX_LOG = 200;
const RETRY_AFTER_FAILURE_MS = 30 * 60 * 1000;

export const defaultDirectory = () => path.join(os.homedir(), "Documents", "VC-Inmotions-Backups");

export function defaultConfig(): BackupConfig {
  return {
    enabled: true, frequency: "DAILY", time: "02:00", time2: "14:00", weekday: 0, monthDay: 1,
    directory: defaultDirectory(), externalDir: "",
  };
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
/** "HH:MM" + 12 hours (used to upgrade the old "every 12 hours" setting). */
const plus12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${String((h + 12) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function readConfig(): BackupConfig {
  try {
    const raw = JSON.parse(fs.readFileSync(configFile(), "utf8"));
    const cfg: BackupConfig = { ...defaultConfig(), ...raw };
    // Older versions had "EVERY_12H" (12 hours after the last backup): now twice a day at fixed times.
    if ((raw.frequency as string) === "EVERY_12H") {
      cfg.frequency = "TWICE_DAILY";
      if (!raw.time2) cfg.time2 = plus12h(cfg.time);
    }
    if (!FREQUENCIES.includes(cfg.frequency)) cfg.frequency = "DAILY";
    return cfg;
  } catch {
    return defaultConfig();
  }
}

/** Validates and saves new settings. Throws an Error with a user-readable message. */
export function saveConfig(input: Partial<BackupConfig>): BackupConfig {
  const cur = readConfig();
  const next: BackupConfig = { ...cur };
  if (input.enabled !== undefined) next.enabled = !!input.enabled;
  if (input.frequency !== undefined) {
    if (!FREQUENCIES.includes(input.frequency)) throw new Error("Choose a valid backup frequency.");
    next.frequency = input.frequency;
  }
  if (input.time !== undefined) {
    if (!TIME.test(String(input.time))) throw new Error("Choose the backup time.");
    next.time = String(input.time);
  }
  if (input.time2 !== undefined) {
    if (!TIME.test(String(input.time2))) throw new Error("Choose the second backup time.");
    next.time2 = String(input.time2);
  }
  if (input.weekday !== undefined) {
    const w = Number(input.weekday);
    if (!Number.isInteger(w) || w < 0 || w > 6) throw new Error("Choose the day of the week.");
    next.weekday = w;
  }
  if (input.monthDay !== undefined) {
    const d = Number(input.monthDay);
    if (!Number.isInteger(d) || d < 1 || d > 31) throw new Error("Choose a day of the month between 1 and 31.");
    next.monthDay = d;
  }
  if (next.frequency === "TWICE_DAILY" && next.time === next.time2) {
    throw new Error("Choose two different times for the twice-daily backup.");
  }
  for (const key of ["directory", "externalDir"] as const) {
    if (input[key] === undefined) continue;
    const v = String(input[key]).trim();
    if (key === "directory" && !v) throw new Error("Choose a backup folder.");
    if (v) {
      if (!path.isAbsolute(v)) throw new Error("Use a full folder path, e.g. D:\\Backups.");
      const rel = path.relative(getUserDataPath(), path.resolve(v));
      if (rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))) {
        throw new Error("Choose a folder outside the application data folder, so a backup is not lost with the database.");
      }
      fs.mkdirSync(v, { recursive: true }); // proves the path is usable
      fs.accessSync(v, fs.constants.W_OK);
    }
    next[key] = v;
  }
  if (next.externalDir && path.resolve(next.externalDir) === path.resolve(next.directory)) {
    throw new Error("The external destination must differ from the primary folder.");
  }
  // The new schedule starts now: the next backup runs at the next set time, not straight away.
  next.scheduleFrom = new Date().toISOString();
  delete (next as any).keep; // older versions kept a number of backups; now backups older than a month are removed
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(configFile(), JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function readLog(): BackupLogEntry[] {
  try {
    return JSON.parse(fs.readFileSync(logFile(), "utf8"));
  } catch {
    return [];
  }
}
function appendLog(e: BackupLogEntry) {
  const all = [e, ...readLog()].slice(0, MAX_LOG);
  try {
    fs.mkdirSync(dataDir(), { recursive: true });
    fs.writeFileSync(logFile(), JSON.stringify(all), "utf8");
  } catch (err) {
    console.error("Could not write backup log:", err);
  }
}

const BACKUP_NAME = /^\d{4}-\d{2}-\d{2}T[\d-]+Z?\.zip\.enc$/;

export function listBackups(cfg = readConfig()) {
  const out: { name: string; path: string; sizeBytes: number; modifiedAt: string; location: "primary" | "external" }[] = [];
  for (const [dir, location] of [[cfg.directory, "primary"], [cfg.externalDir, "external"]] as const) {
    if (!dir) continue;
    try {
      for (const n of fs.readdirSync(dir)) {
        if (!BACKUP_NAME.test(n)) continue;
        const st = fs.statSync(path.join(dir, n));
        out.push({ name: n, path: path.join(dir, n), sizeBytes: st.size, modifiedAt: st.mtime.toISOString(), location });
      }
    } catch { /* folder missing / drive removed */ }
  }
  return out.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

/** Backups older than this are deleted automatically (the newest backup is always kept). */
export function retentionCutoff(now: Date): Date {
  const d = new Date(now);
  d.setMonth(d.getMonth() - 1);
  return d;
}

/** Deletes backups older than one month. The newest backup in the folder is never deleted. */
function prune(dir: string) {
  if (!dir) return;
  try {
    const cutoff = retentionCutoff(new Date()).getTime();
    const files = fs
      .readdirSync(dir)
      .filter((n) => BACKUP_NAME.test(n))
      .map((n) => ({ n, t: fs.statSync(path.join(dir, n)).mtime.getTime() }))
      .sort((a, b) => b.t - a.t);
    for (const f of files.slice(1)) {
      if (f.t < cutoff) fs.rmSync(path.join(dir, f.n), { force: true });
    }
  } catch { /* ignore */ }
}

let running = false;

export async function runBackup(type: "AUTO" | "MANUAL"): Promise<BackupLogEntry> {
  const entry: BackupLogEntry = { id: Date.now().toString(36), at: new Date().toISOString(), type, ok: false };
  if (running) {
    entry.error = "Another backup is already running.";
    return entry; // not logged: nothing happened
  }
  running = true;
  try {
    const cfg = readConfig();
    const tmp = await backupFullSystem(); // encrypted file in the app data folder
    const size = fs.statSync(tmp).size;
    if (!size) throw new Error("The backup file is empty.");
    fs.mkdirSync(cfg.directory, { recursive: true });
    const dest = path.join(cfg.directory, path.basename(tmp));
    fs.copyFileSync(tmp, dest);
    if (fs.statSync(dest).size !== size) throw new Error("The copy in the backup folder is incomplete.");
    if (cfg.externalDir) {
      try {
        fs.mkdirSync(cfg.externalDir, { recursive: true });
        const ext = path.join(cfg.externalDir, path.basename(tmp));
        fs.copyFileSync(tmp, ext);
        if (fs.statSync(ext).size !== size) throw new Error("incomplete copy");
        prune(cfg.externalDir);
      } catch (e: any) {
        entry.externalError = `External copy failed: ${e?.message ?? e}`;
      }
    }
    fs.rmSync(tmp, { force: true });
    prune(cfg.directory);
    Object.assign(entry, { ok: true, file: dest, sizeBytes: size });
  } catch (e: any) {
    entry.error = e?.message ?? String(e);
    console.error("Backup failed:", e);
  } finally {
    running = false;
  }
  appendLog(entry);
  return entry;
}

/** `base`'s date at the time "HH:MM" (local time). */
function at(base: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Day `day` of the month that contains `base`, clamped to the month's last day (31 -> 30 / 28 / 29). */
function monthSlot(year: number, month: number, day: number, hhmm: string): Date {
  const last = new Date(year, month + 1, 0).getDate();
  return at(new Date(year, month, Math.min(day, last)), hhmm);
}

/** The most recent scheduled moment at or before `now`. */
export function lastSlot(cfg: BackupConfig, now: Date): Date {
  switch (cfg.frequency) {
    case "TWICE_DAILY": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const candidates = [at(now, cfg.time), at(now, cfg.time2), at(yesterday, cfg.time), at(yesterday, cfg.time2)];
      return candidates.filter((c) => c <= now).sort((a, b) => b.getTime() - a.getTime())[0];
    }
    case "WEEKLY": {
      const slot = at(now, cfg.time);
      slot.setDate(slot.getDate() - ((slot.getDay() - cfg.weekday + 7) % 7));
      if (slot > now) slot.setDate(slot.getDate() - 7);
      return slot;
    }
    case "FIFTEEN_DAYS": {
      // 1st and 16th of the month
      const y = now.getFullYear(), m = now.getMonth();
      const candidates = [at(new Date(y, m, 16), cfg.time), at(new Date(y, m, 1), cfg.time), at(new Date(y, m - 1, 16), cfg.time)];
      return candidates.find((c) => c <= now) as Date;
    }
    case "MONTHLY": {
      let slot = monthSlot(now.getFullYear(), now.getMonth(), cfg.monthDay, cfg.time);
      if (slot > now) slot = monthSlot(now.getFullYear(), now.getMonth() - 1, cfg.monthDay, cfg.time);
      return slot;
    }
    default: {
      // DAILY
      const slot = at(now, cfg.time);
      if (slot > now) slot.setDate(slot.getDate() - 1);
      return slot;
    }
  }
}

/** The next scheduled moment after `now` (shown on the settings screen). */
export function nextSlot(cfg: BackupConfig, now: Date): Date {
  // Search forward from the next minute: the first time lastSlot moves past `now` is the next run.
  const probe = (d: Date) => lastSlot(cfg, d).getTime() > now.getTime();
  const step = cfg.frequency === "MONTHLY" || cfg.frequency === "FIFTEEN_DAYS" ? 24 * 3600 * 1000 : 60 * 1000;
  let t = new Date(Math.ceil(now.getTime() / 60000) * 60000 + 60000);
  for (let i = 0; i < 40 * 24 * 60 && !probe(t); i++) t = new Date(t.getTime() + step);
  return lastSlot(cfg, t);
}

/**
 * The automatic backup runs at the time the admin set (daily / twice a day / weekly / every 15 days / monthly).
 *  - Only slots after the schedule was saved count, so saving the settings never starts a backup straight away.
 *  - Manual backups do not replace the scheduled one.
 *  - If the computer was off at the set time, the missed backup runs once when the application starts again.
 *  - A failed automatic backup is retried every 30 minutes until the next set time.
 */
export function isDue(cfg: BackupConfig, log: BackupLogEntry[], now: Date): boolean {
  if (!cfg.enabled) return false;
  const slot = lastSlot(cfg, now).getTime();
  if (cfg.scheduleFrom && slot < Date.parse(cfg.scheduleFrom)) return false;
  const auto = log.filter((l) => l.type === "AUTO" && Date.parse(l.at) >= slot);
  if (auto.some((l) => l.ok)) return false; // already done for this set time
  const lastTry = auto[0];
  if (lastTry && now.getTime() - Date.parse(lastTry.at) < RETRY_AFTER_FAILURE_MS) return false;
  return true;
}

/** First start of this version (or no settings saved yet): the schedule starts now, nothing runs at once. */
function ensureScheduleStart(cfg: BackupConfig): BackupConfig {
  if (cfg.scheduleFrom) return cfg;
  const next = { ...cfg, scheduleFrom: new Date().toISOString() };
  delete (next as any).keep;
  try {
    fs.mkdirSync(dataDir(), { recursive: true });
    fs.writeFileSync(configFile(), JSON.stringify(next, null, 2), "utf8");
  } catch (e) {
    console.error("Could not write backup settings:", e);
  }
  return next;
}

export function backupStatus() {
  const cfg = readConfig();
  const log = readLog();
  const lastSuccess = log.find((l) => l.ok) ?? null;
  const lastFailure = log.find((l) => !l.ok) ?? null;
  return {
    config: cfg,
    nextRun: cfg.enabled ? nextSlot(cfg, new Date()).toISOString() : null,
    lastSuccess,
    // A failure is "open" until a later backup succeeds.
    openFailure: lastFailure && (!lastSuccess || lastFailure.at > lastSuccess.at) ? lastFailure : null,
    files: listBackups(cfg),
    log: log.slice(0, 50),
    running,
  };
}

let timer: NodeJS.Timeout | null = null;

export function startBackupScheduler() {
  if (timer) return;
  const tick = async () => {
    try {
      if (!fs.existsSync(path.join(dataDir(), "central.db"))) return; // nothing to back up yet (not set up)
      const cfg = ensureScheduleStart(readConfig());
      if (isDue(cfg, readLog(), new Date())) await runBackup("AUTO");
    } catch (e) {
      console.error("Backup scheduler error:", e);
    }
  };
  timer = setInterval(tick, 60 * 1000);
  setTimeout(tick, 30 * 1000); // shortly after start: runs a backup missed while the PC was off
}
