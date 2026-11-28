import crypto from "crypto";
import os from "os";
import { execFileSync } from "child_process";
import { EMBEDDED_LICENSE_PUBLIC_KEY } from "../config/licensePublicKey";

let cached: string | null = null;

function rawMachineId(): string {
  if (process.platform === "win32") {
    try {
      const out = execFileSync(
        "reg",
        ["query", "HKLM\SOFTWARE\Microsoft\Cryptography", "/v", "MachineGuid"],
        { encoding: "utf8", windowsHide: true, timeout: 4000 }
      );
      const m = /MachineGuid\s+REG_SZ\s+(\S+)/i.exec(out);
      if (m) return m[1];
    } catch { /* fall through */ }
  }
  const macs = Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && !i.internal && i.mac && i.mac !== "00:00:00:00:00:00")
    .map((i) => i!.mac)
    .sort();
  return `${os.hostname()}|${macs[0] ?? ""}`;
}

/** Stable, anonymised id of this PC (hash of the OS machine GUID). */
export function getDeviceId(): string {
  if (!cached) cached = crypto.createHash("sha256").update("vc-device:" + rawMachineId()).digest("hex").slice(0, 32);
  return cached;
}

export function getDeviceInfo() {
  return { deviceId: getDeviceId(), deviceName: os.hostname(), os: `${os.type()} ${os.release()} (${os.arch()})` };
}

/** Local-only secret for protecting small local state (bound to this PC; not stored in .env). */
export function localMacKey(): string {
  return crypto.createHash("sha256").update("vc-local:" + getDeviceId() + EMBEDDED_LICENSE_PUBLIC_KEY).digest("hex");
}
