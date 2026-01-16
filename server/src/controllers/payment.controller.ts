// controllers/studentController.ts
import { Request, Response } from "express";
import { getPayment } from "../services/payment.service";
import { paymentQuerySchema } from "../validators/payment.query";

export async function addStudentPaymentController(req: Request, res: Response) {
  const {
    id,
    name,
    contact,
    email,
    residentialAddress,
    permenantAddress,
    idProofType,
    idProofNumber,
    admissionDate,
    course, // <-- course name as string
    feeAmount, // 💵 New
    paymentType, // e.g., 'ONE_TIME' or 'INSTALLMENT'
    religion,
    fatherName,
    motherName,
    dob,
    gender,
    parentsContact,
  } = req.body;

  console.log("Student data in addStudentCourseController", req.body);

  if (
    !name ||
    !contact ||
    !admissionDate ||
    !course ||
    !fatherName ||
    !dob ||
    !gender
  ) {
    return res
      .status(400)
      .json({ error: "Missing required student information" });
  }

  if (!feeAmount || !paymentType) {
    return res
      .status(400)
      .json({ error: "Fee amount and payment type are required" });
  }

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
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    const clientAdminId = user.clientAdminId;

    // 🔍 1. Check if course with the given name exists
    let courseRecord = await tenantPrisma.course.findFirst({
      where: {
        name: course,
      },
    });

    // ➕ 2. If not, create the course
    if (!courseRecord) {
      courseRecord = await tenantPrisma.course.create({
        data: {
          name: course,
          durationWeeks: 12, // default duration — change if needed
          description: `${course} course`,
          clientAdminId,
        },
      });

      console.log(`🆕 Created new course: ${courseRecord.name}`);
    }

    const courseId = courseRecord.id;

    // 🎓 3. Generate unique student code
    // const lastStudent = await tenantPrisma.student.findFirst({
    //   orderBy: { id: 'desc' },
    //   select: { studentCode: true },
    // });

    // let studentCode = 'SD001';
    // if (lastStudent?.studentCode) {
    //   const num = parseInt(lastStudent.studentCode.slice(2)) + 1;
    //   studentCode = `SD${num.toString().padStart(3, '0')}`;
    // }

    // 🎓 3. Generate unique student code
    const lastStudent = await tenantPrisma.student.findFirst({
      orderBy: { id: "desc" },
      select: { studentCode: true, serialNumber: true },
    });

    let studentCode = "SD001";
    let serialNumber = 1;

    if (lastStudent?.studentCode) {
      const num = parseInt(lastStudent.studentCode.slice(2)) + 1;
      studentCode = `SD${num.toString().padStart(3, "0")}`;
    }

    if (lastStudent?.serialNumber) {
      serialNumber = lastStudent.serialNumber + 1;
    }

    // 👤 4. Create student
    // 👤 4. Create student
    const student = await tenantPrisma.student.create({
      data: {
        serialNumber, // ✅ Include this
        studentCode,
        fullName: name,
        contact: contact,
        email,
        residentialAddress,
        permenantAddress,
        idProofType,
        idProofNumber,
        admissionDate: new Date(admissionDate),
        clientAdminId,

        // ✅ Add the missing required fields
        religion: req.body.religion,
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        parentsContact: req.body.parentsContact,
        dob: req.body.dob, // Make sure this is a valid string (e.g., '2003-05-25')
        gender: req.body.gender,
      },
    });

    // 🔗 5. Attach student to course
    const studentCourse = await tenantPrisma.studentCourse.create({
      data: {
        studentId: student.id,
        courseId,
        studentCode: student.studentCode,
        startDate: new Date(admissionDate),
        endDate: new Date(admissionDate), // can adjust using course duration later
        status: "ACTIVE",
        clientAdminId,
      },
    });

    // 💰 6. Create FeeStructure
    const feeStructure = await tenantPrisma.feeStructure.create({
      data: {
        studentId: student.id,
        courseId,
        totalAmount: parseFloat(feeAmount), // from req.body
        paymentType, // from req.body ('ONE_TIME' or 'INSTALLMENT')
        clientAdminId,
      },
    });

    // 💳 7. Create StudentFee
    const studentFee = await tenantPrisma.studentFee.create({
      data: {
        studentId: student.id,
        courseId,
        dueDate: new Date(admissionDate),
        amountDue: feeStructure.totalAmount,
        amountPaid: 0,
        paymentMode: "CASH",
        receiptNo: `RCP${Date.now()}`,
        paymentStatus: "PENDING",
        clientAdminId,
      },
    });

    if (id) {
      await tenantPrisma.enquiry.update({
        where: { id: id },
        data: {
          studentId: student.id,
          isConverted: true,
        },
      });
    }

    const getAllStudent = await tenantPrisma.student.findMany();

    console.log("✅ Student, course and fee created successfully.");

    return res.status(201).json({
      message: "Student admission created successfully",
      student,
      studentCourse,
      studentFee,
      getAllStudent,
    });
  } catch (err) {
    console.error("❌ Error creating student:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// export async function getStudentPaymenController(req: Request, res: Response) {
//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     console.log("Get tenant user in getEnquiryController", user);

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const email = user.email;

//     const clientAdminId = user.clientAdminId

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
//       sortField = "paymentDate", // default sort by created date
//       sortOrder = "desc", // default descending
//       paymentStatus,
//       paymentMode,
//       fromDate,
//       toDate,
//     } = req.query;

//     console.log(
//       "get ALl Params:",
//       sortField,
//       sortOrder,
//       paymentStatus,
//       paymentMode,
//       fromDate,
//       toDate
//     );

//     const pageNum = parseInt(page as string, 10) || 1;
//     const limitNum = parseInt(limit as string, 10) || 10;
//     const skip = (pageNum - 1) * limitNum;

//     // ✅ Build WHERE dynamically
//     const where: any = {
//       clientAdminId,
//       ...(search && {
//         OR: [
//           { receiptNo: { contains: search } },
//           {
//             student: {
//               OR: [
//                 { fullName: { contains: search } },
//                 { email: { contains: search } },
//                 { studentCode: { contains: search } },
//                 { contact: { contains: search } },
//               ],
//             },
//           },
//           {
//             course: {
//               OR: [
//                 { name: { contains: search} },
//                 { description: { contains: search} },
//               ],
//             },
//           },
//         ],
//       }),

//       // ✅ Apply optional filters
//       ...(paymentStatus && { paymentStatus: paymentStatus }),
//       ...(paymentMode && { paymentMode: paymentMode }),
//       ...(fromDate &&
//         toDate && {
//           paymentDate: {
//             gte: new Date(fromDate as string),
//             lte: new Date(toDate as string),
//           },
//         }),
//       ...(fromDate &&
//         !toDate && { paymentDate: { gte: new Date(fromDate as string) } }),
//       ...(!fromDate &&
//         toDate && { paymentDate: { lte: new Date(toDate as string) } }),
//     };

//     // 3. Create student under that admin
//     // const enquiry = await tenantPrisma.enquiry.findMany({
//     // });

//     // ✅ Fetch paginated, sorted, and filtered enquiries
//     const studentPayment = await tenantPrisma.studentFee.findMany({
//       where,
//       orderBy: {
//         [sortField as string]: sortOrder === "asc" ? "asc" : "desc",
//       },
//       // orderBy:
//       // sortField && sortField !== "leadStatus"
//       //   ? { [sortField as string]: sortOrder === "asc" ? "asc" : "desc" }
//       //   : undefined,
//       skip,
//       take: limitNum,
//       include: {
//         student: true, // 👈 includes related Student
//         course: true, // 👈 includes related Course
//         feeStructure: true,
//         feeLogs: true,
//       },
//     });

//     // ✅ Total count (for frontend pagination)
//     const totalPages = await tenantPrisma.studentFee.count({ where });

//     if (!studentPayment) {
//       return res.status(404).json({ error: "studentPayment not found" });
//     }

//     const detailedCourses = await Promise.all(
//       studentPayment.map(async (sc) => {
//         const feeStructure = await tenantPrisma.feeStructure.findUnique({
//           where: {
//             studentId_courseId: {
//               studentId: sc.studentId,
//               courseId: sc.courseId,
//             },
//           },
//         });

//         const feeRecords = await tenantPrisma.studentFee.findMany({
//           where: {
//             studentId: sc.studentId,
//             courseId: sc.courseId,
//           },
//         });

//         return {
//           studentPayment: sc,
//           feeStructure,
//           feeRecords,
//         };
//       })
//     );

//     console.log(
//       "Student Course Fetched Successfully",
//       studentPayment,
//       detailedCourses,
//       totalPages,
//       pageNum,
//       limitNum
//     );

//     return res.status(200).json({
//       message: "Student Course fetched successfully",
//       studentPayment,
//       detailedCourses,
//       totalPages,
//       page: pageNum,
//       limit: limitNum,
//     });

//     //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
//   } catch (err) {
//     console.error("Error Fetched Enquiry:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function getStudentPaymentController(
  req: Request,
  res: Response
) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const query = paymentQuerySchema.parse(req.query);

    const result = await getPayment({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    console.log("Payments:", result);

    return res.json({
      message: "Payments fetched successfully",
      ...result,
      page: query.page,
      limit: query.limit,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    console.error("Error fetching payments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getStudentPaymenbyIdController(
  req: Request,
  res: Response
) {
  const { id } = req.params;

  console.log("Get Stiudent Id in GetStudentCourseControlle:", id);

  try {
    // 1. Use values injected by middleware
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;
    const tenant = req.tenantInfo;

    console.log("Get tenant user in getEnquiryController", user);

    console.log("Get tenant Info in getEnquiryController", tenant);

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    // console.log("get ClientAdmin in getEnquiryController:", clientAdmin);

    // 2. Get client admin (we assume there's only one per tenant for now)
    const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
    if (!allClientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

    const studentCourses = await tenantPrisma.studentCourse.findMany({
      where: { studentId: parseInt(id) },
    });

    const detailedCourses = await Promise.all(
      studentCourses.map(async (sc) => {
        const feeStructure = await tenantPrisma.feeStructure.findUnique({
          where: {
            studentId_courseId: {
              studentId: sc.studentId,
              courseId: sc.courseId,
            },
          },
        });

        const feeRecords = await tenantPrisma.studentFee.findMany({
          where: {
            studentId: sc.studentId,
            courseId: sc.courseId,
          },
        });

        return {
          studentCourse: sc,
          feeStructure,
          feeRecords,
        };
      })
    );

    return res.status(200).json({
      message: "Students Course fetched successfully",
      detailedCourses,
    });

    //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
  } catch (err) {
    console.error("Error Fetched Enquiry:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /api/student/payment/:id
// export async function updateStudentPaymentController(req: Request, res: Response) {
//   const { id } = req.params;
//   const {
//     amountPaid,
//     paymentDate,
//     paymentMode,
//     paymentStatus,
//   } = req.body;

//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === 'string') {
//       return res.status(401).json({ error: 'Unauthorized request' });
//     }

//     // Validate existence
//     const existingPayment = await tenantPrisma.studentFee.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!existingPayment) {
//       return res.status(404).json({ error: 'Payment record not found' });
//     }

//     // Update payment details
//     const updatedPayment = await tenantPrisma.studentFee.update({
//       where: { id: parseInt(id) },
//       data: {
//         amountPaid: parseFloat(amountPaid),
//         paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
//         paymentMode,
//         paymentStatus,
//       },
//     });

//     return res.status(200).json({
//       message: 'Payment updated successfully',
//       payment: updatedPayment,
//     });
//   } catch (error) {
//     console.error('❌ Error updating payment:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

// PUT /api/student/payment/:id
// export async function updateStudentPaymentController(req: Request, res: Response) {
//   const { id } = req.params;
//   const {
//     amountPaid,
//     paymentDate,
//     paymentMode,
//     paymentStatus, // optional
//   } = req.body;

//   console.log("Get New amount student Payment Data:", amountPaid);

//   try {
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     if (!tenantPrisma || !user || typeof user === 'string') {
//       return res.status(401).json({ error: 'Unauthorized request' });
//     }

//     const newAmountPaid = amountPaid;

//     console.log("get New Amount Paid By Student:", newAmountPaid);

//     // 1️⃣ Fetch existing payment and its fee structure
//     const existingPayment = await tenantPrisma.studentFee.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         feeStructure: true,
//       },
//     });

//     if (!existingPayment || !existingPayment.feeStructure) {
//       return res.status(404).json({ error: 'Payment record not found' });
//     }

//     console.log("get payment Details:", existingPayment);
//     console.log("get Total Amout:", existingPayment.feeStructure.totalAmount);

//     const { studentId, courseId, feeStructure } = existingPayment;
//     const paidAmount = parseFloat(amountPaid); //20k
//     const previousPaid = existingPayment.amountPaid ?? 0; //22k
//     const totalPaid = previousPaid + paidAmount; //42k
//     const totalDue = existingPayment.amountDue; //38k
//     const remainingDue = totalDue - totalPaid; //58k - 22k since totlaDue was 58k

//     const totalCourseAmount = feeStructure.totalAmount; //60k

//     // 2️⃣ Fetch ALL payments for this student and course to calculate total paid
//     const allPayments = await tenantPrisma.studentFee.findMany({
//       where: {
//         studentId,
//         courseId,
//       },
//     });

//     const newStatus = paymentStatus || (remainingDue <= 0 ? "SUCCESS" : "PENDING");

//     const payment = await tenantPrisma.studentFee.update({
//       where: { id: parseInt(id) },
//       data: {
//         amountPaid: totalPaid,
//         amountDue: remainingDue > 0 ? remainingDue : 0,
//         paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
//         paymentMode,
//         paymentStatus: newStatus,
//       },
//     });

//     return res.status(200).json({
//       message: 'Payment updated successfully',
//       payment,
//     });
//   } catch (error) {
//     console.error('❌ Error updating payment:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

export async function updateStudentPaymentController(
  req: Request,
  res: Response
) {
  const { id } = req.params;
  const { amountPaid, paymentDate, paymentMode } = req.body;

  console.log(
    "GET PAYMENT UPDATE DETAILS in UPDATEPAYMENTCONTROLLER:",
    req.body
  );

  try {
    const tenantPrisma = req.tenantPrisma;
    const user = req.user;

    if (!tenantPrisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const email = user.email;

    // 2. Get client admin (we assume there's only one per tenant for now)
    // const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
    // if (!clientAdmin) {
    //   return res.status(404).json({ error: 'Client admin not found' });
    // }

    // console.log("get ClientAdmin in getEnquiryController:", clientAdmin);

    const clientAdminId = user.clientAdminId;

    const studentFee = await tenantPrisma.studentFee.findUnique({
      where: { id: parseInt(id) },
      include: {
        feeStructure: true,
        feeLogs: true,
      },
    });

    if (!studentFee || !studentFee.feeStructure) {
      return res.status(404).json({ error: "StudentFee not found" });
    }

    const { studentId, courseId, feeStructure } = studentFee;
    const paidAmount = parseFloat(amountPaid);

    const student = await tenantPrisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Studen not found" });
    }

    const course = await tenantPrisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Studen not found" });
    }

    // 1️⃣ Add new payment log
    const log = await tenantPrisma.studentFeeLog.create({
      data: {
        studentFeeId: studentFee.id,
        amountPaid: paidAmount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMode,
        receiptNo: `RCP${Date.now()}`,
      },
    });

    // 2️⃣ Recalculate totals
    const allLogs = await tenantPrisma.studentFeeLog.findMany({
      where: { studentFeeId: studentFee.id },
    });

    const totalPaid = allLogs.reduce((sum, log) => sum + log.amountPaid, 0);
    const remainingDue = Math.max(feeStructure.totalAmount - totalPaid, 0);
    const paymentStatus = remainingDue <= 0 ? "SUCCESS" : "PENDING";

    // 3️⃣ Update main StudentFee summary
    const payment = await tenantPrisma.studentFee.update({
      where: { id: studentFee.id },
      data: {
        amountPaid: totalPaid,
        amountDue: remainingDue,
        paymentStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    // ✅ Step 7: Log the transaction in FinancialRecord
    await tenantPrisma.financialRecord.create({
      data: {
        clientAdminId: clientAdminId,
        recordType: "INCOME",
        amount: paidAmount, // ✅ use the *current* payment, not cumulative
        paymentMode,
        date: paymentDate ? new Date(paymentDate) : new Date(),
        description: `Fee payment of ₹${paidAmount} from ${student.fullName} for ${course.name}`,
        studentId: student.id,
        courseId: course.id,
      },
    });

    console.log("✅ Financial record created for student payment");

    return res.status(200).json({
      message: "Payment recorded successfully",
      paymentLog: log,
      payment,
    });
  } catch (error) {
    console.error("❌ Error updating student fee payment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
