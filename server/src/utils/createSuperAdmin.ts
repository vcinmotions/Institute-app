// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: "./prisma/central/.env" });

const centralPrisma = getCentralPrisma();

async function createSuperAdmin() {
  const name = "Master Admin";
  const email = "admin@master.com";
  const password = "master123";
  const role = "MASTER_ADMIN";
  const contact = "9819234567";
  const position = "Super Admin";
  const state = "Maharashtra";
  const country = "India";
  const city = "Mumbai";
  const zipCode = "400024";

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create SuperAdmin in DB
    const admin = await centralPrisma.superAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        contact,
        position,
        country,
        state,
        city,
        zipCode,
        role,
      },
    });

    console.log("✅ SuperAdmin created:", admin);
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ SuperAdmin with this email already exists.");
    } else {
      console.error("❌ Error creating SuperAdmin:", error);
    }
  } finally {
    await centralPrisma.$disconnect();
  }
}

createSuperAdmin();
