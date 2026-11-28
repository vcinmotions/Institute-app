// src/utils/activityLogger.ts

import { getTenantPrisma } from "../prisma-client/tenant-client";
import { currentActor } from "./auditContext";

/**
 * Logs activity for any entity in the application.
 * @param clientAdminId  The tenant/institute ID.
 * @param entity         The model/entity name (e.g. "Student", "Fee", "Course").
 * @param entityId       The unique ID of the affected entity.
 * @param action         The performed action ("CREATE", "UPDATE", "DELETE").
 * @param message        Optional descriptive message.
 */
export async function logActivity({
  clientAdminId,
  entity,
  entityId,
  action,
  message,
  dbUrl, // 👈 Add this parameter
  module,
  actor,
}: {
  clientAdminId: string;
  entity: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "ACTIVATION";
  module?: string;
  actor?: { id?: string; name?: string; role?: string };
  message?: string;
  dbUrl: string; // 👈 Add this
}) {
  try {
    // const dbUrl = process.env.CLIENT_DATABASE_URL;

    // if (!dbUrl) {
    //     console.error("❌ CLIENT_DATABASE_URL missing in .env");
    //     process.exit(1);
    // }

    const tenantPrisma = getTenantPrisma(dbUrl);


    const ctx = currentActor();
    if (ctx) ctx.audited = true; // the audit middleware must not add a second, generic row for this request
    await tenantPrisma.activityLog.create({
      data: {
        clientAdminId,
        entity,
        entityId,
        action,
        message,
        module: module ?? null,
        actorId: actor?.id ?? ctx?.actorId ?? null,
        actorName: actor?.name ?? ctx?.actorName ?? null,
        actorRole: actor?.role ?? ctx?.actorRole ?? null,
        ip: ctx?.ip ?? null,
      },
    });
  } catch (err) {
    console.error("❌ Failed to log activity:", err);
  }
}
