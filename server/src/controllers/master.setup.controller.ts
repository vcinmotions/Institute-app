// controllers/tMaster.setup.controller.ts
import { Request, Response } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";
import { readSetupState } from "./setup-status.controller";

export async function createMasterAddressController(req: Request, res: Response) {
  const {
    email,
    country,
    state,
    city,
    zipCode,
    fullAddress,
  } = req.body;

  if ((await readSetupState()) !== "BASIC_DONE") {
    return res.status(403).json({ error: "Address step is not available" });
  }

  if (!country || !state || !city || !zipCode || !fullAddress) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const centralPrisma = getCentralPrisma();

    // Update the SuperAdmin with address info and set addressComplete = true
    const updatedAdmin = await centralPrisma.superAdmin.update({
      where: { email },
      data: {
        country,
        state,
        city,
        zipCode,
        fullAddress,
        addressComplete: true, // 🔑 mark Step-2 done
      },
    });

    await centralPrisma.$disconnect();

    return res.status(200).json({
      message: "Master Admin address updated successfully.",
      admin: updatedAdmin,
    });
  } catch (err: any) {
    console.error("❌ Error updating Master Admin:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
