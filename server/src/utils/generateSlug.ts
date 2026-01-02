// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import slugify from "slugify";
import crypto from "crypto";

export async function generateTenantSlug(instituteName: string) {
  // Convert name to slug
  let baseSlug = slugify(instituteName, {
    lower: true,
    strict: true,
  });

  while (true) {
    // Add 4-char random unique suffix
    const centralPrisma = getCentralPrisma();

    const unique = crypto.randomBytes(2).toString("hex");
    const finalSlug = `${baseSlug}-${unique}`;

    // Check if slug already exists
    const exists = await centralPrisma.tenant.findFirst({
      where: { slug: finalSlug },
    });

    if (!exists) return finalSlug;
  }
}
