#!/usr/bin/env node
/**
 * Build-time global parameter: subscription mode of the EXE.
 *   node scripts/sign-build-config.js --mode ENABLED     (Mode A: validate subscription online)
 *   node scripts/sign-build-config.js --mode STANDALONE  (Mode B: local only, 364-day licence)
 * Options: --api <portal api url>  --portal <portal web url>  --key-file <private key file>  --out <file>
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
const mode = String(arg("mode", "")).toUpperCase();
if (mode !== "ENABLED" && mode !== "STANDALONE") {
  console.error("Usage: --mode ENABLED|STANDALONE");
  process.exit(1);
}

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
const prodEnv = readEnvFile(path.join(root, "server", ".env.prod"));
const portalEnv = readEnvFile(path.join(root, "server", ".env.portal"));

let keyRaw = process.env.SUBSCRIPTION_PRIVATE_KEY || portalEnv.SUBSCRIPTION_PRIVATE_KEY;
const keyFile = arg("key-file");
if (keyFile) keyRaw = fs.readFileSync(keyFile, "utf8");
if (!keyRaw) {
  console.error("Private signing key not found (SUBSCRIPTION_PRIVATE_KEY, server/.env.portal or --key-file).");
  process.exit(1);
}
const pem = keyRaw.includes("BEGIN") ? keyRaw.replace(/\n/g, "\n") : Buffer.from(keyRaw, "base64").toString("utf8");

const payload = {
  mode,
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
