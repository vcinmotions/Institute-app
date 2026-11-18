// Usage: npx ts-node src/scripts/create-saas-admin.ts <email> <password> [name]
// Creates (or resets the password of) the SaaS Super Admin on the hosted portal.
import { loadEnv } from "../utils/envLoader";
loadEnv();

import bcrypt from "bcryptjs";
import { getCentralPrisma } from "../prisma-client/central-client";

async function main() {
  const [emailArg, password, name = "SaaS Admin"] = process.argv.slice(2);
  const email = (emailArg || "").trim().toLowerCase();
  if (!email || !password || password.length < 8) {
    console.error("Usage: create-saas-admin <email> <password (min 8)> [name]");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  const prisma = getCentralPrisma();
  await prisma.saasAdmin.upsert({
    where: { email },
    update: { password: hash, name },
    create: { email, password: hash, name },
  });
  console.log(`SaaS admin ready: ${email}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
