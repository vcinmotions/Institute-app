import { PrismaClient as TenantPrisma } from '../../prisma-client/generated/tenant';

const clients: Record<string, TenantPrisma> = {};

export function getTenantPrisma(dbUrl: string): TenantPrisma {
  if (!clients[dbUrl]) {
    
    clients[dbUrl] = new TenantPrisma({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }
  return clients[dbUrl];
}
