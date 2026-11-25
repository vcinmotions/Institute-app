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
 *  - Retention is applied only by this service; there is no API to delete a backup.
 *  - Every run is recorded in a log; a failure stays flagged until the next successful backup.
 * Backups are encrypted (AES-256, see utils/crypto.ts) and restored through the desktop app's Restore screen.
 */
export type BackupConfig = {
  enabled: boolean;
  frequency: "EVERY_12H" | "DAILY" | "WEEKLY";
  time: string; // HH:MM local time of the scheduled run (DAILY / WEEKLY)
  keep: number; // how many backups to keep
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
  return { enabled: true, frequency: "DAILY", time: "02:00", keep: 14, directory: defaultDirectory(), externalDir: "" };
}

export function readConfig(): BackupConfig {
  try {
    return { ...defaultConfig(), ...JSON.parse(fs.readFileSync(configFile(), "utf8")) };
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
    if (!["EVERY_12H", "DAILY", "WEEKLY"].includes(input.frequency)) throw new Error("Choose a valid backup frequency.");
    next.frequency = input.frequency;
  }
  if (input.time !== undefined) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(input.time))) throw new Error("Backup time must be HH:MM.");
    next.time = String(input.time);
  }
  if (input.keep !== undefined) {
    const k = Number(input.keep);
    if (!Number.isInteger(k) || k < 1 || k > 365) throw new Error("Keep between 1 and 365 backups.");
    next.keep = k;
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

function prune(dir: string, keep: number) {
  if (!dir) return;
  try {
    const files = fs.readdirSync(dir).filter((n) => BACKUP_NAME.test(n)).sort(); // names start with a timestamp
    for (const n of files.slice(0, Math.max(0, files.length - keep))) fs.rmSync(path.join(dir, n), { force: true });
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
        prune(cfg.externalDir, cfg.keep);
      } catch (e: any) {
        entry.externalError = `External copy failed: ${e?.message ?? e}`;
      }
    }
    fs.rmSync(tmp, { force: true });
    prune(cfg.directory, cfg.keep);
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

/** The most recent scheduled moment at or before `now`. */
export function lastSlot(cfg: BackupConfig, now: Date): Date {
  if (cfg.frequency === "EVERY_12H") return new Date(now.getTime() - 12 * 3600 * 1000);
  const [h, m] = cfg.time.split(":").map(Number);
  const slot = new Date(now);
  slot.setHours(h, m, 0, 0);
  if (cfg.frequency === "DAILY") {
    if (slot > now) slot.setDate(slot.getDate() - 1);
  } else {
    // WEEKLY: Sunday
    slot.setDate(slot.getDate() - slot.getDay());
    if (slot > now) slot.setDate(slot.getDate() - 7);
  }
  return slot;
}

export function isDue(cfg: BackupConfig, log: BackupLogEntry[], now: Date): boolean {
  if (!cfg.enabled) return false;
  const lastOk = log.find((l) => l.ok);
  const lastAny = log[0];
  if (lastAny && !lastAny.ok && now.getTime() - Date.parse(lastAny.at) < RETRY_AFTER_FAILURE_MS) return false;
  if (!lastOk) return true; // never backed up
  const slot = lastSlot(cfg, now);
  return Date.parse(lastOk.at) < slot.getTime();
}

export function backupStatus() {
  const cfg = readConfig();
  const log = readLog();
  const lastSuccess = log.find((l) => l.ok) ?? null;
  const lastFailure = log.find((l) => !l.ok) ?? null;
  return {
    config: cfg,
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
      if (isDue(readConfig(), readLog(), new Date())) await runBackup("AUTO");
    } catch (e) {
      console.error("Backup scheduler error:", e);
    }
  };
  timer = setInterval(tick, 60 * 1000);
  setTimeout(tick, 30 * 1000); // catch up shortly after start (PC was off at the scheduled time)
}
