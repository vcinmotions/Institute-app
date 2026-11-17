//helpers/date.ts
export function parseDate(dob: string | undefined): Date | null {
  if (!dob) return null;

  // Also accept ISO dates (YYYY-MM-DD or a full ISO timestamp)
  if (/^\d{4}-\d{2}-\d{2}/.test(dob)) {
    const iso = new Date(dob);
    return isNaN(iso.getTime()) ? null : iso;
  }

  // Split DD-MM-YYYY
  const parts = dob.split("-");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);

  // Check numbers are valid
  if (
    !day || day < 1 || day > 31 ||
    !month || month < 1 || month > 12 ||
    !year || year < 1900
  ) return null;

  // Create a valid ISO string
  return new Date(`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`);
}

export function parseDateISO(dob: string | undefined): Date | null {
  if (!dob) return null;

  const date = new Date(dob);
  if (isNaN(date.getTime())) return null;

  return date;
}
