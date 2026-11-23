import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getTenantPrisma } from "../prisma-client/tenant-client";
import { getTenantDbUrl } from "./envLoader";

/**
 * One institute = one database. Companies are ClientAdmin rows inside it.
 * The central Tenant row identifies the institute and where its database is.
 */
export function dbUrlOfTenant(tenant: { tenantId: string; dbUrl: string }): string {
  return process.env.APP_ENV === "prod" ? getTenantDbUrl(tenant.tenantId, true) : tenant.dbUrl;
}

export function instituteDb(tenant: { tenantId: string; dbUrl: string }) {
  return getTenantPrisma(dbUrlOfTenant(tenant));
}

type Db = ReturnType<typeof getTenantPrisma>;

/**
 * The institute's first ClientAdmin is its primary company (isMaster).
 * Older databases have no flag yet, so mark the earliest company once.
 */
export async function ensureMasterCompany(db: Db) {
  const existing = await db.clientAdmin.findFirst({ where: { isMaster: true }, select: { id: true } });
  if (existing) return existing.id;
  const first = await db.clientAdmin.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!first) return null;
  await db.clientAdmin.update({ where: { id: first.id }, data: { isMaster: true } });
  return first.id;
}

export type CompanyInput = {
  name: string;
  instituteName: string;
  contact: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  fullAddress: string;
  financialStartDate: string;
  financialEndDate: string;
  certificateName?: string | null;
};

/** Adds another company to an institute database. Companies have no login of their own; users are shared. */
export async function createCompanyRow(db: Db, masterSlug: string, c: CompanyInput) {
  const start = new Date(c.financialStartDate);
  const end = new Date(c.financialEndDate);
  const tag = crypto.randomBytes(4).toString("hex");
  const company = await db.clientAdmin.create({
    data: {
      name: c.name,
      email: `company-${tag}@${masterSlug}`, // internal only, not a login
      password: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10),
      instituteName: c.instituteName,
      slug: `${masterSlug}-${tag}`,
      contact: c.contact,
      country: c.country,
      state: c.state,
      city: c.city,
      zipCode: c.zipCode,
      fullAddress: c.fullAddress,
      position: "ADMIN",
      role: "ADMIN",
      isMaster: false,
      certificateName: c.certificateName || null,
    },
  });
  await db.financialYear.create({
    data: {
      name: `${start.getFullYear()}-${end.getFullYear()}`,
      startDate: start,
      endDate: end,
      isActive: true,
      clientAdminId: company.id,
    },
  });
  return company;
}

export type CompanyChoice = { id: string; name: string; role: string };

/** Every company a signed-in user may work in, with the role they hold there. */
export async function companiesForUser(
  db: Db,
  user: { userType: string; id: string | number; role: string; clientAdminId: string }
): Promise<CompanyChoice[]> {
  const select = { id: true, instituteName: true } as const;

  if (user.userType === "ADMIN") {
    // The institute admin works in every company; a company row never logs in by itself.
    const all = await db.clientAdmin.findMany({
      select: { ...select, isMaster: true },
      orderBy: { createdAt: "asc" },
    });
    const me = all.find((c) => c.id === user.clientAdminId);
    const list = me?.isMaster ? all : all.filter((c) => c.id === user.clientAdminId);
    return list.map((c) => ({ id: c.id, name: c.instituteName, role: "ADMIN" }));
  }

  if (user.userType === "ROLE_USER") {
    // The access table is authoritative; a user with no rows (older data) keeps their home company.
    const rows = await db.userCompanyAccess.findMany({
      where: { roleUserId: String(user.id) },
      include: { clientAdmin: { select } },
    });
    if (rows.length > 0) {
      return rows.map((r) => ({ id: r.clientAdminId, name: r.clientAdmin.instituteName, role: r.role }));
    }
    const home = await db.clientAdmin.findUnique({ where: { id: user.clientAdminId }, select });
    return home ? [{ id: home.id, name: home.instituteName, role: user.role }] : [];
  }

  // Faculty belong to one company.
  const home = await db.clientAdmin.findUnique({ where: { id: user.clientAdminId }, select });
  return home ? [{ id: home.id, name: home.instituteName, role: user.role }] : [];
}
