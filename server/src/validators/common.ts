/**
 * Central server-side field validation shared by enquiry, admission and edit flows
 * (the forms validate too, but the server never trusts the client).
 * Every function returns an error message, or null when the value is fine / empty (optional).
 */
export function validateMobile(value: unknown, label = "Mobile number"): string | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const digits = String(value).replace(/\D/g, "");
  const national = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(national)) return `${label} must be a valid 10-digit number.`;
  return null;
}

export function validateEmailAddress(value: unknown, label = "Email"): string | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const v = String(value).trim();
  if (v.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return `${label} is not a valid email address.`;
  return null;
}

/** Calendar-valid date, optionally not in the future and within a sane range. */
export function validateDate(value: unknown, label: string, opts: { notFuture?: boolean } = {}): string | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return `${label} is not a valid date.`;
  const y = d.getUTCFullYear();
  if (y < 1900 || y > 2100) return `${label} is out of range.`;
  if (opts.notFuture && d.getTime() > Date.now() + 24 * 3600 * 1000) return `${label} cannot be in the future.`;
  return null;
}

/** First error among the checks, or null. */
export function firstError(...errs: (string | null)[]): string | null {
  return errs.find((e) => !!e) ?? null;
}
