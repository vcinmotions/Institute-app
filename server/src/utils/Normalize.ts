// server/src/utils/normalize.ts

/**
 * Normalize to UPPERCASE + remove extra spaces
 * "  abc   def " → "ABC DEF"
 */
export function normalizeToUppercase(str: string = ""): string {
  return str.replace(/\s+/g, " ").trim().toUpperCase();
}

/**
 * Normalize to UPPERCASE + remove extra spaces
 * "  abc   def " → "ABC DEF"
 */
export function normalizeTrim(str: string = ""): string {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Convert string to Title Case
 * "  john   doe " → "John Doe"
 */
export function titleCase(str: string = ""): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // collapse multiple spaces
    .split(" ")
    .map((word) =>
      word ? word[0].toUpperCase() + word.slice(1) : ""
    )
    .join(" ");
}

/**
 * Normalize email
 * "  TEST@MAIL.COM " → "test@mail.com"
 */
export function normalizeEmail(
  email: string = ""
): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize to lowercase + remove extra spaces
 */
export function normalizeToLowercase(str: string = ""): string {
  return str.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Normalize phone number
 * Removes all non-digits and limits to 10 digits
 */
export function normalizePhone(phone: string = ""): string {
  return phone.replace(/\D/g, "").slice(0, 12);
}

/**
 * Normalize zip / numeric fields
 */
// utils/normalize.ts

/**
 * 1️⃣ Normalize Number (IDs, counts)
 * - Only digits
 * - No negative, no decimal
 * - Example: "-12a3" → "123"
 */
export function normalizeNumber(value: string = ""): string {
  return value.replace(/\D/g, "");
}

/**
 * 2️⃣ Normalize Positive Number (fees, amounts without decimal)
 * - Only digits
 * - No zero or negative (strictly > 0)
 * - Example: "000" → ""
 */
export function normalizePositiveNumber(value: string = ""): string {
  const cleaned = value.replace(/\D/g, "");
  return cleaned === "0" ? "" : cleaned.replace(/^0+/, ""); // remove leading zeros
}

/**
 * 3️⃣ Normalize Decimal Number (money fields)
 * - Only digits + ONE decimal
 * - No negative
 * - Example: "-12.3.4abc" → "12.3"
 */
export function normalizeDecimalNumber(value: string = ""): string {
  let cleaned = value.trim();

  cleaned = cleaned
    .replace(/[^0-9.]/g, "")        // allow digits + dot
    .replace(/(\..*?)\..*/g, "$1"); // only one decimal point

  // remove leading zeros (but keep "0." case)
  if (cleaned.startsWith("0") && !cleaned.startsWith("0.")) {
    cleaned = cleaned.replace(/^0+/, "");
  }

  return cleaned;
}

/**
 * Normalize date to ISO (safe for DB)
 */
export function normalizeDate(value: string = ""): string {
  if (!value) return "";

  const date = new Date(value);
  return isNaN(date.getTime()) ? "" : date.toISOString();
}

/**
 * Remove extra spaces (for address, names, etc.)
 */
export function collapseSpaces(value: string = ""): string {
  return value.replace(/\s+/g, " ").trim();
}