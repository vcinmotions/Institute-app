// controllers/attendanceController.ts
import { Request, Response } from "express";

export async function markAttendance(req: Request, res: Response) {
  const { date, batchId, courseId, attendance } = req.body;

  console.log("Get Attendance Data:", req.body);

  if (!date || !batchId || !courseId || !attendance) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("GEt Attendance body:", req.body);

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const facultyEmail = user.email;
    const clientAdminId = user.clientAdminId;

    // ✅ get faculty by email
    const faculty = await tenantPrisma.faculty.findUnique({
      where: { email: facultyEmail },
    });

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // ✅ ensure batch belongs to faculty
    const batch = await tenantPrisma.batch.findFirst({
      where: {
        id: batchId,
        facultyId: faculty.id,
      },
    });

    if (!batch) {
      return res.status(403).json({ error: "Not authorized for this batch" });
    }

    // ✅ delete existing attendance for that date
    await tenantPrisma.attendanceRecord.deleteMany({
      where: {
        facultyId: faculty.id,
        courseId,
        date: new Date(date),
      },
    });

    // ✅ insert new attendance records
    await tenantPrisma.attendanceRecord.createMany({
      data: attendance.map((entry: any) => ({
        studentId: entry.studentId,
        courseId,
        facultyId: faculty.id,
        clientAdminId,
        batchId,
        date: new Date(date),
        present: entry.present,
      })),
    });

    return res.status(201).json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// export async function getAttendanceByBatch(req: Request, res: Response) {
//   const { batchId } = req.params;
//   const { date } = req.query;

//   if (!batchId || !date) {
//     return res.status(400).json({ error: "Missing batchId or date" });
//   }

//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const records = await tenantPrisma.attendanceRecord.findMany({
//       where: {
//         batchId: Number(batchId),
//         date: new Date(date as string),
//       },
//       include: {
//         student: {
//           select: {
//             id: true,
//             fullName: true,
//             studentCode: true,
//             photoUrl: true,
//           },
//         },
//         course: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//     });

//     return res.status(200).json(records);
//   } catch (err) {
//     console.error("❌ Error fetching attendance:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// ✅ getAttendanceByBatch Controller
export async function getAttendanceByBatch(req: Request, res: Response) {
  const { batchId } = req.params;
  let { date } = req.query;

  console.log("GEt Attendance body:", req.query);

  if (!batchId) {
    return res.status(400).json({ error: "Missing batchId" });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Default date = today (midnight)
    const targetDate = date
      ? new Date(date as string)
      : new Date(new Date().setHours(0, 0, 0, 0));

    // ✅ Step 1: Get all ACTIVE students in this batch
    const activeStudentCourses = await tenantPrisma.studentCourse.findMany({
      where: {
        batchId: Number(batchId),
        status: "ACTIVE", // only active students
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            photoUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            faculty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log("🎓 Active Students in Batch:", activeStudentCourses);

    // ✅ Step 2: Fetch attendance records (for the date)
    const attendanceRecords = await tenantPrisma.attendanceRecord.findMany({
      where: {
        batchId: Number(batchId),
        date: targetDate,
      },
    });

    console.log("📅 Existing Attendance Records:", attendanceRecords);

    // ✅ Step 3: Merge attendance with active students
    const mergedData = activeStudentCourses.map((sc) => {
      const existing = attendanceRecords.find(
        (rec) => rec.studentId === sc.studentId
      );
      return {
        id: sc.id,
        student: sc.student,
        course: sc.course,
        batch: sc.batch,
        present: existing ? existing.present : false, // default absent if not marked yet
        date: targetDate,
      };
    });

    return res.status(200).json(mergedData);
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ getAttendanceByBatch Controller
export async function getAttendanceByCourse(req: Request, res: Response) {
  const { courseId } = req.params;
  let { date } = req.query;

  console.log("GEt Attendance body:", req.query);

  if (!courseId) {
    return res.status(400).json({ error: "Missing batchId" });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Default date = today (midnight)
    const targetDate = date
      ? new Date(date as string)
      : new Date(new Date().setHours(0, 0, 0, 0));

    // ✅ Step 1: Get all ACTIVE students in this batch
    const activeStudentCourses = await tenantPrisma.studentCourse.findMany({
      where: {
        courseId: Number(courseId),
        status: "ACTIVE", // only active students
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            photoUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            faculty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log("🎓 Active Students in Course:", activeStudentCourses);

    // ✅ Step 2: Fetch attendance records (for the date)
    const attendanceRecords = await tenantPrisma.attendanceRecord.findMany({
      where: {
        courseId: Number(courseId),
        date: targetDate,
      },
    });

    console.log("📅 Existing Attendance Records:", attendanceRecords);

    // ✅ Step 3: Merge attendance with active students
    const mergedData = activeStudentCourses.map((sc) => {
      const existing = attendanceRecords.find(
        (rec) => rec.studentId === sc.studentId
      );
      return {
        id: sc.id,
        student: sc.student,
        course: sc.course,
        batch: sc.batch,
        present: existing ? existing.present : false, // default absent if not marked yet
        date: targetDate,
      };
    });

    return res.status(200).json(mergedData);
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// export async function markAttendance(req: Request, res: Response) {
//   const { name, date, batchId, courseId, attendance } = req.body;

//   if (!name || !date || !batchId || !courseId || !attendance) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const facultyEmail = user.email;
//     const clientAdminId = user.clientAdminId;
//     const faculty = await tenantPrisma.faculty.findUnique({
//       where:  name ,
//     });

//     if (!faculty) {
//       return res.status(404).json({ error: "Faculty not found" });
//     }

//     // Verify that this batch belongs to this faculty
//     const batch = await tenantPrisma.batch.findFirst({
//       where: {
//         id: batchId,
//         facultyId: faculty.id,
//       },
//       include: { studentCourses: {
//         include: {
//           student: true,
//         }
//       } },
//     });

//     if (!batch) {
//       return res.status(403).json({ error: "Not authorized for this batch" });
//     }

//     // Delete existing attendance for that date (to allow re-marking)
//     await tenantPrisma.attendanceRecord.deleteMany({
//       where: {
//         facultyId: faculty.id,
//         courseId,
//         date: new Date(date),
//       },
//     });

//     // Bulk insert attendance
//     await tenantPrisma.attendanceRecord.createMany({
//       data: attendance.map((entry: any) => ({
//         studentId: entry.studentId,
//         courseId,
//         facultyId: faculty.id,
//         clientAdminId: clientAdminId  ,
//         date: new Date(date),
//         present: entry.present,
//       })),
//     });

//     return res
//       .status(201)
//       .json({ message: "Attendance marked successfully" });
//   } catch (err) {
//     console.error("❌ Error marking attendance:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// export async function getAttendanceByBatch(req: Request, res: Response) {
//   const { batchId } = req.params;
//   const { date } = req.query;

//   if (!batchId || !date) {
//     return res.status(400).json({ error: "Missing batchId or date" });
//   }

//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const facultyEmail = user.email;
//     const faculty = await tenantPrisma.faculty.findUnique({
//       where:  name ,
//     });

//     const records = await tenantPrisma.attendanceRecord.findMany({
//       where: {
//         date: new Date(date as string),
//         facultyId: faculty?.id,
//         student: {
//           studentCourses: {
//             some: { batchId: Number(batchId) },
//           },
//         },
//       },
//       include: {
//         student: { select: { id: true, fullName: true, studentCode: true } },
//       },
//     });

//     return res.status(200).json(records);
//   } catch (err) {
//     console.error("Error fetching attendance:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// 📄 controllers/attendanceController.ts

export async function exportMonthlyAttendance(req: Request, res: Response) {
  const tenantPrisma = req.tenantPrisma;
  const user = req.user;

  if (!tenantPrisma || !user || typeof user === "string") {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  const { batchId, month, export: exportType } = req.query;

  if (!batchId || !month) {
    return res.status(400).json({ error: "Missing batchId or month" });
  }

  try {
    const [year, monthNum] = (month as string).split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    // ✅ Fetch active students in batch
    const activeStudents = await tenantPrisma.studentCourse.findMany({
      where: { batchId: Number(batchId), status: "ACTIVE" },
      include: {
        student: {
          select: { id: true, fullName: true, studentCode: true },
        },
        course: { select: { name: true } },
        batch: {
          select: {
            name: true,
            faculty: { select: { name: true } },
          },
        },
      },
    });

    if(!activeStudents) {
      return res.status(400).json({ error: "Missing activeStudents" });
    }

    // ✅ Fetch attendance for all days of month for that batch
    const attendanceRecords = await tenantPrisma.attendanceRecord.findMany({
      where: {
        batchId: Number(batchId),
        date: { gte: startDate, lte: endDate },
      },
    });

    // -------------------------------
    // 🧾 Export as Excel
    // -------------------------------
    if (exportType === "excel") {
      const ExcelJS = require("exceljs");
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Monthly Attendance");
      

      // ✅ Dates for header (1–30)
      const totalDays = endDate.getDate();
      //const dateHeaders = Array.from({ length: totalDays }, (_, i) => i + 1);

      const dateHeaders = Array.from({ length: totalDays }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(year, monthNum - 1, day);

        const dd = String(day).padStart(2, "0");
        const mm = String(monthNum).padStart(2, "0");
        const yyyy = year;

        return `${dd}/${mm}/${yyyy}`;
      });

      // ✅ Header Row
      const headers = [
        "Student Name",
        "Student Code",
        "Course",
        "Batch",
        "Faculty",
        ...dateHeaders,//.map((d) => d.toString()),
        "Total Present",
        "Total Absent",
        "Attendance %",
      ];
      sheet.addRow(headers);

      // ✅ Add Student Rows
      activeStudents.forEach((sc) => {
        const rowData: any[] = [
          sc.student.fullName,
          sc.student.studentCode,
          sc.course.name,
          sc.batch?.name || "N/A",          // ✅ Safe optional chaining
          sc.batch?.faculty?.name || "N/A", // ✅ Safe optional chaining
        ];

        let totalPresent = 0;

        for (let day = 1; day <= totalDays; day++) {
          const dayDate = new Date(year, monthNum - 1, day);
          const record = attendanceRecords.find(
            (r) =>
              r.studentId === sc.student.id &&
              new Date(r.date).toDateString() === dayDate.toDateString()
          );

          if (record?.present) {
            rowData.push("P");
            totalPresent++;
          } else {
            rowData.push("A");
          }
        }

        const totalAbsent = totalDays - totalPresent;
        const attendancePercent = ((totalPresent / totalDays) * 100).toFixed(1);

        rowData.push(totalPresent, totalAbsent, `${attendancePercent}%`);
        sheet.addRow(rowData);
      });

      // ✅ Style header
      sheet.getRow(1).font = { bold: true };
      sheet.columns.forEach((col: any) => (col.width = 15));

      // ✅ Send response as Excel
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=attendance-${month}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    // ✅ Otherwise, return JSON
    return res.json({
      batchId,
      month,
      students: activeStudents.length,
      records: attendanceRecords.length,
    });
  } catch (err) {
    console.error("❌ Error exporting monthly attendance:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
