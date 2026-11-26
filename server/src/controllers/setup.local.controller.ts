import { Request, Response } from "express";
import crypto from "crypto";
import { createCentralDB } from "../utils/createCentralDB";
import { createTenant } from "../utils/createTenant";
import { instituteDb } from "../utils/institute";
import { getCentralPrisma } from "../prisma-client/central-client";
import { readSetupState } from "./setup-status.controller";
import { getMode } from "../services/buildConfig.service";

/**
 * First-time setup WITHOUT the web portal (standalone / local licence mode).
 *  - POST /setup/local : the client types their own institute details and logins.
 *  - POST /setup/demo  : creates a demo institute with fixed demo logins and sample records.
 * Both are refused when the build uses portal activation (SUBSCRIPTION_MODE=ENABLED) or when this PC is already set up.
 */

export const DEMO = {
  admin: { email: "admin@demo.com", password: "Admin@123" },
  instituteName: "Demo Institute",
};

type Details = {
  instituteName: string; ownerName: string; email: string; password: string;
  contact: string; country: string; state: string; city: string; zipCode: string; fullAddress: string;
};

const clean = (v: any) => String(v ?? "").trim();
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function setSetting(prisma: any, key: string, value: string) {
  await prisma.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

function financialYear() {
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // April to March
  return { start: `${y}-04-01`, end: `${y + 1}-03-31` };
}

async function alreadySetUp() {
  return (await readSetupState()) !== "NOT_STARTED";
}

/** Builds the central database, the installation record and the institute database. Returns the institute id. */
async function buildInstall(d: Details): Promise<string> {
  const instituteId = crypto.randomUUID();
  // The EXE has ONE admin: the institute admin (d.email). The central master row only records the
  // installation; it is not a login, so it gets an internal address and a random password.
  const internalEmail = `installation@${instituteId}.local`;
  await createCentralDB(instituteId, { password: crypto.randomBytes(24).toString("hex"), name: d.ownerName, email: internalEmail });
  const central = getCentralPrisma();
  await central.superAdmin.update({
    where: { email: internalEmail },
    data: {
      contact: d.contact, country: d.country, state: d.state, city: d.city, zipCode: d.zipCode,
      fullAddress: d.fullAddress, addressComplete: true,
    },
  });
  const fy = financialYear();
  await createTenant(
    d.ownerName, d.instituteName, d.email, d.password, d.contact, d.country, d.state, d.city,
    d.zipCode, d.fullAddress, fy.start, fy.end, "", "", "", "", d.email, null, instituteId
  );
  const tenant = await central.tenant.findUnique({ where: { id: instituteId } });
  if (!tenant) throw new Error("The institute record was not created.");
  const db = instituteDb(tenant);
  const primary = await db.clientAdmin.findFirst({ orderBy: { createdAt: "asc" } });
  if (primary) await db.clientAdmin.update({ where: { id: primary.id }, data: { isMaster: true } });

  await setSetting(central, "institute.id", instituteId);
  await setSetting(central, "institute.name", d.instituteName);
  await setSetting(central, "institute.installedAt", new Date().toISOString());
  await setSetting(central, "install.scope", "COMPANY");
  await setSetting(central, "company.name", d.instituteName);
  return instituteId;
}

async function rollback() {
  try {
    const c = getCentralPrisma();
    await c.tenant.deleteMany();
    await c.appSetting.deleteMany({ where: { key: { in: ["institute.id", "institute.name", "institute.installedAt", "install.scope", "company.name"] } } });
    await c.superAdmin.deleteMany();
  } catch { /* best effort */ }
}

/** Sample records so the client can click through every screen. */
async function seedDemo(instituteId: string) {
  const central = getCentralPrisma();
  const tenant = await central.tenant.findUnique({ where: { id: instituteId } });
  if (!tenant) return;
  const db: any = instituteDb(tenant);
  const admin = await db.clientAdmin.findFirst({ orderBy: { createdAt: "asc" } });
  if (!admin) return;
  const clientAdminId = admin.id;

  const sources: any[] = [];
  for (const name of ["Walk-in", "Website", "Social media", "Friend / Relative"]) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    sources.push(await db.sourceType.upsert({ where: { slug }, update: {}, create: { name, slug } }));
  }

  const courses: any[] = [];
  for (const [name, durationMonths, description] of [
    ["Basic Computer Course", 3, "Computer basics, MS Office and internet"],
    ["Web Designing", 6, "HTML, CSS, JavaScript and a small project"],
    ["Spoken English", 4, "Speaking practice and confidence building"],
  ] as [string, number, string][]) {
    courses.push(await db.course.create({ data: { name, durationMonths, description, clientAdminId } }));
  }

  await db.lab.create({ data: { name: "LAB-01", location: "Ground floor", totalPCs: 10, kind: "LAB", clientAdminId } });
  await db.lab.create({ data: { name: "Class Room A", location: "First floor", totalPCs: 25, kind: "CLASS", clientAdminId } });

  const people: [string, string, string][] = [
    ["Aarav Sharma", "9000000001", "M"], ["Diya Patel", "9000000002", "F"], ["Rohan Mehta", "9000000003", "M"],
    ["Isha Verma", "9000000004", "F"], ["Kabir Singh", "9000000005", "M"], ["Meera Nair", "9000000006", "F"],
  ];
  const statuses = ["HOT", "WARM", "COLD", "HOT", "WARM", "WON"];
  for (let i = 0; i < people.length; i++) {
    const [name, contact] = people[i];
    await db.enquiry.create({
      data: {
        srNo: i + 1, name, contact, email: `${name.split(" ")[0].toLowerCase()}@example.com`,
        course: courses[i % courses.length].name, sourceId: sources[i % sources.length].id,
        leadStatus: statuses[i], enquiryDate: new Date(Date.now() - i * 86400000), takenBy: "Front Desk",
        city: "Ahmedabad", clientAdminId,
      },
    });
  }

  const students: [string, string, string][] = [
    ["Neha Joshi", "9100000001", "F"], ["Vikram Rao", "9100000002", "M"], ["Pooja Desai", "9100000003", "F"],
  ];
  for (let i = 0; i < students.length; i++) {
    const [fullName, contact, gender] = students[i];
    await db.student.create({
      data: {
        serialNumber: i + 1, studentCode: `STU-${String(i + 1).padStart(3, "0")}`,
        admissionNumber: `ADM-${String(i + 1).padStart(3, "0")}`, fullName, contact, gender,
        email: `${fullName.split(" ")[0].toLowerCase()}@example.com`, admissionDate: new Date(), clientAdminId,
      },
    });
  }
}

/** Refuses setup when it is not allowed; returns true when the caller may go on. */
async function guard(res: Response): Promise<boolean> {
  if (getMode() === "ENABLED") {
    res.status(403).json({ error: "This installation must be activated from the portal." });
    return false;
  }
  if (await alreadySetUp()) {
    res.status(403).json({ error: "Setup has already been completed on this computer." });
    return false;
  }
  return true;
}

export async function setupLocalController(req: Request, res: Response) {
  const b = req.body ?? {};
  const d: Details = {
    instituteName: clean(b.instituteName), ownerName: clean(b.ownerName),
    email: clean(b.email).toLowerCase(), password: String(b.password ?? ""),
    contact: clean(b.contact), country: clean(b.country) || "India", state: clean(b.state), city: clean(b.city),
    zipCode: clean(b.zipCode), fullAddress: clean(b.fullAddress),
  };
  const missing = (["instituteName", "ownerName", "email", "password", "contact", "state", "city", "zipCode", "fullAddress"] as const).filter((k) => !d[k]);
  if (missing.length) return res.status(400).json({ error: "Please fill in all the fields." });
  if (!isEmail(d.email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (d.password.length < 6) return res.status(400).json({ error: "The password must be at least 6 characters." });
  if (!(await guard(res))) return;

  try {
    await buildInstall(d);
    return res.json({ success: true, instituteName: d.instituteName });
  } catch (err: any) {
    console.error("Local setup failed:", err);
    await rollback();
    return res.status(500).json({ success: false, error: err?.message || "Setup failed" });
  }
}

export async function setupDemoController(_req: Request, res: Response) {
  if (!(await guard(res))) return;
  try {
    const id = await buildInstall({
      instituteName: DEMO.instituteName, ownerName: "Demo Owner",
      email: DEMO.admin.email, password: DEMO.admin.password,
      contact: "9999999999", country: "India", state: "Gujarat", city: "Ahmedabad", zipCode: "380001",
      fullAddress: "1 Demo Street, Ahmedabad",
    });
    await seedDemo(id);
    return res.json({ success: true, demo: true, instituteName: DEMO.instituteName, logins: DEMO });
  } catch (err: any) {
    console.error("Demo setup failed:", err);
    await rollback();
    return res.status(500).json({ success: false, error: err?.message || "Setup failed" });
  }
}

/** Tells the setup screen whether the offline options may be shown. */
export function setupOptionsController(_req: Request, res: Response) {
  res.json({ portal: getMode() === "ENABLED", local: getMode() !== "ENABLED" });
}


