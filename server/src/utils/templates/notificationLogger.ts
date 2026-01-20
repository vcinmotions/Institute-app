// src/utils/notoficationLogger.ts

import { getTenantPrisma } from "../../prisma-client/tenant-client";

/**
 * Logs activity for any entity in the application.
 * @param clientAdminId  The tenant/institute ID.
 * @param entity         The model/entity name (e.g. "Student", "Fee", "Course").
 * @param entityId       The unique ID of the affected entity.
 * @param action         The performed action ("CREATE", "UPDATE", "DELETE").
 * @param message        Optional descriptive message.
 */
export async function logNotification({
  clientAdminId,
  enquiryId,
  followUpId,
  paymentId,
  message,
  dbUrl, // 👈 Add this parameter
}: {
  clientAdminId: string;
  enquiryId?: string;
  followUpId?: string;
  paymentId?: number;
  message: string;
  dbUrl: string; // 👈 Add this
}) {
  try {
    const tenantPrisma = getTenantPrisma(dbUrl);

    console.log(`🚀 Notification Log for: ${dbUrl}`);

    await tenantPrisma.notification.create({
      data: {
        clientAdminId,
        enquiryId,
        followUpId,
        paymentId,
        message,
      },
    });
  } catch (err) {
    console.error("❌ Failed to log Notification:", err);
  }
}
