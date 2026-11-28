#!/usr/bin/env node
/**
 * Build-time global parameter: subscription mode of the EXE.
 *   node scripts/sign-build-config.js                    (mode from SUBSCRIPTION_MODE in server/.env.prod)
 *   node scripts/sign-build-config.js --mode ENABLED     (Mode A: validate subscription online)
 *   node scripts/sign-build-config.js --mode STANDALONE  (Mode B: local only - no keys, valid LOCAL_LICENSE_MONTHS from first run, default 6)
 * Options: --months <n>  --api <portal api url>  --portal <portal web url>  --key-file <private key file>  --out <file>
 *
 * Writes server/dist/build-config.json, SIGNED with the portal's private key. The app verifies it with
 * the public key compiled into it, so users cannot change the mode by editing files or the database.
 * The private key is read from SUBSCRIPTION_PRIVATE_KEY (or --key-file) on the BUILD machine only;
 * it is never shipped inside the EXE.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i > -1 ? process.argv[i + 1] : d; };
const root = path.resolve(__dirname, "..");
function readEnvFile(f) {
  const out = {};
  try {
    for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(l);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
}
const prodEnv = { ...readEnvFile(path.join(root, "server", ".env")), ...readEnvFile(path.join(root, "server", ".env.prod")) }; // .env.prod wins
const portalEnv = readEnvFile(path.join(root, "server", ".env.portal"));

// Mode: --mode flag, else SUBSCRIPTION_MODE from server/.env.prod (or .env). Only the exact value ENABLED turns keys on;
// anything else (including empty) is the local mode, matching how the running app reads it.
const wanted = String(arg("mode", prodEnv.SUBSCRIPTION_MODE ?? "")).trim().toUpperCase();
const mode = wanted === "ENABLED" ? "ENABLED" : "STANDALONE";

let keyRaw = process.env.SUBSCRIPTION_PRIVATE_KEY || portalEnv.SUBSCRIPTION_PRIVATE_KEY;
const keyFile = arg("key-file");
if (keyFile) keyRaw = fs.readFileSync(keyFile, "utf8");
if (!keyRaw) {
  console.error("Private signing key not found (SUBSCRIPTION_PRIVATE_KEY, server/.env.portal or --key-file).");
  process.exit(1);
}
const pem = keyRaw.includes("BEGIN") ? keyRaw.replace(/\n/g, "\n") : Buffer.from(keyRaw, "base64").toString("utf8");
if (!pem.includes("PRIVATE KEY")) {
  console.error(
    "SUBSCRIPTION_PRIVATE_KEY is not a real key (still a placeholder?).\n" +
      "Copy the SUBSCRIPTION_PRIVATE_KEY line from the live server's ~/iapp/server/.env.portal into server/.env.portal.",
  );
  process.exit(1);
}

// Local mode (no keys): months of validity from the first run. --months, else LOCAL_LICENSE_MONTHS in server/.env.prod (or .env), else 6.
const rawMonths = Number(arg("months", prodEnv.LOCAL_LICENSE_MONTHS ?? 6));
const localMonths = Number.isInteger(rawMonths) && rawMonths >= 1 && rawMonths <= 120 ? rawMonths : 6;

const payload = {
  mode,
  localMonths,
  apiUrl: arg("api", prodEnv.SUBSCRIPTION_API_URL),
  portalUrl: arg("portal", prodEnv.SUBSCRIPTION_PORTAL_URL),
  builtAt: new Date().toISOString(),
  kind: "BUILD_CONFIG",
};
const payloadJson = JSON.stringify(payload);
const signature = crypto.sign(null, Buffer.from(payloadJson), crypto.createPrivateKey(pem)).toString("base64");

const out = path.resolve(arg("out", path.join(root, "server", "dist", "build-config.json")));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ payloadJson, signature }));
console.log(`Signed build config written: ${out}\n  mode=${mode} api=${payload.apiUrl} portal=${payload.portalUrl}`);
