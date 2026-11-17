import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../../prisma-client/generated/central";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { getCentralDbUrl } from "../utils/envLoader";



export type SetupState = "NOT_STARTED" | "BASIC_DONE" | "FULL_DONE";

/** Reads how far first-time setup has progressed (central DB / super admin). */
export async function readSetupState(): Promise<SetupState> {
  const isProd = process.env.APP_ENV === "prod";
  let prisma: PrismaClient;

  if (isProd) {
    const dbPath = path.join(getUserDataPath(), "data", "central.db");
    if (!fs.existsSync(dbPath)) return "NOT_STARTED";
    prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });
  } else {
    const dbUrl = getCentralDbUrl();
    if (!dbUrl) return "NOT_STARTED";
    prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  }

  try {
    const admin = await prisma.superAdmin.findFirst();
    if (!admin) return "NOT_STARTED";
    if (admin.basicComplete && admin.addressComplete) return "FULL_DONE";
    if (admin.basicComplete) return "BASIC_DONE";
    return "NOT_STARTED";
  } catch {
    return "NOT_STARTED"; // database or tables do not exist yet
  } finally {
    await prisma.$disconnect();
  }
}

export async function setupStatusController(req: Request, res: Response) {
  try {
    return res.json({ setupComplete: await readSetupState() });
  } catch (err) {
    console.error("Setup status error:", err);
    return res.status(500).json({ error: "Failed to read setup status" });
  }
}
