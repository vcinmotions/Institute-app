import { Request, Response } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";

const DEFAULTS = [
  { code: "SIX_MONTH", name: "6 Months", months: 6, price: 0 },
  { code: "ONE_YEAR", name: "1 Year", months: 12, price: 0 },
];

async function ensurePlans() {
  const prisma = getCentralPrisma();
  for (const d of DEFAULTS) {
    await prisma.subscriptionPlan.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
  }
  return prisma.subscriptionPlan.findMany({ orderBy: { months: "asc" } });
}

// Public: the website landing page shows these prices.
export async function listPlans(_req: Request, res: Response) {
  try {
    const plans = await ensurePlans();
    res.json(plans.filter((p) => p.active));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load plans" });
  }
}

// Master admin only: all plans, including inactive.
export async function listPlansAdmin(_req: Request, res: Response) {
  try {
    res.json(await ensurePlans());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load plans" });
  }
}

// Master admin only: set price / active flag.
export async function updatePlan(req: Request, res: Response) {
  const code = String(req.params.code);
  const price = Number(req.body?.price);
  const active = req.body?.active;

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: "Price must be a number of 0 or more" });
  }
  if (!DEFAULTS.some((d) => d.code === code)) {
    return res.status(404).json({ error: "Unknown plan" });
  }

  try {
    await ensurePlans();
    const plan = await getCentralPrisma().subscriptionPlan.update({
      where: { code },
      data: { price, ...(typeof active === "boolean" ? { active } : {}) },
    });
    res.json(plan);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update plan" });
  }
}
