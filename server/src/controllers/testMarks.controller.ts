import { Request, Response } from "express";

/** Grade from percentage. */
export function gradeFor(percent: number): string {
  if (percent >= 90) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 70) return "B+";
  if (percent >= 60) return "B";
  if (percent >= 50) return "C";
  if (percent >= 40) return "D";
  return "F";
}

// GET /test/:id/students - students assigned to a test with their marks and grade.
export async function getTestStudentsController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;
    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const testId = parseInt(String(req.params.id), 10);
    if (!Number.isInteger(testId)) return res.status(400).json({ error: "Invalid test id" });

    const test = await prisma.test.findFirst({
      where: { id: testId, clientAdminId: user.clientAdminId },
      include: { batch: true, course: true },
    });
    if (!test) return res.status(404).json({ error: "Test not found" });

    const rows = await prisma.studentTest.findMany({
      where: { testId, clientAdminId: user.clientAdminId },
      include: { student: { select: { id: true, fullName: true, studentCode: true } } },
      orderBy: { studentId: "asc" },
    });

    return res.json({ message: "Test students fetched", test, students: rows });
  } catch (err) {
    console.error("getTestStudentsController:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /test-marks  { testId, marks: [{ studentTestId, marksObtained }] }
export async function saveTestMarksController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;
    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const testId = Number(req.body?.testId);
    const marks = req.body?.marks;
    if (!Number.isInteger(testId) || !Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ error: "testId and a non-empty marks list are required" });
    }

    const rows = await prisma.studentTest.findMany({
      where: { testId, clientAdminId: user.clientAdminId },
      select: { id: true, totalMarks: true },
    });
    const byId = new Map<number, { id: number; totalMarks: number | null }>(
      rows.map((r: any) => [r.id, r])
    );

    // Validate everything first so a bad row saves nothing.
    const updates: { id: number; marksObtained: number; grade: string }[] = [];
    for (const m of marks) {
      const row = byId.get(Number(m?.studentTestId));
      if (!row) return res.status(400).json({ error: `Student test ${m?.studentTestId} does not belong to this test` });
      if (m.marksObtained === "" || m.marksObtained === null || m.marksObtained === undefined) continue; // not entered yet
      const obtained = Number(m.marksObtained);
      const total = Number(row.totalMarks ?? 0);
      if (!Number.isFinite(obtained) || obtained < 0) {
        return res.status(400).json({ error: "Marks must be a number of 0 or more" });
      }
      if (total > 0 && obtained > total) {
        return res.status(400).json({ error: `Marks cannot be more than the total (${total})` });
      }
      updates.push({ id: row.id, marksObtained: obtained, grade: gradeFor(total > 0 ? (obtained / total) * 100 : 0) });
    }

    await prisma.$transaction(
      updates.map((u) =>
        prisma.studentTest.update({
          where: { id: u.id },
          data: { marksObtained: Math.round(u.marksObtained), grade: u.grade, status: "COMPLETED" },
        })
      )
    );

    return res.json({ message: "Marks saved", saved: updates.length });
  } catch (err) {
    console.error("saveTestMarksController:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
