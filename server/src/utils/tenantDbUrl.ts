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
 * Faculty and role users sign in by email, and the institute is found from the
 * email domain, so the domain must equal the institute slug.
 * Returns an error message, or null when the email is acceptable.
 */
export async function checkLoginEmailDomain(
  user: any,
  email: string
): Promise<string | null> {
  const slug = user?.tenantId ? await getTenantSlugById(user.tenantId) : null;
  if (!slug) return null; // cannot verify (e.g. older token) - do not block
  const domain = String(email).split("@")[1]?.toLowerCase();
  if (domain !== slug.toLowerCase()) {
    return `Email must end with @${slug} so this user can sign in to this institute`;
  }
  return null;
}
