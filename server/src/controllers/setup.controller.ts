import { Request, Response } from "express";
import crypto from "crypto";
import { createCentralDB } from "../utils/createCentralDB";
import { createTenant } from "../utils/createTenant";
import { createCompanyRow, instituteDb } from "../utils/institute";
import { getCentralPrisma } from "../prisma-client/central-client";
import { readSetupState } from "./setup-status.controller";
import { syncFromCloud } from "../services/subscription.service";
import { apiBase, getMode } from "../services/buildConfig.service";
import { claimServerFromPortal } from "../services/activation.service";

/**
 * First-time setup of the desktop EXE (on the institute's server PC).
 *
 * The Master Institute Super Admin signs in with the credentials of their web-portal
 * account. The central web server confirms who they are and returns the institute id,
 * its companies and its subscription. This PC then builds the institute's ONE local
 * database from that and remembers which institute it belongs to. Other PCs on the
 * LAN simply connect to this server (see /setup/identity) and never run setup.
 */

type Identity = {
  instituteId: string;
  instituteName: string;
  slug: string;
  owner: {
    name: string; email: string; businessEmail: string | null; contact: string;
    country: string; state: string; city: string; zipCode: string; fullAddress: string;
  };
  companies: {
    id: string;
    name: string; instituteName: string; contact: string; country: string; state: string; city: string;
    zipCode: string; fullAddress: string; isMaster: boolean;
    financialStartDate: string | null; financialEndDate: string | null;
  }[];
  subscription: { status: string; plan: string; expiryDate: string | null; maxUsers: number };
};

const KEY_ID = "institute.id";
const KEY_NAME = "institute.name";
const KEY_AT = "institute.installedAt";
// One server = one company: the company this server was set up for, and its two keys (kept in the local database).
const KEY_SCOPE = "install.scope"; // COMPANY | INSTITUTE (older installs)
const KEY_COMPANY_ID = "company.id";
const KEY_COMPANY_NAME = "company.name";
const KEY_SERVER_KEY = "keys.server";
const KEY_CLIENT_KEY = "keys.client";

/** Asks the central web server who these credentials belong to. */
async function fetchIdentity(email: string, password: string): Promise<Identity> {
  const api = apiBase();
  if (!api) {
    throw Object.assign(new Error("This installation is not connected to the central server."), { status: 500 });
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  let res: globalThis.Response;
  try {
    res = await fetch(`${api.replace(/\/$/, "")}/api/portal/identity`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-APP": "vcinmotions-desktop" },
      body: JSON.stringify({ email, password }),
      signal: ctrl.signal,
    });
  } catch {
    throw Object.assign(
      new Error("Cannot reach the central server. Check this computer's internet connection and try again."),
      { status: 502 }
    );
  } finally {
    clearTimeout(timer);
  }
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body?.error || "Authentication failed."), { status: res.status });
  if (!body?.instituteId || !body?.instituteName) {
    throw Object.assign(new Error("The central server returned an unexpected answer."), { status: 502 });
  }
  return body as Identity;
}

const yearOf = (d: string | null, fallback: Date) => (d ? new Date(d) : fallback);
function financialDates(c: { financialStartDate: string | null; financialEndDate: string | null }) {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // April to March
  const start = yearOf(c.financialStartDate, new Date(Date.UTC(startYear, 3, 1)));
  const end = yearOf(c.financialEndDate, new Date(Date.UTC(startYear + 1, 2, 31)));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

async function setSetting(prisma: any, key: string, value: string) {
  await prisma.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

export async function readInstalledInstitute(): Promise<{ id: string; name: string } | null> {
  if ((await readSetupState()) === "NOT_STARTED") return null;
  try {
    const prisma = getCentralPrisma();
    const [id, name] = await Promise.all([
      prisma.appSetting.findUnique({ where: { key: KEY_ID } }),
      prisma.appSetting.findUnique({ where: { key: KEY_NAME } }),
    ]);
    if (id) return { id: id.value, name: name?.value ?? "" };
    // Installed before institute ids existed (older setup): use the institute record already stored here.
    const legacy = await prisma.tenant.findFirst({
      where: { parentTenantId: null },
      orderBy: { createdAt: "asc" },
      select: { id: true, instituteName: true },
    });
    return legacy ? { id: legacy.id, name: legacy.instituteName } : null;
  } catch {
    return null;
  }
}

/** Setup step 1: sign in and list the institute's companies, so the Super Admin can choose this server's company. */
export async function setupCompaniesController(req: Request, res: Response) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) {
    return res.status(400).json({ error: "Enter the Master Institute Super Admin email and password." });
  }
  try {
    const state = await readSetupState();
    if (state !== "NOT_STARTED" && (await readInstalledInstitute())) {
      return res.status(403).json({ error: "Setup has already been completed on this computer." });
    }
    const identity = await fetchIdentity(email, password);
    return res.json({
      instituteName: identity.instituteName,
      subscription: identity.subscription,
      companies: identity.companies.map((c) => ({
        id: c.id, name: c.name, instituteName: c.instituteName, city: c.city, state: c.state, isMaster: c.isMaster,
      })),
    });
  } catch (err: any) {
    return res.status(err?.status && err.status < 600 ? err.status : 500).json({ error: err?.message || "Could not sign in." });
  }
}

export async function setupCentralController(req: Request, res: Response) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) {
    return res.status(400).json({ error: "Enter the Master Institute Super Admin email and password." });
  }
  const companyId = String(req.body?.companyId ?? "");
  if (!companyId) return res.status(400).json({ error: "Choose the company this server is for." });

  let createdCentral = false;
  try {
    // 1. Is this PC already set up? An installation belongs to one institute for good.
    const state = await readSetupState();
    if (state !== "NOT_STARTED" && (await readInstalledInstitute())) {
      return res.status(403).json({ error: "Setup has already been completed on this computer." });
    }

    // 2. Authenticate against the central web server (nothing is created locally before this succeeds).
    const identity = await fetchIdentity(email, password);
    const chosen = identity.companies.find((c) => c.id === companyId);
    if (!chosen) return res.status(404).json({ error: "That company was not found. Go back and choose again." });

    // 2b. Register THIS PC as the company's server. The portal returns the company's Server key and Client key.
    //     (Nothing local exists yet; if this fails the Super Admin simply tries again.)
    //     Local mode (not ENABLED) has no keys: skip this step entirely.
    const keyed = getMode() === "ENABLED";
    const claim: { ok: boolean; error?: string; reason?: string; serverKey?: string; clientKey?: string } = keyed
      ? await claimServerFromPortal({ email, password, companyId })
      : { ok: true };
    if (!claim.ok) return res.status(claim.reason === "LIMIT" ? 409 : 400).json({ error: claim.error });

    // 3. Local central database + the institute's Super Admin (password stored hashed, never plain).
    const incomplete = state !== "NOT_STARTED"; // an older half-finished setup: start over cleanly
    if (incomplete) await getCentralPrisma().superAdmin.deleteMany();
    // This row only records that the installation was authorised. It is not a login: the institute
    // owner signs in as the institute admin, so it gets an internal address and a random password.
    const internalEmail = `installation@${identity.slug}.local`;
    await createCentralDB(identity.instituteId, {
      password: crypto.randomBytes(24).toString("hex"),
      name: identity.owner.name,
      email: internalEmail,
    });
    createdCentral = true;
    const central = getCentralPrisma();
    await central.superAdmin.update({
      where: { email: internalEmail },
      data: {
        contact: identity.owner.contact, country: identity.owner.country, state: identity.owner.state,
        city: identity.owner.city, zipCode: identity.owner.zipCode, fullAddress: identity.owner.fullAddress,
        addressComplete: true,
      },
    });

    // 4. This server's database holds ONLY the chosen company (one server = one company).
    const master = chosen;
    const mfy = financialDates(master ?? { financialStartDate: null, financialEndDate: null });
    await createTenant(
      identity.owner.name, identity.instituteName, identity.owner.email, password,
      identity.owner.contact, identity.owner.country, identity.owner.state, identity.owner.city,
      identity.owner.zipCode, identity.owner.fullAddress, mfy.start, mfy.end,
      "", "", "", "", identity.owner.businessEmail, null,
      identity.instituteId // same institute id as the central server
    );
    const tenant = await central.tenant.findUnique({ where: { id: identity.instituteId } });
    if (!tenant) throw new Error("The institute record was not created.");
    const db = instituteDb(tenant);

    const primary = await db.clientAdmin.findFirst({ orderBy: { createdAt: "asc" } });
    if (primary) {
      await db.clientAdmin.update({
        where: { id: primary.id },
        data: { isMaster: true, ...(master ? { instituteName: master.instituteName } : {}) },
      });
    }
    if (primary) {
      // The primary row becomes the chosen company (name, branch address, contact).
      await db.clientAdmin.update({
        where: { id: primary.id },
        data: {
          name: chosen.name, instituteName: chosen.instituteName, contact: chosen.contact, country: chosen.country,
          state: chosen.state, city: chosen.city, zipCode: chosen.zipCode, fullAddress: chosen.fullAddress,
        },
      });
    }

    // 5. Remember which institute this installation belongs to.
    await setSetting(central, KEY_ID, identity.instituteId);
    await setSetting(central, KEY_NAME, identity.instituteName);
    await setSetting(central, KEY_AT, new Date().toISOString());
    await setSetting(central, KEY_SCOPE, "COMPANY");
    await setSetting(central, KEY_COMPANY_ID, chosen.id);
    await setSetting(central, KEY_COMPANY_NAME, chosen.instituteName || chosen.name);
    if (claim.serverKey) await setSetting(central, KEY_SERVER_KEY, claim.serverKey);
    if (claim.clientKey) await setSetting(central, KEY_CLIENT_KEY, claim.clientKey);

    // 6. Subscription (best effort: the signed licence is stored for offline use).
    const sync = await syncFromCloud({ email, password });

    return res.status(200).json({
      success: true,
      instituteId: identity.instituteId,
      instituteName: identity.instituteName,
      company: chosen.instituteName || chosen.name,
      serverKey: claim.serverKey,
      clientKey: claim.clientKey,
      subscription: identity.subscription,
      subscriptionSynced: sync.ok,
    });
  } catch (err: any) {
    console.error("Setup failed:", err);
    // Leave nothing half-built behind, so setup can simply be run again.
    if (createdCentral) {
      try {
        const c = getCentralPrisma();
        await c.tenant.deleteMany();
        await c.appSetting.deleteMany({ where: { key: { in: [KEY_ID, KEY_NAME, KEY_AT, KEY_SCOPE, KEY_COMPANY_ID, KEY_COMPANY_NAME, KEY_SERVER_KEY, KEY_CLIENT_KEY] } } });
        await c.superAdmin.deleteMany();
      } catch {
        /* best effort */
      }
    }
    return res.status(err?.status && err.status < 600 ? err.status : 500).json({
      success: false,
      error: err?.message || "Setup failed",
    });
  }
}

/** Public, secret-free: lets another PC on the LAN confirm which institute this server belongs to. */
export async function setupIdentityController(_req: Request, res: Response) {
  // "Initialized" means setup finished, whichever version of the app did it.
  const initialized = (await readSetupState()) === "FULL_DONE";
  const inst = initialized ? await readInstalledInstitute() : null;
  res.json({
    initialized,
    instituteId: inst?.id ?? null,
    instituteName: inst?.name ?? null,
  });
}

/**
 * Recovery / re-sync: the Master Super Admin re-authenticates, and the installation refreshes its
 * subscription and picks up companies added on the web portal. It refuses a different institute.
 */
export async function setupResyncController(req: Request, res: Response) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  try {
    const inst = await readInstalledInstitute();
    if (!inst) return res.status(409).json({ error: "This computer has not been set up yet." });
    const identity = await fetchIdentity(email, password);
    if (identity.instituteId !== inst.id) {
      return res.status(403).json({
        error: `This installation belongs to "${inst.name}". Switching to another institute is not allowed.`,
      });
    }
    const central = getCentralPrisma();
    const tenant = await central.tenant.findUnique({ where: { id: inst.id } });
    if (!tenant) return res.status(409).json({ error: "The local institute record is missing. Contact support." });
    const db = instituteDb(tenant);
    const scope = await central.appSetting.findUnique({ where: { key: KEY_SCOPE } });
    if (scope?.value === "COMPANY") {
      // One server = one company: only refresh the subscription (and the company's own details); never import other companies.
      const myId = (await central.appSetting.findUnique({ where: { key: KEY_COMPANY_ID } }))?.value;
      const mine = identity.companies.find((c) => c.id === myId);
      const primary = await db.clientAdmin.findFirst({ where: { isMaster: true } });
      if (mine && primary) {
        await db.clientAdmin.update({ where: { id: primary.id }, data: {
          name: mine.name, instituteName: mine.instituteName, contact: mine.contact, country: mine.country,
          state: mine.state, city: mine.city, zipCode: mine.zipCode, fullAddress: mine.fullAddress } });
      }
      const syncOne = await syncFromCloud({ email, password });
      return res.json({ success: true, companiesAdded: 0, subscriptionSynced: syncOne.ok, subscription: identity.subscription });
    }
    const have = await db.clientAdmin.findMany({ select: { instituteName: true } });
    const names = new Set(have.map((c: any) => c.instituteName.toLowerCase()));
    let added = 0;
    for (const c of identity.companies) {
      if (names.has(c.instituteName.toLowerCase())) continue;
      const fy = financialDates(c);
      await createCompanyRow(db, tenant.slug, {
        name: c.name, instituteName: c.instituteName, contact: c.contact, country: c.country, state: c.state,
        city: c.city, zipCode: c.zipCode, fullAddress: c.fullAddress,
        financialStartDate: fy.start, financialEndDate: fy.end,
      });
      added++;
    }
    const sync = await syncFromCloud({ email, password });
    return res.json({ success: true, companiesAdded: added, subscriptionSynced: sync.ok, subscription: identity.subscription });
  } catch (err: any) {
    return res.status(err?.status && err.status < 600 ? err.status : 500).json({ error: err?.message || "Re-sync failed" });
  }
}

