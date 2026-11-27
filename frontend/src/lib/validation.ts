/**
 * Field validation shared by every form. The rules are the SAME as the server's
 * (server/src/validators/common.ts), so a value the form accepts is never rejected after saving,
 * and the user sees the problem next to the field instead of a generic error banner.
 *
 * Every function returns an error message, or "" when the value is fine.
 * Optional fields: an empty value is fine unless `required` is set.
 */

const empty = (v: unknown) => v === undefined || v === null || String(v).trim() === "";

/** Digits of an Indian mobile number without the country code ("+91 98765 43210" -> "9876543210"). */
export function mobileDigits(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

/** Indian mobile number: 10 digits starting with 6, 7, 8 or 9. */
export function mobileError(value: unknown, label = "Mobile number", required = false): string {
  if (empty(value)) return required ? `${label} is required.` : "";
  const n = mobileDigits(value);
  if (n.length !== 10) return `${label} must have 10 digits.`;
  if (!/^[6-9]/.test(n)) return `${label} must start with 6, 7, 8 or 9.`;
  return "";
}

export function emailError(value: unknown, label = "Email", required = false): string {
  if (empty(value)) return required ? `${label} is required.` : "";
  const v = String(value).trim();
  if (v.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return `${label} is not a valid email address.`;
  return "";
}

/** Sign-in username of staff / faculty ("name@institute-code"; no ".com" needed). Same rule as the sign-in screen. */
export function loginIdError(value: unknown, label = "Username", required = true): string {
  if (empty(value)) return required ? `${label} is required.` : "";
  const v = String(value).trim();
  if (v.length > 120 || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/.test(v)) return `${label} must look like name@institute (letters, digits, . _ - only).`;
  return "";
}

/**
 * Staff username built from a name and the institute's short login code: "Google Ltd" -> "googleltd@2026".
 * Falls back to the older long institute slug if the code is not known yet. null = cannot build one.
 */
export function staffLoginId(name: string, user: { loginCode?: string | null; slug?: string | null } | null | undefined): string | null {
  const suffix = String(user?.loginCode || user?.slug || "").trim().toLowerCase().replace(/\s+/g, "");
  if (!suffix) return null;
  const local = String(name ?? "").toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${local}@${suffix}`;
}

export function requiredError(value: unknown, label: string): string {
  if (Array.isArray(value)) return value.length ? "" : `Select at least one ${label.toLowerCase()}.`;
  return empty(value) ? `${label} is required.` : "";
}

/** A person's name: letters, spaces and . ' - only, 2-100 characters. */
export function personNameError(value: unknown, label = "Name", required = true): string {
  if (empty(value)) return required ? `${label} is required.` : "";
  const v = String(value).trim();
  if (v.length < 2) return `${label} is too short.`;
  if (v.length > 100) return `${label} must be 100 characters or fewer.`;
  if (!/^[\p{L}][\p{L} .'-]*$/u.test(v)) return `${label} can contain letters, spaces, dot, apostrophe and hyphen only.`;
  return "";
}

/** Free text with a length limit (names of courses, labs, batches, remarks...). */
export function textError(value: unknown, label: string, opts: { required?: boolean; max?: number; min?: number } = {}): string {
  if (empty(value)) return opts.required ? `${label} is required.` : "";
  const v = String(value).trim();
  if (opts.min && v.length < opts.min) return `${label} must be at least ${opts.min} characters.`;
  if (v.length > (opts.max ?? 200)) return `${label} must be ${opts.max ?? 200} characters or fewer.`;
  return "";
}

/** Money: a number >= 0 (or > 0 when `positive`), at most 2 decimals. */
export function amountError(value: unknown, label = "Amount", opts: { required?: boolean; positive?: boolean; max?: number } = {}): string {
  if (empty(value)) return opts.required ? `${label} is required.` : "";
  const s = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return `${label} must be a number with up to 2 decimals.`;
  const n = Number(s);
  if (opts.positive && n <= 0) return `${label} must be more than 0.`;
  if (opts.max !== undefined && n > opts.max) return `${label} cannot be more than ${opts.max}.`;
  return "";
}

/** Whole number in a range (durations, seats, PCs, marks...). */
export function integerError(value: unknown, label: string, opts: { required?: boolean; min?: number; max?: number } = {}): string {
  if (empty(value)) return opts.required ? `${label} is required.` : "";
  const s = String(value).trim();
  if (!/^\d+$/.test(s)) return `${label} must be a whole number.`;
  const n = Number(s);
  if (opts.min !== undefined && n < opts.min) return `${label} must be at least ${opts.min}.`;
  if (opts.max !== undefined && n > opts.max) return `${label} cannot be more than ${opts.max}.`;
  return "";
}

/** Parses "YYYY-MM-DD" or "DD-MM-YYYY" / "DD/MM/YYYY" into a real calendar date (no 31-Feb). */
export function parseDate(value: unknown): Date | null {
  const s = String(value ?? "").trim();
  let y: number, m: number, d: number;
  let r = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (r) [y, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(s))) [d, m, y] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else return null;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? dt : null;
}

export function dateError(
  value: unknown,
  label: string,
  opts: { required?: boolean; notFuture?: boolean; notPast?: boolean; minAgeYears?: number } = {}
): string {
  if (empty(value)) return opts.required ? `${label} is required.` : "";
  const d = parseDate(value);
  if (!d) return `${label} is not a valid date.`;
  if (d.getFullYear() < 1900 || d.getFullYear() > 2100) return `${label} is out of range.`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (opts.notFuture && d > today) return `${label} cannot be in the future.`;
  if (opts.notPast && d < today) return `${label} cannot be in the past.`;
  if (opts.minAgeYears) {
    const limit = new Date(today);
    limit.setFullYear(limit.getFullYear() - opts.minAgeYears);
    if (d > limit) return `${label}: age must be at least ${opts.minAgeYears} years.`;
  }
  return "";
}

/** "End must be after start" for two dates. */
export function dateOrderError(start: unknown, end: unknown, label = "End date", startLabel = "start date"): string {
  const a = parseDate(start);
  const b = parseDate(end);
  return a && b && b < a ? `${label} cannot be before the ${startLabel}.` : "";
}

export function passwordError(value: unknown, label = "Password", required = true): string {
  if (empty(value)) return required ? `${label} is required.` : "";
  const v = String(value);
  if (v.length < 6) return `${label} must be at least 6 characters.`;
  if (v.length > 64) return `${label} must be 64 characters or fewer.`;
  return "";
}

export function pinCodeError(value: unknown, label = "PIN code", required = false): string {
  if (empty(value)) return required ? `${label} is required.` : "";
  return /^[1-9]\d{5}$/.test(String(value).trim()) ? "" : `${label} must be 6 digits.`;
}

/** Keeps only the errors that are set: { name: "", contact: "x" } -> { contact: "x" }. */
export function onlyErrors<T extends Record<string, string>>(errs: T): Partial<T> {
  return Object.fromEntries(Object.entries(errs).filter(([, v]) => !!v)) as Partial<T>;
}
