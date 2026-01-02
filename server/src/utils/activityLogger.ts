// src/utils/activityLogger.ts

import { getTenantPrisma } from "../prisma-client/tenant-client";

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
}: {
  clientAdminId: string;
  entity: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
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

    console.log(`🚀 Activity Log for: ${dbUrl}`);

    await tenantPrisma.activityLog.create({
      data: {
        clientAdminId,
        entity,
        entityId,
        action,
        message,
      },
    });
  } catch (err) {
    console.error("❌ Failed to log activity:", err);
  }
}
