export const USER_TIERS = [1, 2, 5, 10, 20, 30] as const;

export const DEFAULT_TIER_MULTIPLIERS: Record<string, number> = {
  "1": 1, "2": 1.8, "5": 4, "10": 7, "20": 12, "30": 16,
};

export const tierLabel = (n: number) => `${n} User${n === 1 ? "" : "s"}`;

export type Plan = {
  code: string;
  name: string;
  months: number;
  price: number;
  currency: string;
  tierPrices?: Record<string, number>;
};

// Explicit price for this login count if the admin set one, else plan price x multiplier.
export const planPrice = (p: Plan, users: number, mult: Record<string, number>) => {
  const explicit = Number(p.tierPrices?.[String(users)]);
  if (users !== 1 && explicit > 0) return Math.round(explicit * 100) / 100;
  return Math.round(p.price * (mult[String(users)] ?? 1) * 100) / 100;
};
