// scripts/seed-labs-all-tenants.ts

import { getTenantPrisma } from "../prisma-client/tenant-client";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

/**
 * 🌐 Seed Labs + Time Slots WITHOUT Faculty Assignment
 */
async function seedLabsForTenant(
  dbUrl: string,
  tenantLabel: string = "Default Tenant"
) {
  const tenantPrisma = getTenantPrisma(dbUrl);

  console.log(`🚀 Seeding lab infrastructure for: ${tenantLabel}`);

  try {
    const clientAdmin = await tenantPrisma.clientAdmin.findFirst();
    if (!clientAdmin) {
      console.warn(`⚠️ No ClientAdmin found — seed admin first`);
      return;
    }

    const labs = [
      { name: "LAB-01", location: "Building A - Floor 1" },
      { name: "LAB-02", location: "Building A - Floor 2" },
      { name: "LAB-03", location: "Building B - Floor 1" },
      { name: "LAB-04", location: "Building B - Floor 2" },
      { name: "LAB-05", location: "Building C - Floor 1" },
    ];

    const timeSlots = [
      { startTime: "08:00", endTime: "09:00" },
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
      { startTime: "11:00", endTime: "12:00" },
      { startTime: "12:00", endTime: "13:00" },
      { startTime: "13:00", endTime: "14:00" },
      { startTime: "14:00", endTime: "15:00" },
      { startTime: "15:00", endTime: "16:00" },
    ];

    const totalPCs = 10;

    for (const labData of labs) {
      const lab = await tenantPrisma.lab.create({
        data: {
          ...labData,
          totalPCs,
          clientAdminId: clientAdmin.id,
        },
      });

      console.log(`✅ Created: ${lab.name}`);

      for (const slot of timeSlots) {
        await tenantPrisma.labTimeSlot.create({
          data: {
            ...slot,
            day: "Daily",
            labId: lab.id,
            availablePCs: totalPCs,
            clientAdminId: clientAdmin.id,
          },
        });
      }

      console.log(`🕘 Added ${timeSlots.length} TimeSlots ➝ ${lab.name}`);
    }

    console.log(`🎉 Lab + TimeSlot Seeding Completed for: ${tenantLabel}`);
  } catch (err: any) {
    console.error(`❌ Seeding Error for ${tenantLabel}:`, err.message);
  } finally {
    await tenantPrisma.$disconnect();
  }
}

async function seedAllTenants() {
  const dbUrl = process.env.Soki_CLIENT_DATABASE_URL;

  if (!dbUrl) {
    console.error("❌ CLIENT_DATABASE_URL missing in .env");
    process.exit(1);
  }

  await seedLabsForTenant(dbUrl);

  console.log("✅ All tenants seeded successfully");
  process.exit(0);
}

seedAllTenants();
