import { Request, Response } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";
import { USER_TIERS, DEFAULT_TIER_MULTIPLIERS } from "../utils/userTiers";

// Explicit price per plan and login count, set by the SaaS admin:
// { SIX_MONTH: { "2": 1400, "5": 3000 }, ONE_YEAR: { ... } }. Stored as an app setting.
const TIER_PRICES_KEY = "planTierPrices";
export type TierPrices = Record<string, Record<string, number>>;

export async function readTierPrices(): Promise<TierPrices> {
  const row = await getCentralPrisma().appSetting.findUnique({ where: { key: TIER_PRICES_KEY } });
  if (!row) return {};
  try {
    return JSON.parse(row.value) ?? {};
  } catch {
    return {};
  }
}

/** Price for a plan at a login count: the explicit price if set, else plan price x multiplier. */
export function resolvePlanPrice(
  plan: { code: string; price: number },
  tierPrices: TierPrices,
  multipliers: Record<string, number> | undefined,
  maxUsers: number
): number {
  const explicit = Number(tierPrices[plan.code]?.[String(maxUsers)]);
  if (maxUsers !== 1 && explicit > 0) return Math.round(explicit * 100) / 100;
  const mult = multipliers?.[String(maxUsers)] ?? DEFAULT_TIER_MULTIPLIERS[String(maxUsers)] ?? 1;
  return Math.round(plan.price * mult * 100) / 100;
}

async function withTierPrices<T extends { code: string }>(plans: T[]) {
  const tp = await readTierPrices();
  return plans.map((p) => ({ ...p, tierPrices: tp[p.code] ?? {} }));
}

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
    res.json(await withTierPrices(plans.filter((p) => p.active)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load plans" });
  }
}

// Master admin only: all plans, including inactive.
export async function listPlansAdmin(_req: Request, res: Response) {
  try {
    res.json(await withTierPrices(await ensurePlans()));
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
    let tp = await readTierPrices();
    if (req.body?.tierPrices && typeof req.body.tierPrices === "object") {
      const next: Record<string, number> = {};
      for (const t of USER_TIERS) {
        if (t === 1) continue; // the 1-login price is the plan price itself
        const raw = req.body.tierPrices[String(t)];
        if (raw === "" || raw === null || raw === undefined) continue; // blank = automatic
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0 || n > 10000000) {
          return res.status(400).json({ error: `Price for ${t} logins must be a number greater than 0 (or leave it blank)` });
        }
        next[String(t)] = n;
      }
      tp = { ...tp, [code]: next };
      const value = JSON.stringify(tp);
      await getCentralPrisma().appSetting.upsert({
        where: { key: TIER_PRICES_KEY }, update: { value }, create: { key: TIER_PRICES_KEY, value },
      });
    }
    res.json({ ...plan, tierPrices: tp[code] ?? {} });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update plan" });
  }
}
