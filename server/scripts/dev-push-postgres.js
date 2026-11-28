#!/usr/bin/env node
/**
 * DEVELOPMENT (PostgreSQL) only: bring the central database and every institute database up to the current Prisma schema.
 *
 *   node scripts/dev-push-postgres.js            -> shows the plan, changes NOTHING
 *   node scripts/dev-push-postgres.js --apply    -> runs `prisma db push` on each database
 *   add --with-backups to include the *_backup databases (skipped by default)
 *
 * `db push` here only ADDS columns / tables (it never uses --accept-data-loss), so existing rows are kept.
 * If Prisma thinks a change could lose data it refuses and this script reports it - nothing is forced.
 * Connection details come from server/.env.dev (DB_HOST, DB_PORT, DB_USER, DB_PASS).
 */
const path = require("path");
const { execFileSync } = require("child_process");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.dev") });
const { Client } = require("pg");

const apply = process.argv.includes("--apply");
const withBackups = process.argv.includes("--with-backups");
const base = { host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASS };
const url = (db) => `postgresql://${encodeURIComponent(base.user)}:${encodeURIComponent(base.password)}@${base.host}:${base.port}/${db}`;
const mask = (u) => u.replace(/:\/\/([^:]+):[^@]+@/, "://$1:****@");

async function kindOf(db) {
  const c = new Client({ ...base, database: db });
  await c.connect();
  try {
    const has = async (t) => (await c.query("select 1 from information_schema.tables where table_name=$1", [t])).rowCount > 0;
    if (await has("Tenant")) return "central";
    if (await has("RoleUser")) return "institute";
    return "other";
  } finally { await c.end(); }
}

(async () => {
  if (!base.host || !base.user) { console.error("DB_HOST / DB_USER not found in server/.env.dev"); process.exit(1); }
  const admin = new Client({ ...base, database: "postgres" });
  await admin.connect();
  const names = (await admin.query("select datname from pg_database where not datistemplate and datname<>'postgres' order by datname")).rows.map((r) => r.datname);
  await admin.end();

  const plan = [];
  for (const db of names) {
    const kind = await kindOf(db);
    if (kind === "other") continue;
    if (db.endsWith("_backup") && !withBackups) continue;
    plan.push({ db, kind });
  }
  console.log(`${apply ? "APPLYING to" : "PLAN (nothing changed) for"} ${plan.length} database(s):`);
  plan.forEach((p) => console.log(`  ${p.kind.padEnd(9)} ${p.db}`));
  if (!apply) { console.log("\nRun again with --apply to update them."); return; }

  const prisma = path.join(__dirname, "..", "node_modules", "prisma", "build", "index.js");
  let ok = 0, failed = 0;
  for (const { db, kind } of plan) {
    const schema = path.join(__dirname, "..", "prisma", kind === "central" ? "central" : "institute", "schema.prisma");
    try {
      execFileSync(process.execPath, [prisma, "db", "push", "--skip-generate", `--schema=${schema}`], {
        env: { ...process.env, DATABASE_URL: url(db) }, stdio: "pipe", cwd: path.join(__dirname, ".."),
      });
      console.log(`  OK      ${db}`); ok++;
    } catch (e) {
      const msg = String(e.stderr || e.stdout || e.message).split("\n").filter(Boolean).slice(-3).join(" | ").slice(0, 260);
      console.log(`  FAILED  ${db}: ${mask(msg)}`); failed++;
    }
  }
  console.log(`\nDone: ${ok} updated, ${failed} failed.`);
})().catch((e) => { console.error("Error:", String(e.message).slice(0, 200)); process.exit(1); });
