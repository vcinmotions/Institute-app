import { Request, Response } from "express";
import { backupFullSystem } from "../utils/backUp";
import { restoreBackup } from "../utils/restoreBackUp";

export async function backupController(req: Request, res: Response) {
  try {
    // ✅ USER FROM JWT (set by authMiddleware)
    const user = req.user as any;

    // 🔒 Only MASTER ADMIN allowed
    if (!user || user.role !== "MASTER_ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    console.log("📦 Backup requested by:", user.email);

    const filePath = await backupFullSystem();

    return res.status(200).json({
      success: true,
      filePath,
    });

  } catch (err) {
    console.error("❌ Backup failed:", err);
    return res.status(500).json({
      success: false,
      message: "Backup failed",
    });
  }
}

export async function restoreController(req: Request, res: Response) {
  try {
    // const user = req.user as any;

    // // 🔒 Only MASTER ADMIN allowed
    // if (!user || user.role !== "MASTER_ADMIN") {
    //   return res.status(403).json({ error: "Unauthorized" });
    // }

    const { filePath } = req.body;

    if (!filePath || !filePath.endsWith(".enc")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file",
      });
    }

    console.log("🔄 Restore requested");

    await restoreBackup(filePath);

    // ✅ give response first
    res.status(200).json({ success: true });

    // ⚠️ Important: kill server after restore
    setTimeout(() => {
      process.exit(0);
    }, 500);

  } catch (err) {
    console.error("❌ Restore failed:", err);
    return res.status(500).json({
      success: false,
      message: "Restore failed",
    });
  }
}