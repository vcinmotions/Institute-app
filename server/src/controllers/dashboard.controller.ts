// src/controllers/dashboardController.ts
import { Request, Response } from "express";
// import { centralPrisma } from "../prisma-client/central-client";

import { getCentralPrisma } from "../prisma-client/central-client";
import { ensureLoginCode } from "../utils/tenantDbUrl";

export async function getClientAdmin(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const tenantInfo = req.tenantInfo;
    const user = req.user;
    console.log("GET user IN USER GET CONTROLLER:", user);
    console.log("GET tenantInfo IN USER GET CONTROLLER:", tenantInfo);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    console.log("GET USER DATA IN USER GET CONTROLLER:", user);

    const email = user.email;

    let clientAdminData: any = null;

    // 🧩 1️⃣ Check based on userType
    if (user.userType === "ADMIN") {
      clientAdminData = await tenantPrisma.clientAdmin.findUnique({
        where: { email },
        include: {
          financialYears: true
        }
      });
    } else if (user.userType === "ROLE_USER") {
      const roleUser = await tenantPrisma.roleUser.findUnique({
        where: { email },
        include: { clientAdmin: true },
      });
      clientAdminData = roleUser;
    } else if (user.userType === "FACULTY") {
      const faculty = await tenantPrisma.faculty.findUnique({
        where: { email },
        include: { clientAdmin: true },
      });
      clientAdminData = faculty;
    }

    if (!clientAdminData) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    // Stats

    console.log(
      "✨ ✨ ✨  ✨✨ ✨ ✨ ✨ ✨ ✨✨✨✨✨✨✨✨✨GET USER DATA:>>>>>>>>>>>>>>>>>>>>",
      clientAdminData
    );

    // Institute login code: the forms build staff usernames as name@code (e.g. google@2026).
    const loginCode = user.tenantId ? await ensureLoginCode(String(user.tenantId)).catch(() => null) : null;

    return res.status(200).json({ userdata: { ...clientAdminData, loginCode } });
  } catch (err) {
    console.error("Error fetching follow-up stats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateClientAdmin(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { name, email, contact, position } = req.body;

    console.log("get update c.ient prosilfe:", req.body);

    if (!name || !email || !contact || !position) {
      return res.status(400).json({
        error: "Missing fields: name, email, contact, position",
      });
    }

    let updatedUser: any = null;

    // BASE WHERE CLAUSE
    const where = { id: user.id };

    // 1️⃣ ADMIN → ClientAdmin table
    if (user.userType === "ADMIN") {
      updatedUser = await tenantPrisma.clientAdmin.update({
        where,
        data: { name, email, contact, position },
      });
    }

    // 2️⃣ ROLE_USER → RoleUser table
    else if (user.userType === "ROLE_USER") {
      updatedUser = await tenantPrisma.roleUser.update({
        where,
        data: { name, email },
        include: { clientAdmin: true },
      });
    }

    // 3️⃣ FACULTY → Faculty table
    else if (user.userType === "FACULTY") {
      updatedUser = await tenantPrisma.faculty.update({
        where,
        data: {
          name,
          email,
          contact: contact, // faculty uses contact
        },
        include: { clientAdmin: true },
      });

      // add uniform key for frontend
      updatedUser.contact = updatedUser.contact;
    }

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found for update" });
    }

    const centralPrisma = getCentralPrisma();

    await centralPrisma.tenant.update({
      where: {
        email: user.email,
      },
      data: { name, email, contact, position },
    });

    console.log("GeT UPDATED CLient Profile DATA:", updatedUser);
    return res.status(200).json({
      message: "Profile updated successfully",
      userdata: updatedUser,
    });
  } catch (err) {
    console.error("Error updating client admin:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Resolve the owning clientAdmin id for any user type (admin, role user, faculty)
async function resolveClientAdminId(tenantPrisma: any, user: any): Promise<string | null> {
  const email = user.email;
  if (user.userType === "ROLE_USER") {
    const ru = await tenantPrisma.roleUser.findUnique({ where: { email }, select: { clientAdminId: true } });
    return ru?.clientAdminId ?? null;
  }
  if (user.userType === "FACULTY") {
    const f = await tenantPrisma.faculty.findUnique({ where: { email }, select: { clientAdminId: true } });
    return f?.clientAdminId ?? null;
  }
  const ca = await tenantPrisma.clientAdmin.findUnique({ where: { email }, select: { id: true } });
  return ca?.id ?? null;
}

export async function getFollowUpStats(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = await resolveClientAdminId(tenantPrisma, user);

    if (!clientAdminId) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    // Stats
    const [pendingCount, missedCount, completedCount, totalCount] =
      await Promise.all([
        tenantPrisma.followUp.count({
          where: {
            followUpStatus: "PENDING",
            enquiry: { clientAdminId: clientAdminId },
          },
        }),
        tenantPrisma.followUp.count({
          where: {
            followUpStatus: "MISSED",
            enquiry: { clientAdminId: clientAdminId },
          },
        }),
        tenantPrisma.followUp.count({
          where: {
            followUpStatus: "COMPLETED",
            enquiry: { clientAdminId: clientAdminId },
          },
        }),
        tenantPrisma.followUp.count({
          where: {
            enquiry: { clientAdminId: clientAdminId },
          },
        }),
      ]);

    const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
      where: { id: clientAdminId },
    });

    return res.status(200).json({
      clientAdmin,
      stats: {
        pending: pendingCount,
        missed: missedCount,
        completed: completedCount,
        total: totalCount,
      },
    });
  } catch (err) {
    console.error("Error fetching follow-up stats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPendingFollowUps(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = await resolveClientAdminId(tenantPrisma, user);

    if (!clientAdminId) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    const followUps = await tenantPrisma.followUp.findMany({
      where: {
        followUpStatus: "PENDING",
        enquiry: { clientAdminId: clientAdminId },
      },
      include: {
        enquiry: true,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return res.status(200).json({ followUps });
  } catch (err) {
    console.error("Error fetching pending follow-ups:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMissedFollowUps(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = await resolveClientAdminId(tenantPrisma, user);

    if (!clientAdminId) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    const followUps = await tenantPrisma.followUp.findMany({
      where: {
        followUpStatus: "MISSED",
        enquiry: { clientAdminId: clientAdminId },
      },
      include: {
        enquiry: true,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return res.status(200).json({ followUps });
  } catch (err) {
    console.error("Error fetching missed follow-ups:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
