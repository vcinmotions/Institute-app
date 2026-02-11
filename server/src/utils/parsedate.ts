// Helper function
function parseDob(dob: string | undefined): Date | null {
  if (!dob) return null;

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
