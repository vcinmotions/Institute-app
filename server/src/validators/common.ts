/**
 * Central server-side field validation shared by enquiry, admission and edit flows
 * (the forms validate too, but the server never trusts the client).
 * Every function returns an error message, or null when the value is fine / empty (optional).
 */
export function validateMobile(value: unknown, label = "Mobile number"): string | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const digits = String(value).replace(/\D/g, "");
  const national = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (national.length !== 10) return `${label} must have 10 digits.`;
  // Indian mobile numbers always start with 6, 7, 8 or 9.
  if (!/^[6-9]\d{9}$/.test(national)) return `${label} must start with 6, 7, 8 or 9 (Indian mobile number).`;
  return null;
}

export function validateEmailAddress(value: unknown, label = "Email"): string | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const v = String(value).trim();
  if (v.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return `${label} is not a valid email address.`;
  return null;
}

/**
 * Reads the date formats the app sends: YYYY-MM-DD (optionally a full ISO timestamp), DD-MM-YYYY or DD/MM/YYYY.
 * new Date("25-07-2013") is Invalid and new Date("11-07-2013") is 7 November, so DD-MM-YYYY is parsed by hand.
 * Impossible dates (31-02) are rejected. Returns a UTC date or null.
 */
export function parseCalendarDate(value: unknown): Date | null {
  const s = String(value ?? "").trim();
  let y: number, m: number, d: number;
  let r = /^(\d{4})-(\d{2})-(\d{2})(T.*)?$/.exec(s);
  if (r) {
    if (r[4]) {
      const full = new Date(s); // timestamp: trust its own time zone
      return isNaN(full.getTime()) ? null : full;
    }
    [y, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  } else if ((r = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(s))) {
    [d, m, y] = [Number(r[1]), Number(r[2]), Number(r[3])];
  } else {
    return null;
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? dt : null;
}

/** Calendar-valid date, optionally not in the future and within a sane range. */
export function validateDate(value: unknown, label: string, opts: { notFuture?: boolean } = {}): string | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const d = parseCalendarDate(value);
  if (!d) return `${label} is not a valid date.`;
  const y = d.getUTCFullYear();
  if (y < 1900 || y > 2100) return `${label} is out of range.`;
  if (opts.notFuture && d.getTime() > Date.now() + 24 * 3600 * 1000) return `${label} cannot be in the future.`;
  return null;
}

/** Money: a number >= 0 (or > 0 when positive), at most 2 decimals. */
export function validateAmount(value: unknown, label = "Amount", opts: { positive?: boolean } = {}): string | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const s = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return `${label} must be a number with up to 2 decimals.`;
  if (opts.positive && Number(s) <= 0) return `${label} must be more than 0.`;
  return null;
}

/** Whole number in a range. */
export function validateInteger(value: unknown, label: string, min?: number, max?: number): string | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const s = String(value).trim();
  if (!/^\d+$/.test(s)) return `${label} must be a whole number.`;
  const n = Number(s);
  if (min !== undefined && n < min) return `${label} must be at least ${min}.`;
  if (max !== undefined && n > max) return `${label} cannot be more than ${max}.`;
  return null;
}

export function validatePassword(value: unknown, label = "Password"): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length < 6) return `${label} must be at least 6 characters.`;
  if (value.length > 64) return `${label} must be 64 characters or fewer.`;
  return null;
}

/** First error among the checks, or null. */
export function firstError(...errs: (string | null)[]): string | null {
  return errs.find((e) => !!e) ?? null;
}
