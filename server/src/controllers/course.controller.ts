import { Request, Response } from "express";
import { generateCertificate } from "../utils/templates/certificatesGenerate";
import path from "path";
import { courseQuerySchema } from "../validators/course.query";
import { getCourses } from "../services/course.service";
import { titleCase } from "../utils/Normalize";
import { parseDate } from "../helpers/date";

function calculateTimePerDay(schedule: { startTime: string; endTime: string }) {
  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);

  const totalMinutes = endH * 60 + endM - (startH * 60 + startM);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
}

export async function addCourseToExistingStudent(req: Request, res: Response) {
  const {
    //studentId,         // 🧑‍🎓 Existing student ID
    courseId, // 📚 Course name (e.g., "Python")
    batchId,
    admissionDate, // 📅 Start date of course
    feeAmount, // 💵 New
    paymentType, // e.g., 'ONE_TIME' or 'INSTALLMENT'

    installmentTypeId,
  } = req.body;

  const studentId = parseInt(req.body.studentId); // ✅ Fix type

  console.log(
    "Gye studetn course detaild",
    courseId,
    batchId,
    studentId,
    admissionDate, // 📅 Start date of course
    feeAmount, // 💵 New
    paymentType,

    installmentTypeId
  );

  if (
    !studentId ||
    !courseId ||
    !admissionDate ||
    !batchId ||
    !feeAmount ||
    !paymentType
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // ✅ Get admin
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
    //   where: { email: user.email },
    // });

    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    const clientAdminId = user.clientAdminId;

    // ✅ Check student exists
    const student = await tenantPrisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // ✅ Validate Course, Batch & Faculty
    const courseExists = await tenantPrisma.course.findUnique({
      where: { id: Number(courseId) },
    });
    if (!courseExists)
      return res.status(404).json({ error: "Course does not exist" });

    const batchExists = await tenantPrisma.batch.findUnique({
      where: { id: Number(batchId) },
    });
    if (!batchExists)
      return res.status(404).json({ error: "Batch does not exist" });

    // ✅ 4. Check if student already has same course (active or completed)
    const existingStudentCourse = await tenantPrisma.studentCourse.findFirst({
      where: {
        studentId,
        courseId: Number(courseId),
      },
    });

    console.log(
      "GET existingStudentCourse STRUCTIYYRE:>>>>>>>>>>>>>>>>>>>>>>>>>>",
      existingStudentCourse
    );

    if (existingStudentCourse) {
      return res.status(400).json({
        error: `Student is already enrolled or has completed the course "${courseExists.name}".`,
      });
    }

    // ✅ Check if student has any ACTIVE course in the same batch
    const activeCourseInSameBatch = await tenantPrisma.studentCourse.findFirst({
      where: {
        studentId,
        batchId: Number(batchId),
        status: { not: "COMPLETED" },
      },
      include: { course: true },
    });

    if (activeCourseInSameBatch) {
      return res.status(400).json({
        error: `Student is already enrolled in "${activeCourseInSameBatch.course.name}" which is ACTIVE in batch "${batchExists.name}". Please assign to a different batch.`,
      });
    }

    // ✅ 5. Check if batch is already assigned to the student
    const existingBatchAssignment = await tenantPrisma.studentCourse.findFirst({
      where: {
        studentId,
        batchId: Number(batchId),
      },
    });

    console.log(
      "GET existingBatchAssignment STRUCTIYYRE:>>>>>>>>>>>>>>>>>>>>>>>>>>",
      existingBatchAssignment
    );

    // 🧠 If there is an existing assignment in this batch
    if (existingBatchAssignment) {
      if (existingBatchAssignment.status !== "COMPLETED") {
        // 🚫 Student is still active/in-progress in this batch — stop
        return res.status(400).json({
          error: `Student is already enrolled in batch "${batchExists.name}" and has not yet completed the course.`,
        });
      } else {
        console.log(
          `✅ Student previously completed a course in batch "${batchExists.name}", proceeding...`
        );
      }
    }

    // 🔍 Check if FeeStructure already exists (enforced by unique constraint)
    const existingFeeStructure = await tenantPrisma.feeStructure.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: Number(courseId),
        },
      },
    });

    console.log(
      "GET existingFeeStructure STRUCTIYYRE:>>>>>>>>>>>>>>>>>>>>>>>>>>",
      existingFeeStructure
    );

    if (existingFeeStructure) {
      return res.status(400).json({
        error: `Student already has fee structure for course "${courseExists.name}"`,
      });
    }

    // const courseFeeStructure = await tenantPrisma.courseFeeStructure.findUnique(
    //   {
    //     where: {
    //       id: Number(courseId),
    //     },
    //     include: {
    //       installments: {
    //         where: {
    //           id: Number(installmentTypeId),
    //         },
    //       },
    //     },
    //   }
    // );

    // 🔍 Fetch course fee structure
    const courseFeeStructure = await tenantPrisma.courseFeeStructure.findUnique({
      where: {
        id: Number(courseId),
      },
      include: paymentType === "INSTALLMENT"
        ? {
            installments: {
              where: {
                id: Number(installmentTypeId),
              },
            },
          }
        : undefined, // ✅ Use undefined instead of false
    });

    console.log(
      "GET CPURSE FEE STURCURE FOR STUDENT INPORTANT:",
      courseFeeStructure
    );

    if (!courseFeeStructure) {
      return res
        .status(402)
        .json({ message: "Course Fee Structure not Found!" });
    }

     // Create StudentCourse
    const startDate = new Date(admissionDate);
    const endDate = new Date(startDate);
    if (courseExists.durationMonths) {
      const targetMonth = startDate.getMonth() + courseExists.durationMonths;
      endDate.setMonth(targetMonth);

      // Fix overflow (e.g., Feb issue)
      if (endDate.getDate() !== startDate.getDate()) {
        endDate.setDate(0); // last day of previous month
      }
    }

    // 🔗 5. Attach student to course
    const studentCourse = await tenantPrisma.studentCourse.create({
      data: {
        studentId: student.id,
        courseId: Number(courseId),
        batchId: Number(batchId),
        studentCode: student.studentCode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "ACTIVE",
        clientAdminId,
      },
    });

    console.log("GET STUDENT COURSE IN ADD COURSE TO STUDENT:", studentCourse);

    // 💰 6. Create FeeStructure
    const feeStructure = await tenantPrisma.feeStructure.create({
      data: {
        studentId: student.id,
        courseId: Number(courseId),
        totalAmount: parseFloat(feeAmount), // from req.body
        paymentType, // from req.body ('ONE_TIME' or 'INSTALLMENT')
        clientAdminId,

        // installmentTypeId: Number(installmentTypeId || null),

        // Only set installmentTypeId if payment type is INSTALLMENT
        installmentTypeId:
          paymentType === "INSTALLMENT" && installmentTypeId
            ? Number(installmentTypeId)
            : null,
      },
    });

    // 💳 7. Create StudentFee
    const studentFee = await tenantPrisma.studentFee.create({
      data: {
        studentId: student.id,
        courseId: Number(courseId),
        dueDate: new Date(admissionDate),
        amountDue: feeStructure.totalAmount,
        amountPaid: 0,
        paymentMode: "CASH",
        receiptNo: `RCP${Date.now()}`,
        paymentStatus: "PENDING",
        clientAdminId,
      },
    });

    // 🖥️ 8. Allocate PC in Lab Time Slot
    // 🖥️ Allocate PC if batch has lab time slot
    // 🧩 Inside addStudentController, replace allocation section with:
    if (batchExists.labTimeSlotId) {
      await tenantPrisma.$transaction(async (tx) => {
        // 🧠 Step 1: Get the timeslot + its lab + current allocations
        const labTimeSlot = await tx.labTimeSlot.findUnique({
          where: { id: batchExists.labTimeSlotId },
          include: { allocations: true, lab: true },
        });

        if (!labTimeSlot) throw new Error("Lab time slot not found");

        const totalPCs = labTimeSlot.lab.totalPCs; // from the Lab model
        const usedPCs = labTimeSlot.allocations.length;
        const freePCs = labTimeSlot.availablePCs; // how many PCs are left unallocated

        // 🧠 Step 1: Fetch all allocated PCs
        const allocatedPCs = labTimeSlot.allocations.map((a) => a.pcNumber);

        // 🧩 Step 2: Find the next free PC number
        let nextPcNumber = null;
        for (let i = 1; i <= totalPCs; i++) {
          if (!allocatedPCs.includes(i)) {
            nextPcNumber = i;
            break;
          }
        }

        if (!nextPcNumber) {
          throw new Error("No free PCs available in this lab time slot");
        }

        console.log(
          "💻 Lab PCs — Total:",
          totalPCs,
          "Used:",
          usedPCs,
          "Free:",
          freePCs
        );

        // // 💻 Step 2: Allocate one PC
        // await tx.labAllocation.create({
        //   data: {
        //     labTimeSlotId: labTimeSlot.id,
        //     studentId: student.id,
        //     pcNumber: usedPCs + 1, // next available PC number
        //     clientAdminId,
        //   },
        // });

        // // 🔁 Step 3: Update availablePCs count (decrement by 1)
        // await tx.labTimeSlot.update({
        //   where: { id: labTimeSlot.id },
        //   data: {
        //     availablePCs: { decrement: 1 },
        //   },
        // });

        // 💻 Step 3: Allocate that PC
        await tx.labAllocation.create({
          data: {
            labTimeSlotId: labTimeSlot.id,
            studentId: student.id,
            pcNumber: nextPcNumber, // ✅ Now guaranteed unique
            clientAdminId,
          },
        });

        // 🔁 Step 4: Update availablePCs
        await tx.labTimeSlot.update({
          where: { id: labTimeSlot.id },
          data: {
            availablePCs: { decrement: 1 },
          },
        });
      });
    }

    // ✅ Fetch paginated, sorted, and filtered enquiries
    const getStudents = await tenantPrisma.student.findMany({
      where: {
          clientAdminId
      },
      // orderBy:
      // sortField && sortField !== "leadStatus"
      //   ? { [sortField as string]: sortOrder === "asc" ? "asc" : "desc" }
      //   : undefined,
      include: {
        labAllocations: true,
        studentCourses: true,
      },
    });

    return res.status(201).json({
      message: `Course "${courseExists.name}" added to student successfully`,
      studentCourse,
      feeStructure,
      studentFee,
      getStudents
    });
  } catch (err) {
    console.error("❌ Error adding course to student:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function addCourseController(req: Request, res: Response) {
  const {
    name,
    durationMonths,
    description,
    totalAmount,
    paymentType,
    installmentCount,
    installments,
  } = req.body;

  console.log("GET COURSE DATA in REQ>BODY:", req.body);

  if (!name || !durationMonths || !totalAmount) {
    return res.status(400).json({
      error: "name, durationMonths, totalAmount & paymentType are required",
    });
  }

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const normalizeCourseName = titleCase(name);

    // ✅ Step 1: Create Course
    const course = await tenantPrisma.course.create({
      data: {
        name: normalizeCourseName,
        durationMonths: parseInt(durationMonths),
        description,
        clientAdminId: user.clientAdminId,
      },
    });

    console.log("COURSE IS CREATED:", course);

    // ✅ Step 2: Create Fee Structure
    const feeStructure = await tenantPrisma.courseFeeStructure.create({
      data: {
        courseId: course.id,
        clientAdminId: user.clientAdminId,
        totalAmount: parseFloat(totalAmount),
        paymentType: paymentType || null,
      },
    });

    await tenantPrisma.$transaction(async (tx) => {
      if (paymentType.includes("INSTALLMENT")) {
        await tx.installmentDetail.createMany({
          data: installments.map(
            (i: { installment: Number; addAmount: Number }) => ({
              CourseFeeStructureId: feeStructure.id,
              number: Number(i.installment),
              amount: Number(i.addAmount),
            })
          ),
        });
      }
    });

    return res.status(201).json({
      message: "Course created successfully ✅",
      course,
      feeStructure,
    });
  } catch (err: any) {
    console.error("Error creating course:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Course already exists ❌",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateCourseController(req: Request, res: Response) {
  const {
    name,
    durationMonths,
    description,
    totalAmount,
    paymentType,
    installments,
  } = req.body;

  const { id } = req.params;

  if (!name || !durationMonths || !totalAmount || !paymentType) {
    return res.status(400).json({
      error: "name, durationMonths, totalAmount & paymentType are required",
    });
  }
  console.log("GET UPDATE COURSE DATA In UPDATE COURSE CONTROLLER:", req.body);

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
    //   where: { email: user.email }
    // });

    // if (!clientAdmin) {
    //   return res.status(404).json({ error: "Client admin not found" });
    // }

    const getCourseData = await tenantPrisma.course.findUnique({
      where: {
        id: Number(id),
      },
    });

    const getFeeStructure = await tenantPrisma.courseFeeStructure.findUnique({
      where: {
        courseId: Number(id),
      },
      include: {
        installments: true,
      },
    });

    console.log("GET UPDATE COURSE DATA:", getCourseData);
    console.log("GET UPDATE COURSE FEE STRUCTURE DATA:", getFeeStructure);

    // ✅ Step 1: Create Course
    const course = await tenantPrisma.course.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        durationMonths: parseInt(durationMonths),
        description,
        clientAdminId: user.clientAdminId,
      },
    });

    // // ✅ Step 2: Create Fee Structure
    const feeStructure = await tenantPrisma.courseFeeStructure.update({
      where: {
        courseId: Number(id),
      },
      data: {
        courseId: course.id,
        clientAdminId: user.clientAdminId,
        totalAmount: parseFloat(totalAmount),
        paymentType,
      },
    });

    // await tenantPrisma.$transaction(async (tx) => {
    //   if (paymentType.includes("INSTALLMENT") && installments.length >= 0) {
    //     await tx.installmentDetail.updateMany({
    //       where: {
    //         CourseFeeStructureId: Number(feeStructure.id),
    //       },
    //       data: installments.map(
    //         (i: { installment: Number; addAmount: Number }) => ({
    //           CourseFeeStructureId: feeStructure.id,
    //           number: Number(i.installment),
    //           amount: Number(i.addAmount),
    //         })
    //       ),
    //     });
    //   }
    // });

    await tenantPrisma.$transaction(async (tx) => {
      if (paymentType.includes("INSTALLMENT") && installments.length > 0) {
        // Delete old installments
        await tx.installmentDetail.deleteMany({
          where: {
            CourseFeeStructureId: Number(feeStructure.id),
          },
        });

        // Insert new installments
        await tx.installmentDetail.createMany({
          data: installments.map((i: any) => ({
            CourseFeeStructureId: feeStructure.id,
            number: Number(i.installment),
            amount: Number(i.addAmount),
          })),
        });
      }
    });

    const getNewFeeStructure = await tenantPrisma.courseFeeStructure.findUnique(
      {
        where: {
          courseId: course.id,
        },
        include: {
          installments: true,
        },
      }
    );

    console.log(
      "GET UPDATED COURSE DATA IN UPDATE COURES CONTROLLER NOW:",
      course,
      getNewFeeStructure
    );

    return res.status(201).json({
      message: "Course created successfully ✅",
      feeStructure,
      course,
    });
  } catch (err: any) {
    console.error("Error creating course:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Course already exists ❌",
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}

// export async function getCourseController(req: Request, res: Response) {
//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     console.log("Get tenant user in getCourseController", user);

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const clientAdminId = user.clientAdminId;

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
//     if (!allClientAdmin) {
//       return res.status(404).json({ error: "Client admin not found" });
//     }

//     console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

//     // 2.1 ✅ Extract query params
//     const {
//       page,
//       limit,
//       search,
//       sortField, // default sort by created date
//       sortOrder, // default descending
//       leadStatus, // 👈 Add this
//     } = req.query;

//     console.log("get ALl Params:", sortField, sortOrder);

//     // const pageNum = parseInt(page as string, 10);
//     // const limitNum = parseInt(limit as string, 10);
//     // const skip = (pageNum - 1) * limitNum;

//     const pageNum = parseInt(page as string, 20) || 1;
//     const limitNum = parseInt(limit as string, 20) || 10;
//     const skip = (pageNum - 1) * limitNum;

//     // ✅ Build search filter
//     // const where: any = {};
//     // if (search) {
//     //   where.OR = [
//     //     { name: { contains: search, mode: "insensitive" } },
//     //     // Add more searchable fields as needed
//     //   ];
//     // }

//     const where = {
//       clientAdminId,
//       ...(search
//         ? {
//             OR: [
//               { name: { contains: search as string } },
//             ],
//           }
//         : {}),
//     };

//     // 3. Create student under that admin
//     // const enquiry = await tenantPrisma.enquiry.findMany({
//     // });

//     // ✅ Fetch paginated, sorted, and filtered enquiries
//     // const course = await tenantPrisma.course.findMany({
//     //   where,
//     //   // orderBy: {
//     //   //   [sortField as string]: sortOrder === "asc" ? "asc" : "desc",
//     //   // },
//     //   skip,
//     //   take: limitNum,
//     //   include: {
//     //     courseFeeStructure: true,
//     //   },
//     // });

//     const course = await tenantPrisma.course.findMany({
//       where,
//       skip,
//       take: limitNum,
//       include: {
//         courseFeeStructure: {
//           include: {
//             installments: true, // 👈 return ALL installment details
//           },
//         },
//       },
//     });

//     // ✅ Total count (for frontend pagination)
//     const total = await tenantPrisma.course.count({ where });
//     const totalPages = Math.ceil(total / limitNum);

//     console.log(
//       "Courses Fetched Successfully",
//       course,
//       totalPages,
//       pageNum,
//       limitNum
//     );

//     return res.status(200).json({
//       message: "Courses fetched successfully",
//       course,
//       total,
//       page: pageNum,
//       limit: limitNum,
//     });

//     //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
//   } catch (err) {
//     console.error("Error Fetched Courses:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function getCourseController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("GET COURSE QUERY:", req.query);

    const query = courseQuerySchema.parse(req.query);

    const result = await getCourses({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    console.log("Courses Fetched Successfully in getCourseConTroller", result.data);

    return res.status(200).json({
      message: "Courses fetched successfully",
      course: result.data,
      total: result.total,
      totalPages: result.totalPages,
      page: query.page,
      limit: query.limit,
    });

  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllCourseController(req: Request, res: Response) {
  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    console.log("Get tenant user in getCourseController", user);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // 2. Get client admin (we assume there's only one per tenant for now)
    const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
    if (!allClientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

    console.log("GET ALL COURSE QUERY:");

    // ✅ Fetch paginated, sorted, and filtered enquiries
    const course = await tenantPrisma.course.findMany({
      include: {
        courseFeeStructure: {
          include: {
            installments: true, // 👈 return ALL installment details
          },
        },
      },
    });

    console.log("Courses Fetched Successfully in getAllCourseConTroller", course);

    return res.status(200).json({
      message: "Courses fetched successfully",
      course,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error("Error Fetched Courses:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
// export async function markCourseAsCompleted(req: Request, res: Response) {
//   try {
//     const { studentId, studentCourseId, feedback, remarks } = req.body;

//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const clientAdminId = user.clientAdminId;

//     if (!studentId || !studentCourseId) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // ✅ Check if student and studentCourse exist
//     const student = await tenantPrisma.student.findUnique({
//       where: { id: Number(studentId) },
//     });
//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     const studentCourse = await tenantPrisma.studentCourse.findUnique({
//       where: { id: Number(studentCourseId) },
//       include: { course: true },
//     });
//     if (!studentCourse) {
//       return res.status(404).json({ error: "StudentCourse not found" });
//     }

//     // ✅ Prevent duplicate completions
//     const existingCompletion = await tenantPrisma.courseCompletion.findFirst({
//       where: {
//         studentId: Number(studentId),
//         studentCourseId: Number(studentCourseId),
//       },
//     });

//     if (existingCompletion) {
//       return res.status(400).json({
//         error: `Course "${studentCourse.course.name}" is already marked as completed for this student.`,
//       });
//     }

//     // ✅ Create a new CourseCompletion record
//     const completion = await tenantPrisma.courseCompletion.create({
//       data: {
//         studentId: Number(studentId),
//         studentCourseId: Number(studentCourseId),
//         completionDate: new Date(),
//         feedback: feedback || null,
//         remarks: remarks || null,
//         clientAdminId,
//       },
//       include: {
//         studentCourse: {
//           include: { course: true },
//         },
//         student: true,
//       },
//     });

//     // ✅ Optionally, update StudentCourse status to "COMPLETED"
//     await tenantPrisma.studentCourse.update({
//       where: { id: Number(studentCourseId) },
//       data: { status: "COMPLETED" },
//     });

//     return res.status(201).json({
//       message: `Course "${studentCourse.course.name}" marked as completed for ${student.fullName}`,
//       completion,
//     });
//   } catch (err) {
//     console.error("❌ Error marking course as completed:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// controllers/courseCompletionController.ts

// export async function markCourseAsCompleted(req: Request, res: Response) {
//   try {
//     const { studentId, studentCourseId, feedback, remarks } = req.body;
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const clientAdminId = user.clientAdminId;

//     if (!studentId || !studentCourseId) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // ✅ Validate student
//     const student = await tenantPrisma.student.findUnique({
//       where: { id: Number(studentId) },
//     });
//     if (!student) return res.status(404).json({ error: "Student not found" });

//     // ✅ Validate studentCourse
//     const studentCourse = await tenantPrisma.studentCourse.findUnique({
//       where: { id: Number(studentCourseId) },
//       include: { course: true, batch: true },
//     });
//     if (!studentCourse)
//       return res.status(404).json({ error: "StudentCourse not found" });

//     // ✅ Prevent duplicate completions
//     const existingCompletion = await tenantPrisma.courseCompletion.findFirst({
//       where: {
//         studentId: Number(studentId),
//         studentCourseId: Number(studentCourseId),
//       },
//     });
//     if (existingCompletion) {
//       return res.status(400).json({
//         error: `Course "${studentCourse.course.name}" is already marked as completed for this student.`,
//       });
//     }

//     // ✅ Create new completion record
//     const completion = await tenantPrisma.courseCompletion.create({
//       data: {
//         studentId: Number(studentId),
//         studentCourseId: Number(studentCourseId),
//         completionDate: new Date(),
//         feedback: feedback || null,
//         remarks: remarks || null,
//         clientAdminId,
//       },
//       include: {
//         studentCourse: { include: { course: true } },
//         student: true,
//       },
//     });

//     // ✅ Update StudentCourse status
//     await tenantPrisma.studentCourse.update({
//       where: { id: Number(studentCourseId) },
//       data: { status: "COMPLETED" },
//     });

//     // 🖥️ Free up the lab PC (if allocated)
//     const labAllocation = await tenantPrisma.labAllocation.findFirst({
//       where: { studentId: Number(studentId) },
//       include: { labTimeSlot: { include: { lab: true, allocations: true } } },
//     });

//     if (labAllocation) {
//       await tenantPrisma.$transaction(async (tx) => {
//         const labTimeSlotId = labAllocation.labTimeSlotId;

//         // 🗑️ 1. Delete the student's PC allocation
//         await tx.labAllocation.delete({
//           where: { id: labAllocation.id },
//         });

//         // 🧮 2. Recalculate used PCs after deletion
//         const remainingAllocations = await tx.labAllocation.count({
//           where: { labTimeSlotId },
//         });

//         // 🧩 3. Get total PCs from the lab
//         const lab = await tx.lab.findUnique({
//           where: { id: labAllocation.labTimeSlot.labId },
//           select: { totalPCs: true },
//         });

//         if (!lab) throw new Error("Lab not found");

//         // ✅ 4. Set available PCs correctly (no over/underflow)
//         const availablePCs = lab.totalPCs - remainingAllocations;

//         await tx.labTimeSlot.update({
//           where: { id: labTimeSlotId },
//           data: { availablePCs },
//         });
//       });
//     }

//     return res.status(201).json({
//       message: `✅ Course "${studentCourse.course.name}" marked as completed for ${student.fullName}.`,
//       completion,
//     });
//   } catch (err) {
//     console.error("❌ Error marking course as completed:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function markCourseAsCompleted(req: Request, res: Response) {
  try {
    const { studentId, studentCourseId, feedback, remarks, completionDate } = req.body;
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const clientAdminId = user.clientAdminId;

    if (!studentId || !studentCourseId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const getClientAdminData = await tenantPrisma.clientAdmin.findUnique({
      where: {
        id: clientAdminId,
      },
    });

    if (!getClientAdminData) {
      return res.status(402).json({ message: "CAnnot Find CLientAdmin" });
    }

    console.log("GET CLIENTADMIN DATA IN COUYSE UFATEION:", getClientAdminData);

    // ✅ Validate student
    const student = await tenantPrisma.student.findUnique({
      where: { id: Number(studentId) },
    });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // ✅ Validate studentCourse
    const studentCourse = await tenantPrisma.studentCourse.findUnique({
      where: { id: Number(studentCourseId) },
      include: { course: true, batch: true },
    });
    if (!studentCourse)
      return res.status(404).json({ error: "StudentCourse not found" });

    // ✅ Prevent duplicate completions
    const existingCompletion = await tenantPrisma.courseCompletion.findFirst({
      where: {
        studentId: Number(studentId),
        studentCourseId: Number(studentCourseId),
      },
    });
    if (existingCompletion) {
      return res.status(400).json({
        error: `Course "${studentCourse.course.name}" is already marked as completed.`,
      });
    }

    const parsedCompletionDate = parseDate(completionDate);

    // ✅ Create new completion record
    const completion = await tenantPrisma.courseCompletion.create({
      data: {
        studentId: Number(studentId),
        studentCourseId: Number(studentCourseId),
        completionDate: parsedCompletionDate ?? new Date(),
        feedback: feedback || null,
        remarks: remarks || null,
        clientAdminId,
      },
      include: {
        studentCourse: { include: { course: true } },
        student: true,
      },
    });

    // ✅ Update StudentCourse status
    await tenantPrisma.studentCourse.update({
      where: { id: Number(studentCourseId) },
      data: { status: "COMPLETED" },
    });

    console.log("GET CERTIFICATES NAME:", user.certificateName);
    console.log("GET USER DATA:", user);

    // 🧾 Generate certificate PDF
    const certificatePath = await generateCertificate({
      studentName: student.fullName,
      courseName: studentCourse.course.name,
      completionDate: new Date(),
      ceoName: "lorem Ipsum", 
      headName: "lorem Ipsum",
      certificateName: getClientAdminData.certificateName || "certificate-template-1.png",
      outputDir: path.join(process.cwd(), "uploads/certificates"),
    });

    // 🔗 Convert local path → public URL
    const fileName = path.basename(certificatePath);
    const publicUrl = `${
      process.env.SERVER_URL || "http://localhost:5001"
    }/uploads/certificates/${fileName}`;

    // 📦 Save certificate record
    const certificate = await tenantPrisma.certificate.create({
      data: {
        studentId: student.id,
        courseId: studentCourse.course.id,
        studentCourseId: studentCourse.id,
        issueDate: new Date(),
        certificateUrl: publicUrl,
        clientAdminId,
      },
    });

    // 🧮 Optional: free PC if allocated (same logic as before)
    const labAllocation = await tenantPrisma.labAllocation.findFirst({
      where: { studentId: Number(studentId) },
      include: { labTimeSlot: { include: { lab: true, allocations: true } } },
    });

    if (labAllocation) {
      await tenantPrisma.$transaction(async (tx) => {
        const labTimeSlotId = labAllocation.labTimeSlotId;

        await tx.labAllocation.delete({ where: { id: labAllocation.id } });

        const remaining = await tx.labAllocation.count({
          where: { labTimeSlotId },
        });
        const lab = await tx.lab.findUnique({
          where: { id: labAllocation.labTimeSlot.labId },
          select: { totalPCs: true },
        });

        if (lab) {
          await tx.labTimeSlot.update({
            where: { id: labTimeSlotId },
            data: { availablePCs: lab.totalPCs - remaining },
          });
        }
      });
    }

    return res.status(201).json({
      message: `✅ Course "${studentCourse.course.name}" marked as completed for ${student.fullName}.`,
      completion,
      certificate,
    });
  } catch (err) {
    console.error("❌ Error marking course as completed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
