import { Request, Response } from "express";

export async function upsertPaymentReceiptConfig(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    const { prefix, suffix, separator, numberLength } = req.body;
    const includeYear = req.body?.includeYear === true || req.body?.includeYear === "true";

    const len = Number(numberLength);
    if (!Number.isInteger(len) || len < 1 || len > 10) {
      return res.status(400).json({ error: "Number length must be a whole number from 1 to 10" });
    }

    const config = await prisma.paymentReceiptConfig.upsert({
      where: { clientAdminId: user.clientAdminId },

      update: {
        prefix,
        suffix,
        separator,
        numberLength: len,
        includeYear,
      },

      create: {
        clientAdminId: user.clientAdminId,
        prefix,
        suffix,
        separator,
        numberLength: len,
        includeYear,
        currentNumber: 1,
      },
    });

    return res.json({
      message: "Payment receipt config saved",
      config,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save payment receipt config" });
  }
}

export async function getPaymentReceiptConfig(req: any, res: any) {
  try {
    console.log("USER:", req.user);
    console.log("PRISMA:", !!req.tenantPrisma);

    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const config = await prisma.paymentReceiptConfig.findUnique({
      where: { clientAdminId: user.clientAdminId },
    });

    return res.json(config);
  } catch (err) {
    console.error("GET PAYMENT CONFIG ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
