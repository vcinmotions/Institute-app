export const USER_TIERS = [1, 2, 5, 10, 20, 30] as const;

export const DEFAULT_TIER_MULTIPLIERS: Record<string, number> = {
  "1": 1, "2": 1.8, "5": 4, "10": 7, "20": 12, "30": 16,
};

export const tierLabel = (n: number) => `${n} User${n === 1 ? "" : "s"}`;
