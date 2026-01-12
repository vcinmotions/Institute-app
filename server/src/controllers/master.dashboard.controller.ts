// src/controllers/dashboardController.ts
import { Request, Response } from "express";
// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { decrypt } from "../utils/encryption";

export async function getClientAdmin(req: Request, res: Response) {
  try {
    const centralPrisma = getCentralPrisma();

    const user = req.user;

    if (!user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // Get client admin for this user
    const clientAdmin = await centralPrisma.superAdmin.findUnique({
      where: { email },
    });

    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

   

    // Stats

    const tenant = await centralPrisma.tenant.findMany({});
    //const originalPassword = decrypt(tenant.encryptedPassword);

    // sanitize tenant objects (remove password)
    const safeTenants = tenant.map((t) => {
      // remove hashed password (never expose)
      const { password, ...rest } = t;

      // decrypt admin password
      let originalPassword = "";
      try {
        originalPassword = t.encryptedPassword
          ? decrypt(t.encryptedPassword)
          : "";
      } catch (err) {
        originalPassword = ""; // fallback if decrypt fails
      }

      return {
        ...rest,
        originalPassword, // 👈 SUPER ADMIN CAN SEE THIS
      };
    });

    console.log("GET ALL TENANTS IN MASTER USER CONTROLLER:", tenant);

    return res.status(200).json({ userdata: clientAdmin, tenant: safeTenants });
  } catch (err) {
    console.error("Error fetching follow-up stats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTenantAdmin(req: Request, res: Response) {
  try {
    const centralPrisma = getCentralPrisma();

    const user = req.user;

    if (!user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // Get client admin for this user
    const clientAdmin = await centralPrisma.superAdmin.findUnique({
      where: { email },
    });

    if (!clientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    // 2.1 ✅ Extract query params
    const {
      page,
      limit,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    console.log("GET MASTER TENANT PARAMS:", req.params);

     // ✅ Build search filter
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        // Add more searchable fields as needed
      ];
    }

    // Stats

    const tenant = await centralPrisma.tenant.findMany({where, skip, take: limitNum});
    //const originalPassword = decrypt(tenant.encryptedPassword);

    console.log("GET ALL TENANTS IN MASTER USER CONTROLLER:", tenant);

    const totalCount = await centralPrisma.tenant.count({where});
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({ tenant: tenant, totalCount, totalPages });
  } catch (err) {
    console.error("Error fetching follow-up stats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateMasterAdmin(req: Request, res: Response) {
  const { name, contact, position, country, state, city, zipCode } = req.body;

  console.log("MASTER UPDATE REQUEST BODY =>", req.body);

  try {
    const centralPrisma = getCentralPrisma();

    // Check user from JWT
    const user = req.user;
    if (!user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // Find SuperAdmin from DB
    const superAdmin = await centralPrisma.superAdmin.findUnique({
      where: { email },
    });

    if (!superAdmin) {
      return res.status(404).json({ error: "SuperAdmin not found" });
    }

    // Update fields
    const updatedAdmin = await centralPrisma.superAdmin.update({
      where: { email },
      data: {
        name: name ?? superAdmin.name,
        contact: contact ?? superAdmin.contact,
        position: position ?? superAdmin.position,
        country: country ?? superAdmin.country,
        state: state ?? superAdmin.state,
        city: city ?? superAdmin.city,
        zipCode: zipCode ?? superAdmin.zipCode,
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      updatedAdmin,
    });
  } catch (err) {
    console.error("❌ Error updating master admin:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
