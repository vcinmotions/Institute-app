//import { Request, Response } from "express";

// export async function profitAnalyticsController(req: Request, res: Response) {
//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
//       where: { email: user.email },
//     });

//     if (!clientAdmin) {
//       return res.status(404).json({ error: "Client admin not found" });
//     }

//     const clientAdminId = clientAdmin.id;

//     // =============================================
//     // 1️⃣ TOTAL INCOME (overall institute)
//     // =============================================
//     const totalIncomeData = await tenantPrisma.studentFee.aggregate({
//       _sum: { amountPaid: true },
//       where: { clientAdminId, paymentStatus: "SUCCESS" },
//     });
//     const totalIncome = totalIncomeData._sum.amountPaid ?? 0;

//     // =============================================
//     // 2️⃣ INCOME PER STUDENT
//     // =============================================
//     const incomePerStudent = await tenantPrisma.studentFee.groupBy({
//       by: ["studentId"],
//       _sum: { amountPaid: true },
//       where: { clientAdminId, paymentStatus: "SUCCESS" },
//     });

//     const studentDetails = await tenantPrisma.student.findMany({
//       where: { id: { in: incomePerStudent.map(i => i.studentId) } },
//       select: { id: true, fullName: true },
//     });

//     const perStudent = incomePerStudent.map(i => {
//       const student = studentDetails.find(s => s.id === i.studentId);
//       return {
//         studentId: i.studentId,
//         studentName: student?.fullName ?? "Unknown",
//         totalIncome: i._sum.amountPaid ?? 0,
//       };
//     });
//     const totalStudentIncome = perStudent.reduce((sum, s) => sum + s.totalIncome, 0);

//     // =============================================
//     // 3️⃣ INCOME PER COURSE
//     // =============================================
//     const incomePerCourse = await tenantPrisma.studentFee.groupBy({
//       by: ["courseId"],
//       _sum: { amountPaid: true },
//       where: { clientAdminId, paymentStatus: "SUCCESS" },
//     });

//     const courseDetails = await tenantPrisma.course.findMany({
//       where: { id: { in: incomePerCourse.map(i => i.courseId) } },
//       select: { id: true, name: true },
//     });

//     const perCourse = incomePerCourse.map(i => {
//       const course = courseDetails.find(c => c.id === i.courseId);
//       return {
//         courseId: i.courseId,
//         courseName: course?.name ?? "Unknown Course",
//         totalIncome: i._sum.amountPaid ?? 0,
//       };
//     });
//     const totalCourseIncome = perCourse.reduce((sum, c) => sum + c.totalIncome, 0);

//     // =============================================
//     // 4️⃣ INCOME PER BATCH
//     // =============================================
//     const batchIncome = await tenantPrisma.studentCourse.findMany({
//       where: { clientAdminId },
//       include: {
//         batch: true,
//         course: true,
//         student: {
//           include: {
//             feeRecords: {
//               where: { paymentStatus: "SUCCESS" },
//               select: { amountPaid: true },
//             },
//           },
//         },
//       },
//     });

//     const batchTotals: Record<string, number> = {};
//     batchIncome.forEach((record) => {
//       const batchName = record.batch?.name ?? "Unassigned";
//       const totalPaid = record.student.feeRecords.reduce(
//         (sum, fee) => sum + (fee.amountPaid || 0),
//         0
//       );
//       batchTotals[batchName] = (batchTotals[batchName] || 0) + totalPaid;
//     });

//     const perBatch = Object.entries(batchTotals).map(([batchName, totalIncome]) => ({
//       batchName,
//       totalIncome,
//     }));
//     const totalBatchIncome = perBatch.reduce((sum, b) => sum + b.totalIncome, 0);

//     // =============================================
//     // 5️⃣ INCOME PER FACULTY
//     // =============================================
//     const facultyBatches = await tenantPrisma.batch.findMany({
//       where: { clientAdminId },
//       include: {
//         faculty: true,
//         studentCourses: {
//           include: {
//             student: {
//               include: {
//                 feeRecords: {
//                   where: { paymentStatus: "SUCCESS" },
//                   select: { amountPaid: true },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     const facultyTotals: Record<string, number> = {};
//     facultyBatches.forEach((batch) => {
//       const facultyName = batch.faculty?.name ?? "Unassigned";
//       const totalPaid = batch.studentCourses.reduce((sum, sc) => {
//         const paid = sc.student.feeRecords.reduce(
//           (feeSum, f) => feeSum + (f.amountPaid || 0),
//           0
//         );
//         return sum + paid;
//       }, 0);
//       facultyTotals[facultyName] = (facultyTotals[facultyName] || 0) + totalPaid;
//     });

//     const perFaculty = Object.entries(facultyTotals).map(([facultyName, totalIncome]) => ({
//       facultyName,
//       totalIncome,
//     }));
//     const totalFacultyIncome = perFaculty.reduce((sum, f) => sum + f.totalIncome, 0);

//     // =============================================
//     // 6️⃣ INCOME PER PC SEAT
//     // =============================================
//     const totalSeats = await tenantPrisma.lab.aggregate({
//       _sum: { totalPCs: true },
//       where: { clientAdminId },
//     });
//     const totalPCs = totalSeats._sum.totalPCs ?? 0;
//     const incomePerPC = totalPCs > 0 ? totalIncome / totalPCs : 0;

//     // =============================================
//     // 📊 FINAL RESULT
//     // =============================================
//     return res.json({
//       summary: {
//         totalIncome,
//         totalPCs,
//         incomePerPC,
//         totalStudentIncome,
//         totalCourseIncome,
//         totalBatchIncome,
//         totalFacultyIncome,
//       },
//       breakdown: {
//         perStudent,
//         perCourse,
//         perBatch,
//         perFaculty,
//       },
//     });

//   } catch (err) {
//     console.error("Profit Analytics Error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

async function calculateTotalPaidByStudent(prisma: any, clientAdminId: string) {
  const allFees = await prisma.studentFee.findMany({
    where: { clientAdminId },
    include: { feeLogs: true, feeStructure: true },
  });

  const totals = new Map<number, { paid: number; totalFee: number; outstanding: number }>();

  for (const fee of allFees) {
    let paid = 0;

    // ✅ Case 1: One-time payment
    if (fee.feeStructure?.paymentType === 'ONE_TIME') {
      paid = fee.amountPaid || 0;

    // ✅ Case 2: Installment payment
    } else if (fee.feeStructure?.paymentType === 'INSTALLMENT') {
      paid = fee.feeLogs.reduce((sum: any, log: any) => sum + (log.amountPaid || 0), 0);

    // ✅ Fallback
    } else if (fee.paymentStatus === 'SUCCESS') {
      paid = fee.amountPaid || 0;
    }

    const totalFee = fee.feeStructure?.totalAmount || 0;
    const outstanding = Math.max(totalFee - paid, 0);

    // Merge data if student has multiple fee records
    const existing = totals.get(fee.studentId);
    if (existing) {
      totals.set(fee.studentId, {
        paid: existing.paid + paid,
        totalFee: existing.totalFee,
        outstanding: totalFee - paid,
      });
    } else {
      totals.set(fee.studentId, { paid, totalFee, outstanding });
    }
  }

  return totals;
}

import { Request, Response } from "express";
import ExcelJS from "exceljs";

export async function profitAnalyticsController(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
    //   where: { email: user.email },
    // });

    // if (!clientAdmin) {
    //   return res.status(404).json({ error: "Client admin not found" });
    // }

    const clientAdminId = user.clientAdminId;

    // =============================================
    // 1️⃣ TOTAL INCOME
    // =============================================
    // const totalIncomeData = await tenantPrisma.studentFee.aggregate({
    //   _sum: { amountPaid: true },
    //   where: { clientAdminId, paymentStatus: "SUCCESS" },
    // });
    // const totalIncome = totalIncomeData._sum.amountPaid ?? 0;

    // =============================================
    // 1️⃣ TOTAL INCOME (correct way, including installments)
    // =============================================
    const perStudentTotals = await calculateTotalPaidByStudent(tenantPrisma, clientAdminId);

    const totalIncome = Array.from(perStudentTotals.values()).reduce(
      (sum, s) => sum + s.paid,
      0
    );

    const totalOutstanding = Array.from(perStudentTotals.values()).reduce(
      (sum, s) => sum + s.outstanding,
      0
    );

    // =============================================
    // 2️⃣ INCOME PER STUDENT
    // =============================================
    const incomePerStudent = await tenantPrisma.studentFee.groupBy({
      by: ["studentId"],
      _sum: { amountPaid: true },
      where: { clientAdminId, paymentStatus: "SUCCESS" },
    });

    //const perStudentTotals = await calculateTotalPaidByStudent(tenantPrisma, clientAdminId);

    const studentDetails = await tenantPrisma.student.findMany({
      where: { id: { in: Array.from(perStudentTotals.keys()) } },
      select: { id: true, fullName: true },
    });

    const perStudent = Array.from(perStudentTotals.entries()).map(([studentId, data]) => {
      const student = studentDetails.find((s) => s.id === studentId);
      return {
        studentId,
        studentName: student?.fullName ?? "Unknown",
        totalFee: data.totalFee,
        totalPaid: data.paid,
        outstanding: data.outstanding,
      };
    });

    const totalStudentIncome = perStudent.reduce((sum, s) => sum + s.totalPaid, 0);
    //const totalOutstanding = perStudent.reduce((sum, s) => sum + s.outstanding, 0);


    // =============================================
    // 3️⃣ INCOME PER COURSE
    // =============================================
    const incomePerCourse = await tenantPrisma.studentFee.groupBy({
      by: ["courseId"],
      _sum: { amountPaid: true },
      where: { clientAdminId, paymentStatus: "SUCCESS" },
    });

    const courseDetails = await tenantPrisma.course.findMany({
      where: { id: { in: incomePerCourse.map((i) => i.courseId) } },
      select: { id: true, name: true },
    });

    const perCourse = incomePerCourse.map((i) => {
      const course = courseDetails.find((c) => c.id === i.courseId);
      return {
        courseId: i.courseId,
        courseName: course?.name ?? "Unknown Course",
        totalIncome: i._sum.amountPaid ?? 0,
      };
    });
    const totalCourseIncome = perCourse.reduce((sum, c) => sum + c.totalIncome, 0);

    // =============================================
    // 4️⃣ INCOME PER BATCH
    // =============================================
    const batchIncome = await tenantPrisma.studentCourse.findMany({
      where: { clientAdminId },
      include: {
        batch: true,
        student: {
          include: {
            feeRecords: {
              where: { paymentStatus: "SUCCESS" },
              select: { amountPaid: true },
            },
          },
        },
      },
    });

    const batchTotals: Record<string, number> = {};
    batchIncome.forEach((record) => {
      const batchName = record.batch?.name ?? "Unassigned";
      const totalPaid = record.student.feeRecords.reduce(
        (sum, fee) => sum + (fee.amountPaid || 0),
        0
      );
      batchTotals[batchName] = (batchTotals[batchName] || 0) + totalPaid;
    });

    const perBatch = Object.entries(batchTotals).map(([batchName, totalIncome]) => ({
      batchName,
      totalIncome,
    }));
    const totalBatchIncome = perBatch.reduce((sum, b) => sum + b.totalIncome, 0);

    // =============================================
    // 5️⃣ INCOME PER FACULTY
    // =============================================
    const facultyBatches = await tenantPrisma.batch.findMany({
      where: { clientAdminId },
      include: {
        faculty: true,
        studentCourses: {
          include: {
            student: {
              include: {
                feeRecords: {
                  where: { paymentStatus: "SUCCESS" },
                  select: { amountPaid: true },
                },
              },
            },
          },
        },
      },
    });

    const facultyTotals: Record<string, number> = {};
    facultyBatches.forEach((batch) => {
      const facultyName = batch.faculty?.name ?? "Unassigned";
      const totalPaid = batch.studentCourses.reduce((sum, sc) => {
        const paid = sc.student.feeRecords.reduce(
          (feeSum, f) => feeSum + (f.amountPaid || 0),
          0
        );
        return sum + paid;
      }, 0);
      facultyTotals[facultyName] = (facultyTotals[facultyName] || 0) + totalPaid;
    });

    const perFaculty = Object.entries(facultyTotals).map(([facultyName, totalIncome]) => ({
      facultyName,
      totalIncome,
    }));
    const totalFacultyIncome = perFaculty.reduce((sum, f) => sum + f.totalIncome, 0);

    // =============================================
    // 6️⃣ INCOME PER PC (real mapping)
    // =============================================
    const allocations = await tenantPrisma.labAllocation.findMany({
      where: { clientAdminId },
      include: {
        labTimeSlot: {
          include: { lab: true },
        },
        student: {
          include: {
            feeRecords: {
              where: { paymentStatus: "SUCCESS" },
              select: { amountPaid: true },
            },
          },
        },
      },
    });

    const perPC = allocations.map((alloc) => {
      const totalPaid = alloc.student.feeRecords.reduce(
        (sum, fee) => sum + (fee.amountPaid || 0),
        0
      );
      return {
        labName: alloc.labTimeSlot.lab.name,
        pcNumber: alloc.pcNumber,
        studentName: alloc.student.fullName,
        totalIncome: totalPaid,
      };
    });

    const totalPCs = allocations.length;
    const totalPCIncome = perPC.reduce((sum, p) => sum + p.totalIncome, 0);
    const incomePerPC = totalPCs > 0 ? totalPCIncome / totalPCs : 0;

    // =============================================
    // 📊 FINAL RESULT
    // =============================================
    return res.json({
      summary: {
        totalIncome,
        totalPCs,
        totalPCIncome,
        totalStudentIncome,
        totalCourseIncome,
        totalBatchIncome,
        totalFacultyIncome,
        totalOutstanding,
      },
      breakdown: {
        perStudent,
        perCourse,
        perBatch,
        perFaculty,
        perPC, // ✅ added real per-PC breakdown
      },
    });
  } catch (err) {
    console.error("Profit Analytics Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


// ✅ Reuse your working fee calculation helper
// async function calculateTotalPaidByStudent(prisma: any, clientAdminId: string) {
//   const allFees = await prisma.studentFee.findMany({
//     where: { clientAdminId },
//     include: { feeLogs: true, feeStructure: true },
//   });

//   const totals = new Map<number, { paid: number; totalFee: number; outstanding: number }>();

//   for (const fee of allFees) {
//     let paid = 0;

//     if (fee.feeStructure?.paymentType === "ONE_TIME") {
//       paid = fee.amountPaid || 0;
//     } else if (fee.feeStructure?.paymentType === "INSTALLMENT") {
//       paid = fee.feeLogs.reduce((sum: any, log: any) => sum + (log.amountPaid || 0), 0);
//     } else if (fee.paymentStatus === "SUCCESS") {
//       paid = fee.amountPaid || 0;
//     }

//     const totalFee = fee.feeStructure?.totalAmount || 0;
//     const outstanding = Math.max(totalFee - paid, 0);

//     const existing = totals.get(fee.studentId);
//     if (existing) {
//       totals.set(fee.studentId, {
//         paid: existing.paid + paid,
//         totalFee: existing.totalFee + totalFee,
//         outstanding: existing.outstanding + outstanding,
//       });
//     } else {
//       totals.set(fee.studentId, { paid, totalFee, outstanding });
//     }
//   }

//   return totals;
// }

export async function financialReportController(req: Request, res: Response) {
  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
    //   where: { email: user.email },
    // });

    // if (!clientAdmin) {
    //   return res.status(404).json({ error: "Client admin not found" });
    // }

    const clientAdminId = user.clientAdminId;

    // =============================================
    // 1️⃣ Calculate totals per student (with installments)
    // =============================================
    const perStudentTotals = await calculateTotalPaidByStudent(tenantPrisma, clientAdminId);

    const studentDetails = await tenantPrisma.student.findMany({
      where: { id: { in: Array.from(perStudentTotals.keys()) } },
      select: { id: true, fullName: true },
    });

    const perStudent = Array.from(perStudentTotals.entries()).map(([studentId, data]) => {
      const student = studentDetails.find((s) => s.id === studentId);
      return {
        studentId,
        studentName: student?.fullName ?? "Unknown",
        totalFee: data.totalFee,
        totalPaid: data.paid,
        outstanding: data.outstanding,
      };
    });

    const totalIncome = perStudent.reduce((a, s) => a + s.totalPaid, 0);
    const totalOutstanding = perStudent.reduce((a, s) => a + s.outstanding, 0);

    // =============================================
    // 2️⃣ Income per course
    // =============================================
    const incomePerCourse = await tenantPrisma.studentFee.groupBy({
      by: ["courseId"],
      _sum: { amountPaid: true },
      where: { clientAdminId, paymentStatus: "SUCCESS" },
    });

    const courseDetails = await tenantPrisma.course.findMany({
      where: { id: { in: incomePerCourse.map((i) => i.courseId) } },
      select: { id: true, name: true },
    });

    const perCourse = incomePerCourse.map((i) => {
      const course = courseDetails.find((c) => c.id === i.courseId);
      return {
        courseId: i.courseId,
        courseName: course?.name ?? "Unknown Course",
        totalIncome: i._sum.amountPaid ?? 0,
      };
    });

    const totalCourseIncome = perCourse.reduce((sum, c) => sum + c.totalIncome, 0);

    // =============================================
    // 3️⃣ Income per batch
    // =============================================
    const batchIncome = await tenantPrisma.studentCourse.findMany({
      where: { clientAdminId },
      include: {
        batch: true,
        student: {
          include: {
            feeRecords: {
              where: { paymentStatus: "SUCCESS" },
              select: { amountPaid: true },
            },
          },
        },
      },
    });

    const batchTotals: Record<string, number> = {};
    batchIncome.forEach((record) => {
      const batchName = record.batch?.name ?? "Unassigned";
      const totalPaid = record.student.feeRecords.reduce(
        (sum, fee) => sum + (fee.amountPaid || 0),
        0
      );
      batchTotals[batchName] = (batchTotals[batchName] || 0) + totalPaid;
    });

    const perBatch = Object.entries(batchTotals).map(([batchName, totalIncome]) => ({
      batchName,
      totalIncome,
    }));

    const totalBatchIncome = perBatch.reduce((sum, b) => sum + b.totalIncome, 0);

    // =============================================
    // 4️⃣ Income per faculty
    // =============================================
    const facultyBatches = await tenantPrisma.batch.findMany({
      where: { clientAdminId },
      include: {
        faculty: true,
        studentCourses: {
          include: {
            student: {
              include: {
                feeRecords: {
                  where: { paymentStatus: "SUCCESS" },
                  select: { amountPaid: true },
                },
              },
            },
          },
        },
      },
    });

    const facultyTotals: Record<string, number> = {};
    facultyBatches.forEach((batch) => {
      const facultyName = batch.faculty?.name ?? "Unassigned";
      const totalPaid = batch.studentCourses.reduce((sum, sc) => {
        const paid = sc.student.feeRecords.reduce(
          (feeSum, f) => feeSum + (f.amountPaid || 0),
          0
        );
        return sum + paid;
      }, 0);
      facultyTotals[facultyName] = (facultyTotals[facultyName] || 0) + totalPaid;
    });

    const perFaculty = Object.entries(facultyTotals).map(([facultyName, totalIncome]) => ({
      facultyName,
      totalIncome,
    }));

    const totalFacultyIncome = perFaculty.reduce((sum, f) => sum + f.totalIncome, 0);

    // =============================================
    // 5️⃣ Income per PC (lab allocation)
    // =============================================
    const allocations = await tenantPrisma.labAllocation.findMany({
      where: { clientAdminId },
      include: {
        labTimeSlot: { include: { lab: true } },
        student: {
          include: {
            feeRecords: {
              where: { paymentStatus: "SUCCESS" },
              select: { amountPaid: true },
            },
          },
        },
      },
    });

    const perPC = allocations.map((alloc) => {
      const totalPaid = alloc.student.feeRecords.reduce(
        (sum, fee) => sum + (fee.amountPaid || 0),
        0
      );
      return {
        labName: alloc.labTimeSlot.lab.name,
        pcNumber: alloc.pcNumber,
        studentName: alloc.student.fullName,
        totalIncome: totalPaid,
      };
    });

    const totalPCs = allocations.length;
    const totalPCIncome = perPC.reduce((sum, p) => sum + p.totalIncome, 0);

    // =============================================
    // 📊 Final Financial Report
    // =============================================
    return res.json({
      summary: {
        totalIncome,
        totalOutstanding,
        totalBatchIncome,
        totalCourseIncome,
        totalFacultyIncome,
        totalStudentIncome: totalIncome,
        totalPCIncome,
        totalPCs,
      },
      breakdown: {
        perStudent,
        perCourse,
        perBatch,
        perFaculty,
        perPC,
      },
    });
  } catch (error) {
    console.error("Financial Report Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function financialSummaryController(req: Request, res: Response) {
  const tenantPrisma = req.tenantPrisma;
  const user = req.user;

  if (!tenantPrisma || !user || typeof user === "string") {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
  //   where: { email: user.email },
  // });
  // if (!clientAdmin) return res.status(404).json({ error: "Client admin not found" });

  // const clientAdminId = clientAdmin.id;

  const clientAdminId = user.clientAdminId;

  // Optional query filters: ?from=2025-01-01&to=2025-12-31&export=excel
  const { from, to, export: exportType } = req.query;

  const dateFilter: any = {};
  if (from || to) {
    dateFilter.date = {};
    if (from) dateFilter.date.gte = new Date(from as string);
    if (to) dateFilter.date.lte = new Date(to as string);
  }

  const [income, expense] = await Promise.all([
    tenantPrisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { clientAdminId, recordType: "INCOME" },
    }),
    tenantPrisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { clientAdminId, recordType: "EXPENSE" },
    }),
  ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;
  const profit = totalIncome - totalExpense;

  const breakdown = await tenantPrisma.financialRecord.groupBy({
    by: ["recordType"],
    _sum: { amount: true },
    where: { clientAdminId },
  });

  const records = await tenantPrisma.financialRecord.findMany({
      where: { clientAdminId, ...dateFilter },
      orderBy: { date: "desc" },
      select: {
        id: true,
        recordType: true,
        description: true,
        amount: true,
        paymentMode: true,
        date: true,
      },
    });

  // -------------------------------
  // 🧾 If Excel export requested
  // -------------------------------
  if (exportType === "excel") {
    const records = await tenantPrisma.financialRecord.findMany({
      where: { clientAdminId, ...dateFilter },
      orderBy: { date: "desc" },
      select: {
        id: true,
        recordType: true,
        description: true,
        amount: true,
        paymentMode: true,
        date: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Financial Summary");

    // Header row
    sheet.addRow(["Record Type", "Description", "Amount", "Payment Mode", "Date"]);

    // Data rows
    records.forEach((rec) => {
      sheet.addRow([
        rec.recordType,
        rec.description || "",
        rec.amount,
        rec.paymentMode || "",
        rec.date ? new Date(rec.date).toLocaleDateString() : "",
      ]);
    });

    // Summary row
    sheet.addRow([]);
    sheet.addRow(["", "Total Income", totalIncome]);
    sheet.addRow(["", "Total Expense", totalExpense]);
    sheet.addRow(["", "Profit", profit]);

    // Formatting
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col) => {
      if (col) col.width = 20;
    });

    // Return file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=financial-summary.xlsx"
    );

    await workbook.xlsx.write(res);
    return res.end();
  }

  return res.json({
    records: records,
    summary: { totalIncome, totalExpense, profit },
    breakdown,
  });
}

export async function outstandingReportController(req: Request, res: Response) {
  const tenantPrisma = req.tenantPrisma;
  const user = req.user;

  if (!tenantPrisma || !user || typeof user === "string") {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
  //   where: { email: user.email },
  // });
  // if (!clientAdmin) return res.status(404).json({ error: "Client admin not found" });

  // const clientAdminId = clientAdmin.id;

  const clientAdminId = user.clientAdminId;

  // Optional query filters: ?from=2025-01-01&to=2025-12-31&export=excel
  const { from, to, export: exportType } = req.query;

  const dateFilter: any = {};
  if (from || to) {
    dateFilter.date = {};
    if (from) dateFilter.date.gte = new Date(from as string);
    if (to) dateFilter.date.lte = new Date(to as string);
  }

  const [income] = await Promise.all([
    tenantPrisma.studentFee.aggregate({
      _sum: { amountDue: true },
      where: { clientAdminId, paymentStatus: "PENDING" },
    }),
  ]);

  const totalOutstanding = income._sum.amountDue ?? 0;

  // ✅ Fetch outstanding student fees
  const outstanding = await tenantPrisma.studentFee.findMany({
    where: {
      clientAdminId,
      paymentStatus: "PENDING",
      ...dateFilter,
    },
    select: {
      id: true,
      studentId: true,
      courseId: true,
      dueDate: true,
      amountDue: true,
      amountPaid: true,
      paymentMode: true,
      receiptNo: true,
      paymentStatus: true,
      student: {
        select: {
          fullName: true,
          studentCode: true,
          contact: true,
        },
      },
      course: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log("✅ OUTSTANDING:", outstanding);

  // -------------------------------
  // 🧾 If Excel export requested
  // -------------------------------
  if (exportType === "excel") {
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Outstanding Fees");

    // ✅ Header Row
    sheet.addRow([
      "Student Name",
      "Student Code",
      "Contact",
      "Course",
      "Amount Due",
      "Amount Paid",
      "Outstanding",
      "Due Date",
      "Receipt No",
      "Payment Mode",
      "Status",
    ]);

    // ✅ Data Rows
    outstanding.forEach((rec) => {
      sheet.addRow([
        rec.student.fullName,
        rec.student.studentCode,
        rec.student.contact,
        rec.course.name,
        rec.amountDue,
        rec.amountPaid,
        rec.amountDue - rec.amountPaid,
        rec.dueDate.toISOString().split("T")[0],
        rec.receiptNo,
        rec.paymentMode,
        rec.paymentStatus,
      ]);
    });

    // Summary row
      sheet.addRow([]);
      sheet.addRow(["", "Total Outstanding", totalOutstanding]);

    // ✅ Bold Header
    sheet.getRow(1).font = { bold: true };

    // ✅ Column Width
    sheet.columns.forEach((col: { width: number; }) => {
      if (col) col.width = 20;
    });

    // ✅ 🔒 Protect the sheet (make it uneditable)
    await sheet.protect("secure123", {
      selectLockedCells: true,
      selectUnlockedCells: false,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
    });

    // ✅ Set all cells as locked (Excel respects this after protection)
    sheet.eachRow((row: { eachCell: (arg0: (cell: any) => void) => void; }) => {
      row.eachCell((cell) => {
        cell.protection = { locked: true };
      });
    });

    // ✅ Send Response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=outstanding-report.xlsx"
    );

    await workbook.xlsx.write(res);
    return res.end();
  }


  return res.json({
    outstanding
  });
}