import { getCentralPrisma } from "../prisma-client/central-client";

/**
 * Resolves a tenant's database URL from the central DB.
 * The URL (which may contain DB credentials) is kept server-side and is
 * never put into JWTs or API responses.
 */
const cache = new Map<string, string>();

export async function getTenantDbUrlById(tenantId: string): Promise<string | null> {
  const hit = cache.get(tenantId);
  if (hit) return hit;
  const tenant = await getCentralPrisma().tenant.findUnique({
    where: { id: tenantId },
    select: { dbUrl: true },
  });
  if (!tenant?.dbUrl) return null;
  cache.set(tenantId, tenant.dbUrl);
  return tenant.dbUrl;
}

const slugCache = new Map<string, string>();

export async function getTenantSlugById(tenantId: string): Promise<string | null> {
  const hit = slugCache.get(tenantId);
  if (hit) return hit;
  const tenant = await getCentralPrisma().tenant.findUnique({
    where: { id: tenantId },
    select: { slug: true },
  });
  if (!tenant?.slug) return null;
  slugCache.set(tenantId, tenant.slug);
  return tenant.slug;
}

/**
 * The institute's short login code (4 digits, e.g. "2026"), created on first use.
 * Staff usernames are name@code; the code tells sign-in which institute to open.
 * It prefers the year the institute was created, otherwise a free random 4-digit number.
 */
export async function ensureLoginCode(tenantId: string): Promise<string | null> {
  const prisma = getCentralPrisma();
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { loginCode: true, createdAt: true } });
  if (!tenant) return null;
  if (tenant.loginCode) return tenant.loginCode;
  const candidates = [String(tenant.createdAt.getFullYear())];
  for (let i = 0; i < 40; i++) candidates.push(String(1000 + Math.floor(Math.random() * 9000)));
  for (const code of candidates) {
    try {
      // updateMany + loginCode:null so two parallel calls cannot overwrite each other's code
      const r = await prisma.tenant.updateMany({ where: { id: tenantId, loginCode: null }, data: { loginCode: code } });
      if (r.count === 0) break; // someone else just set it
      return code;
    } catch (e: any) {
      if (e?.code !== "P2002") throw e; // code used by another institute: try the next one
    }
  }
  const again = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { loginCode: true } });
  return again?.loginCode ?? null;
}

/**
 * Faculty and role users sign in by username, and the institute is found from the
 * part after @, so it must be this institute's login code (name@2026) or, for older
 * usernames, its slug (name@sky-institute).
 * Returns an error message, or null when the username is acceptable.
 */
export async function checkLoginEmailDomain(
  user: any,
  email: string
): Promise<string | null> {
  if (!user?.tenantId) return null; // cannot verify (e.g. older token) - do not block
  const [slug, code] = await Promise.all([getTenantSlugById(user.tenantId), ensureLoginCode(user.tenantId)]);
  if (!slug && !code) return null;
  const domain = String(email).split("@")[1]?.toLowerCase();
  if (domain === code || (slug && domain === slug.toLowerCase())) return null;
  return `Username must end with @${code ?? slug} so this user can sign in to this institute`;
}
