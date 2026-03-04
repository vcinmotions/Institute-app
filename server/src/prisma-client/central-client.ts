// import { PrismaClient } from "../../prisma-client/generated/central";

// export const centralPrisma = new PrismaClient();

// backend/src/prisma-client/central-client.ts
// import { PrismaClient } from "../../prisma-client/generated/central";
// import dotenv from "dotenv";

// dotenv.config(); // load .env

// let centralPrisma: PrismaClient;

// export function getCentralPrisma(url?: string) {
//   if (!centralPrisma) {
//     const dbUrl = url || process.env.CENTRAL_DATABASE_URL;
//     if (!dbUrl) throw new Error("CENTRAL_DATABASE_URL is not set");

//     centralPrisma = new PrismaClient({
//       datasources: {
//         db: {
//           url: dbUrl,
//         },
//       },
//     });
//   }

//   return centralPrisma;
// }

import { PrismaClient } from "../../prisma-client/generated/central";
import { getCentralDbUrl, loadEnv } from "../utils/envLoader";

// let centralPrisma: PrismaClient | null = null;

// export function getCentralPrisma(url?: string): PrismaClient {
//   if (!centralPrisma) {
//     // Ensure env is loaded
//     loadEnv();

//     const dbUrl = url || getCentralDbUrl();
//     if (!dbUrl) throw new Error("CENTRAL_DATABASE_URL is not set");

//     centralPrisma = new PrismaClient({
//       datasources: {
//         db: { url: dbUrl },
//       },
//     });
//   }

//   return centralPrisma;
// }

let centralPrisma: PrismaClient | null = null;
let currentUrl: string | null = null;

export function getCentralPrisma(url?: string): PrismaClient {
  loadEnv();

  const dbUrl = url || getCentralDbUrl();
  if (!dbUrl) throw new Error("CENTRAL_DATABASE_URL is not set");

  console.log("DbURL IN CENTRAL_CLIENT:", dbUrl);
  if (!centralPrisma || currentUrl !== dbUrl) {
    centralPrisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });
    currentUrl = dbUrl;
  }

  return centralPrisma;
}