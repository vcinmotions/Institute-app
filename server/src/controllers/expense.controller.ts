import { Request, Response } from "express";

const MODES = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE"];

function parseDay(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

function readBody(body: any) {
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Amount must be greater than 0" };
  const description = String(body?.description ?? "").trim();
  if (!description) return { error: "Description is required" };
  const mode = body?.paymentMode ? String(body.paymentMode).toUpperCase() : "CASH";
  if (!MODES.includes(mode)) return { error: `Payment mode must be one of ${MODES.join(", ")}` };
  const date = body?.date ? parseDay(body.date) : new Date();
  if (!date) return { error: "Date is invalid" };
  return { value: { amount, description: description.slice(0, 300), paymentMode: mode as any, date } };
}

// POST /expense
export async function createExpenseController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;
    if (!prisma || !user || typeof user === "string") return res.status(401).json({ error: "Unauthorized" });

    const parsed = readBody(req.body);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });

    const expense = await prisma.financialRecord.create({
      data: { ...parsed.value, recordType: "EXPENSE", clientAdminId: user.clientAdminId },
    });
    return res.status(201).json({ message: "Expense saved", expense });
  } catch (err) {
    console.error("createExpenseController:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /expense?page=&limit=&from=&to=
export async function getExpensesController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;
    if (!prisma || !user || typeof user === "string") return res.status(401).json({ error: "Unauthorized" });

    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));
    const from = parseDay(req.query.from);
    const to = parseDay(req.query.to);
    if (to) to.setHours(23, 59, 59, 999);

    const where: any = { clientAdminId: user.clientAdminId, recordType: "EXPENSE" };
    if (from || to) where.date = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };

    const [data, total, sum] = await Promise.all([
      prisma.financialRecord.findMany({ where, orderBy: { date: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.financialRecord.count({ where }),
      prisma.financialRecord.aggregate({ where, _sum: { amount: true } }),
    ]);

    return res.json({
      message: "Expenses fetched",
      data,
      total,
      totalAmount: sum._sum.amount ?? 0,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getExpensesController:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /expense/:id
export async function updateExpenseController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;
    if (!prisma || !user || typeof user === "string") return res.status(401).json({ error: "Unauthorized" });

    const id = String(req.params.id);
    const existing = await prisma.financialRecord.findFirst({
      where: { id, clientAdminId: user.clientAdminId, recordType: "EXPENSE" },
    });
    if (!existing) return res.status(404).json({ error: "Expense not found" });

    const parsed = readBody(req.body);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });

    const expense = await prisma.financialRecord.update({ where: { id }, data: parsed.value });
    return res.json({ message: "Expense updated", expense });
  } catch (err) {
    console.error("updateExpenseController:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /expense/:id
export async function deleteExpenseController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;
    if (!prisma || !user || typeof user === "string") return res.status(401).json({ error: "Unauthorized" });

    const id = String(req.params.id);
    const existing = await prisma.financialRecord.findFirst({
      where: { id, clientAdminId: user.clientAdminId, recordType: "EXPENSE" },
    });
    if (!existing) return res.status(404).json({ error: "Expense not found" });

    await prisma.financialRecord.delete({ where: { id } });
    return res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("deleteExpenseController:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
