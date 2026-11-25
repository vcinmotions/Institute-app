/**
 * Adds the default roles (Front Desk, Accountant, View Only) to every company of every institute database that is
 * registered in the central database. Needed once for databases created before the roles shipped; new installs and
 * new companies get them automatically.
 *
 *   npx ts-node --transpile-only src/scripts/seed-default-roles.ts            -> shows what it would add
 *   npx ts-node --transpile-only src/scripts/seed-default-roles.ts --apply    -> adds the missing roles
 *
 * It only INSERTS missing roles and their permission rows. Existing roles, users and data are never changed.
 */
import { loadEnv } from "../utils/envLoader";
loadEnv();
import { getCentralPrisma } from "../prisma-client/central-client";
import { getTenantPrisma } from "../prisma-client/tenant-client";
import { dbUrlOfTenant } from "../utils/institute";
import { DEFAULT_ROLE_NAMES, ensureDefaultRoles } from "../services/permissions.service";

const apply = process.argv.includes("--apply");
const mask = (u: string) => u.replace(/:\/\/([^:]+):[^@]+@/, "://$1:****@");

(async () => {
  const central = getCentralPrisma();
  const tenants = await central.tenant.findMany({ select: { instituteName: true, tenantId: true, dbUrl: true }, orderBy: { createdAt: "asc" } });
  console.log(`${apply ? "APPLYING" : "PLAN (nothing changed)"} - ${tenants.length} institute database(s)\n`);

  let created = 0, already = 0, failed = 0;
  for (const t of tenants) {
    const label = `${String(t.instituteName).padEnd(26)}`;
    try {
      const db = getTenantPrisma(dbUrlOfTenant(t));
      const companies = await db.clientAdmin.findMany({ select: { id: true, instituteName: true } });
      for (const c of companies) {
        const have = await db.accessRole.findMany({ where: { clientAdminId: c.id, name: { in: DEFAULT_ROLE_NAMES } }, select: { name: true } });
        const missing = DEFAULT_ROLE_NAMES.filter((n) => !have.some((h: any) => h.name === n));
        if (missing.length === 0) { already++; console.log(`  ${label} ${String(c.instituteName).padEnd(24)} already has all 3`); continue; }
        if (apply) await ensureDefaultRoles(db, c.id);
        created += missing.length;
        console.log(`  ${label} ${String(c.instituteName).padEnd(24)} ${apply ? "ADDED" : "would add"}: ${missing.join(", ")}`);
      }
    } catch (e: any) {
      failed++;
      console.log(`  ${label} FAILED: ${mask(String(e?.message ?? e).split("\n").filter(Boolean).slice(-1)[0] ?? "")}`);
    }
  }
  console.log(`\n${apply ? "Added" : "Would add"} ${created} role(s). Companies already complete: ${already}. Databases that failed: ${failed}.`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(String(e?.message ?? e).slice(0, 300)); process.exit(2); });
