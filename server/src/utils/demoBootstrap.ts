import crypto from "crypto";
import { createCentralDB } from "./createCentralDB";
import { createTenant } from "./createTenant";
import { instituteDb } from "./institute";
import { getCentralPrisma } from "../prisma-client/central-client";
import { readSetupState } from "../controllers/setup-status.controller";

/**
 * DEMO build only (DEMO_MODE=1): prepares the local database on first launch, so the
 * app runs completely on its own with no portal sign-in and no setup wizard.
 *
 *  - "Demo Institute" in its own local database, with the institute Super Admin
 *    demo@superadmin.com / superPassword (this is the login that opens the whole app).
 *  - The central DB only holds an internal installation record (same as the normal
 *    setup), because a central row with the login email would hide the institute account.
 *
 * Does nothing once the installation has been prepared.
 */
export const DEMO_EMAIL = "demo@superadmin.com";
export const DEMO_PASSWORD = "superPassword";
const DEMO_INSTITUTE = "Demo Institute";
const INTERNAL_EMAIL = "installation@demo.local";

export async function ensureDemoData() {
  if (process.env.DEMO_MODE !== "1") return;
  if ((await readSetupState()) === "FULL_DONE") return;

  console.log("🧪 Demo build: preparing the local demo database...");
  const central0 = getCentralPrisma();
  // A half-finished earlier attempt: start over cleanly.
  await central0.tenant.deleteMany().catch(() => {});
  await central0.superAdmin.deleteMany().catch(() => {});

  const instituteId = String(Math.floor(100000000 + Math.random() * 900000000));
  await createCentralDB(instituteId, {
    password: crypto.randomBytes(24).toString("hex"),
    name: "Demo Super Admin",
    email: INTERNAL_EMAIL,
  });

  const central = getCentralPrisma();
  await central.superAdmin.update({
    where: { email: INTERNAL_EMAIL },
    data: {
      contact: "9999999999", country: "India", state: "Gujarat", city: "Ahmedabad",
      zipCode: "380001", fullAddress: "Demo Address, Ahmedabad", addressComplete: true,
    },
  });

  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // April to March
  const fyStart = new Date(Date.UTC(startYear, 3, 1)).toISOString().slice(0, 10);
  const fyEnd = new Date(Date.UTC(startYear + 1, 2, 31)).toISOString().slice(0, 10);

  await createTenant(
    "Demo Admin", DEMO_INSTITUTE, DEMO_EMAIL, DEMO_PASSWORD,
    "9999999999", "India", "Gujarat", "Ahmedabad", "380001", "Demo Address, Ahmedabad",
    fyStart, fyEnd, "", "", "", "", null, null, instituteId
  );
  const tenant = await central.tenant.findUnique({ where: { id: instituteId } });
  if (!tenant) throw new Error("Demo institute was not created.");

  const db = instituteDb(tenant);
  const primary = await db.clientAdmin.findFirst({ orderBy: { createdAt: "asc" } });
  if (primary) {
    await db.clientAdmin.update({ where: { id: primary.id }, data: { isMaster: true, instituteName: DEMO_INSTITUTE } });
  }

  const set = (key: string, value: string) =>
    central.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  await set("institute.id", instituteId);
  await set("institute.name", DEMO_INSTITUTE);
  await set("institute.installedAt", new Date().toISOString());
  console.log("✅ Demo database ready.");
}
