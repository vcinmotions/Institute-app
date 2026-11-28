/** Allowed "maximum simultaneous logins" choices and their default price multipliers. */
export const USER_TIERS = [1, 2, 5, 10, 20, 30] as const;

export const DEFAULT_TIER_MULTIPLIERS: Record<string, number> = {
  "1": 1,
  "2": 1.8,
  "5": 4,
  "10": 7,
  "20": 12,
  "30": 16,
};

export function parseMaxUsers(v: unknown, fallback = 1): number {
  const n = Number(v);
  return (USER_TIERS as readonly number[]).includes(n) ? n : fallback;
}
