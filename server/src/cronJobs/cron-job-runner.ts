// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { getTenantPrisma } from "../prisma-client/tenant-client";
import { processDueFollowUps } from "./followUp";
import { processDuePayments } from "./payment";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export async function runAllTenantFollowUps() {
  //const dbUrl = process.env.CLIENT_DATABASE_URL;
  const centralPrisma = getCentralPrisma();

  //const tenantPrisma = getTenantPrisma(dbUrl);
  const getTenant = await centralPrisma.tenant.findMany();
  console.log("Get All Tenant from Master Admin:", getTenant);

  if (!getTenant) {
    return new Error("getTenant Database URL not configured");
  }

  // try {
  //   console.log(`Processing follow-ups for tenant: with ${dbUrl}`);

  //   const tenantPrisma = getTenantPrisma(dbUrl); // ✅ safe
  //   await processDueFollowUps(dbUrl);
  //   await processDuePayments(dbUrl);
  // } catch (err) {
  //   console.error(`❌ Error processing follow-ups for tenant ${dbUrl}:`, err);
  // }

  for (const tenant of getTenant) {
    try {
      console.log(
        `Processing follow-ups for tenant: ${tenant.name} with ${tenant.dbUrl}`
      );

      const tenantPrisma = getTenantPrisma(tenant.dbUrl); // ✅ safe
      await processDueFollowUps(tenant.dbUrl);
      await processDuePayments(tenant.dbUrl);
    } catch (err) {
      console.error(
        `❌ Error processing follow-ups for tenant ${tenant.name}:`,
        err
      );
    }
  }
}

// runAllTenantFollowUps().then(() => {
//   console.log("✅ Follow-up processing complete.");
//   process.exit(0);
// });
