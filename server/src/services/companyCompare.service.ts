import { PrismaClient } from "../../prisma-client/generated/tenant";

/**
 * Cross-company report comparison. All companies live in one institute database, so each
 * metric is computed per company with the same filters the single-company reports use
 * (clientAdminId + date range on createdAt/paymentDate, outstanding = PENDING dues).
 */
export type CompareReportType =
  | "STUDENTS"
  | "ADMISSIONS"
  | "STATUS"
  | "FEES"
  | "OUTSTANDING"
  | "ATTENDANCE"
  | "EXAMS";

export type Column = { key: string; label: string; kind: "number" | "money" | "percent" };

export const REPORTS: Record<
  CompareReportType,
  { label: string; columns: Column[]; primary: string; moneyOnly?: boolean }
> = {
  STUDENTS: {
    label: "Total students",
    primary: "totalStudents",
    columns: [
      { key: "totalStudents", label: "Total students", kind: "number" },
      { key: "newStudents", label: "New in period", kind: "number" },
    ],
  },
  ADMISSIONS: {
    label: "Admissions",
    primary: "admissions",
    columns: [{ key: "admissions", label: "Admissions", kind: "number" }],
  },
  STATUS: {
    label: "Active / inactive students",
    primary: "activeStudents",
    columns: [
      { key: "totalStudents", label: "Total students", kind: "number" },
      { key: "activeStudents", label: "Active", kind: "number" },
      { key: "inactiveStudents", label: "Inactive", kind: "number" },
      { key: "activePercent", label: "Active %", kind: "percent" },
    ],
  },
  FEES: {
    label: "Fee collection",
    primary: "feesCollected",
    moneyOnly: true,
    columns: [
      { key: "feesCollected", label: "Fees collected", kind: "money" },
      { key: "receipts", label: "Receipts", kind: "number" },
    ],
  },
  OUTSTANDING: {
    label: "Outstanding fees",
    primary: "outstandingAmount",
    moneyOnly: true,
    columns: [
      { key: "outstandingAmount", label: "Outstanding", kind: "money" },
      { key: "pendingInvoices", label: "Pending invoices", kind: "number" },
      { key: "studentsWithDues", label: "Students with dues", kind: "number" },
    ],
  },
  ATTENDANCE: {
    label: "Attendance",
    primary: "attendancePercent",
    columns: [
      { key: "records", label: "Records", kind: "number" },
      { key: "present", label: "Present", kind: "number" },
      { key: "absent", label: "Absent", kind: "number" },
      { key: "attendancePercent", label: "Attendance %", kind: "percent" },
    ],
  },
  EXAMS: {
    label: "Examination results",
    primary: "averagePercent",
    columns: [
      { key: "testsTaken", label: "Tests taken", kind: "number" },
      { key: "studentsAssessed", label: "Students assessed", kind: "number" },
      { key: "averagePercent", label: "Average score %", kind: "percent" },
    ],
  },
};

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

export function parseRange(from?: string, to?: string): { start?: Date; end?: Date } {
  const start = from ? new Date(from) : undefined;
  const end = to ? new Date(to) : undefined;
  if (start && isNaN(+start)) throw new Error("Invalid start date");
  if (end && isNaN(+end)) throw new Error("Invalid end date");
  if (end) end.setUTCHours(23, 59, 59, 999); // include the whole last day
  return { start, end };
}

const between = (start?: Date, end?: Date) =>
  start || end ? { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) } : undefined;

/** Metrics of one company for the chosen report. */
export async function companyMetrics(
  db: PrismaClient,
  clientAdminId: string,
  report: CompareReportType,
  start?: Date,
  end?: Date
): Promise<{ values: Record<string, number>; monthly?: Record<string, number> }> {
  const range = between(start, end);

  switch (report) {
    case "STUDENTS": {
      const [totalStudents, newStudents] = await Promise.all([
        db.student.count({ where: { clientAdminId, ...(end ? { createdAt: { lte: end } } : {}) } }),
        db.student.count({ where: { clientAdminId, ...(range ? { createdAt: range } : {}) } }),
      ]);
      return { values: { totalStudents, newStudents } };
    }

    case "ADMISSIONS": {
      const rows = await db.student.findMany({
        where: { clientAdminId, ...(range ? { createdAt: range } : {}) },
        select: { createdAt: true },
      });
      const monthly: Record<string, number> = {};
      for (const r of rows) {
        const k = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
        monthly[k] = (monthly[k] ?? 0) + 1;
      }
      return { values: { admissions: rows.length }, monthly };
    }

    case "STATUS": {
      // Active = enrolled in at least one course that is still running.
      const [totalStudents, activeStudents] = await Promise.all([
        db.student.count({ where: { clientAdminId } }),
        db.student.count({ where: { clientAdminId, studentCourses: { some: { status: "ACTIVE" } } } }),
      ]);
      return {
        values: {
          totalStudents,
          activeStudents,
          inactiveStudents: totalStudents - activeStudents,
          activePercent: pct(activeStudents, totalStudents),
        },
      };
    }

    case "FEES": {
      const agg = await db.studentFeeLog.aggregate({
        _sum: { amountPaid: true },
        _count: { _all: true },
        where: { studentFee: { clientAdminId }, ...(range ? { paymentDate: range } : {}) },
      });
      return { values: { feesCollected: round2(agg._sum.amountPaid ?? 0), receipts: agg._count._all } };
    }

    case "OUTSTANDING": {
      // Same rule as the outstanding report: unpaid (PENDING) dues. Date range filters the due date.
      const where = { clientAdminId, paymentStatus: "PENDING" as const, ...(range ? { dueDate: range } : {}) };
      const [agg, students] = await Promise.all([
        db.studentFee.aggregate({ _sum: { amountDue: true }, _count: { _all: true }, where }),
        db.studentFee.findMany({ where, select: { studentId: true }, distinct: ["studentId"] }),
      ]);
      return {
        values: {
          outstandingAmount: round2(agg._sum.amountDue ?? 0),
          pendingInvoices: agg._count._all,
          studentsWithDues: students.length,
        },
      };
    }

    case "ATTENDANCE": {
      const where = { clientAdminId, ...(range ? { date: range } : {}) };
      const [records, present] = await Promise.all([
        db.attendanceRecord.count({ where }),
        db.attendanceRecord.count({ where: { ...where, present: true } }),
      ]);
      return {
        values: { records, present, absent: records - present, attendancePercent: pct(present, records) },
      };
    }

    case "EXAMS": {
      const rows = await db.studentTest.findMany({
        where: { clientAdminId, marksObtained: { not: null }, ...(range ? { testDate: range } : {}) },
        select: { studentId: true, marksObtained: true, totalMarks: true },
      });
      const scored = rows.filter((r) => (r.totalMarks ?? 0) > 0);
      const got = scored.reduce((a, r) => a + (r.marksObtained ?? 0), 0);
      const max = scored.reduce((a, r) => a + (r.totalMarks ?? 0), 0);
      return {
        values: {
          testsTaken: rows.length,
          studentsAssessed: new Set(rows.map((r) => r.studentId)).size,
          averagePercent: pct(got, max),
        },
      };
    }
  }
}
