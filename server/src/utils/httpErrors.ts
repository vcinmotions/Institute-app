/**
 * Maps expected business errors (thrown as plain Errors by services / domain
 * code) to proper HTTP status codes instead of a generic 500.
 * Database (Prisma) errors are never mapped, so their details do not leak.
 */
export function mapBusinessError(err: any): { status: number; message: string } | null {
  if (!err || typeof err.message !== "string") return null;
  if (String(err.name || "").startsWith("PrismaClient")) return null;
  const msg = err.message;
  if (/not found/i.test(msg)) return { status: 404, message: msg.replace(/!$/, "") };
  if (/^cannot |already|not allowed|invalid/i.test(msg)) return { status: 409, message: msg };
  return null;
}

/** Turns a ZodError into one readable sentence, e.g. "courseData.0.paymentType: Invalid option". */
export function formatZodError(err: any): string {
  const issues: any[] = err?.issues ?? err?.errors ?? [];
  if (!Array.isArray(issues) || issues.length === 0) return "Validation failed";
  const parts = issues.slice(0, 5).map((i) => {
    const path = Array.isArray(i.path) ? i.path.join(".") : "";
    return path ? `${path}: ${i.message}` : String(i.message);
  });
  return "Please check the form: " + parts.join("; ");
}
