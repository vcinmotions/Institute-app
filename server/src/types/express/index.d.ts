// /src/types/express/index.d.ts
import { JwtPayload } from 'jsonwebtoken';
import { ReturnType } from 'utility-types'; // optional, or just inline typeof
import { getTenantPrisma } from '../../prisma-client/tenant-client';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      tenantPrisma?: ReturnType<typeof getTenantPrisma>;
      tenantInfo?: any;
    }
  }
}
