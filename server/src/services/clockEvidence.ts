import fs from "fs";
import os from "os";
import path from "path";
import { getUserDataPath } from "../middlewares/runtimePaths";

/**
 * Evidence of a rolled-back clock: the newest file timestamp in the temp folder and the app data folder.
 * The OS stamps these with the real clock whenever anything is written, so a value far ahead of "now" means
 * the PC clock was moved back after the PC (or app) was used. Set SUBSCRIPTION_FILE_CLOCK_CHECK=off to disable.
 */
export function newestFileEvidenceMs(): number {
  if (process.env.SUBSCRIPTION_FILE_CLOCK_CHECK === "off") return 0;
  let newest = 0;
  for (const dir of [os.tmpdir(), getUserDataPath(), path.join(getUserDataPath(), "data")]) {
    try {
      for (const n of fs.readdirSync(dir).slice(0, 1500)) {
        try {
          const m = fs.statSync(path.join(dir, n)).mtimeMs;
          if (m > newest) newest = m;
        } catch { /* skip */ }
      }
    } catch { /* skip */ }
  }
  return newest;
}
