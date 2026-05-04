// controllers/studentController.ts
import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger";
import { studentCreateSchema, studentEditSchema, studentOpeningBalanceSchema, studentQuerySchema } from "../validators/student.query";
import { createStudentOpeningBalanceService, createStudentService, editStudentService, getStudents } from "../services/student.service";

// export async function addStudentController(req: Request, res: Response) {
//   const {
//     id,
//     name,
//     contact,
//     email,
//     courseId,
//     batchId,
//     residentialAddress,
//     permenantAddress,
//     idProofType,
//     idProofNumber,
//     admissionDate,
//     feeAmount,
//     paymentType,
//     religion,
//     fatherName,
//     motherName,
//     dob,
//     gender,
//     parentsContact,
//     installmentTypeId,
//   } = req.body;

//   console.log("Student data in addAdmission Controller >>>>>>>>>>>>>>>>>>>>>>>>>>>>>", req.body);

//   if (
//     !name ||
//     !contact ||
//     !email ||
//     !idProofType ||
//     !idProofNumber ||
//     !id ||
//     !residentialAddress ||
//     !permenantAddress ||
//     !feeAmount ||
//     !paymentType ||
//     !religion ||
//     !fatherName ||
//     !motherName ||
//     !parentsContact ||
//     !admissionDate ||
//     !courseId ||
//     !fatherName ||
//     !dob ||
//     !gender ||
//     !batchId ||
//     !installmentTypeId
//   ) {
//     return res
//       .status(400)
//       .json({ error: "Missing required student information" });
//   }

//   if (!feeAmount || !paymentType) {
//     return res
//       .status(400)
//       .json({ error: "Fee amount and payment type are required" });
//   }

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

//     const photoFile = req.file;
//     let photoUrl: string | null = null;

//     if (photoFile) {
//       photoUrl = `/uploads/students/${photoFile.filename}`;
//       console.log("Photo URL:", photoUrl);
//     }

//     // 🔍 1. Check if course with the given name exists
//     const courseExists = await tenantPrisma.course.findUnique({
//       where: { id: Number(courseId) },
//     });
//     if (!courseExists)
//       return res.status(404).json({ error: "Course does not exist" });

//     const batchExists = await tenantPrisma.batch.findUnique({
//       where: { id: Number(batchId) },
//     });
//     if (!batchExists)
//       return res.status(404).json({ error: "Batch does not exist" });

//     // 🧩 2. Ensure BatchCourse relation exists
//     let batchCourse = await tenantPrisma.batchCourse.findFirst({
//       where: {
//         batchId: Number(batchId),
//         courseId: Number(courseId),
//       },
//     });

//     if (!batchCourse) {
//       batchCourse = await tenantPrisma.batchCourse.create({
//         data: {
//           batchId: Number(batchId),
//           courseId: Number(courseId),
//         },
//       });
//       console.log("✅ Created BatchCourse relation dynamically");
//     }

//     // 🎓 3. Generate unique student code
//     const lastStudent = await tenantPrisma.student.findFirst({
//       orderBy: { id: "desc" },
//       select: { studentCode: true, serialNumber: true },
//     });

//     let studentCode = "SD001";
//     let serialNumber = 1;

//     if (lastStudent?.studentCode) {
//       const num = parseInt(lastStudent.studentCode.slice(2)) + 1;
//       studentCode = `SD${num.toString().padStart(3, "0")}`;
//     }

//     if (lastStudent?.serialNumber) {
//       serialNumber = lastStudent.serialNumber + 1;
//     }

//     const parsedDOB = new Date(dob.split("/").reverse().join("-"));

//     const admissionNumber = await generateAdmissionNumber(tenantPrisma, clientAdminId);

//     // ✅ Create Student Record
//     const student = await tenantPrisma.student.create({
//       data: {
//         serialNumber,
//         studentCode,
//         admissionNumber,
//         fullName: name,
//         contact: contact,
//         email,
//         residentialAddress,
//         permenantAddress,
//         idProofType,
//         idProofNumber,
//         admissionDate: new Date(admissionDate),
//         religion,
//         fatherName,
//         motherName,
//         parentsContact,
//         dob,
//         photoUrl, // ✅ store file path
//         gender,
//         clientAdminId,
//       },
//     });

//     // 🧮 Calculate endDate from course duration
//     const startDate = new Date(admissionDate);
//     let endDate = new Date(startDate); // copy start date

//     console.log("get endDate Befoe calcultion:", endDate);

//     if (courseExists.durationWeeks && !isNaN(courseExists.durationWeeks)) {
//       endDate.setDate(startDate.getDate() + courseExists.durationWeeks * 7);
//     } else {
//       console.warn(
//         "⚠️ Course has no valid durationWeeks — using admissionDate as endDate"
//       );
//     }

//     console.log("get endDate After calcultion:", endDate);

//     const courseFeeStructure = await tenantPrisma.courseFeeStructure.findUnique(
//       {
//         where: {
//           id: Number(courseId),
//         },
//         include: {
//           installments: {
//             where: {
//               id: Number(installmentTypeId),
//             },
//           },
//         },
//       }
//     );

//     console.log(
//       "GET CPURSE FEE STURCURE FOR STUDENT INPORTANT:",
//       courseFeeStructure
//     );

//     if (!courseFeeStructure) {
//       return res
//         .status(402)
//         .json({ message: "Course Fee Structure not Found!" });
//     }

//     let installmentCount = null;

//     if (paymentType === "INSTALLMENT") {
//       installmentCount = courseFeeStructure.installments[0]?.number || null;
//     }

//     // 🔗 5. Attach student to course
//     const studentCourse = await tenantPrisma.studentCourse.create({
//       data: {
//         studentId: student.id,
//         courseId: Number(courseId),
//         batchId: Number(batchId),
//         studentCode: student.studentCode,
//         startDate: new Date(admissionDate),
//         endDate: endDate,
//         status: "ACTIVE",
//         clientAdminId,
//       },
//     });

//     // 💰 6. Create FeeStructure
//     const feeStructure = await tenantPrisma.feeStructure.create({
//       data: {
//         studentId: student.id,
//         courseId: Number(courseId),
//         totalAmount: parseFloat(feeAmount), // from req.body
//         paymentType, // from req.body ('ONE_TIME' or 'INSTALLMENT')
//         installmentTypeId: Number(installmentTypeId || null),
//         installmentCount: installmentCount || null,
//         clientAdminId,
//       },
//     });

//     // 🗓️ Calculate due date = admission date + 21 days
//     const dueDate = new Date(admissionDate);
//     dueDate.setDate(dueDate.getDate() + 21);

//     console.log("Get Due date for Payment", dueDate);

//     // 💳 7. Create StudentFee
//     const studentFee = await tenantPrisma.studentFee.create({
//       data: {
//         studentId: student.id,
//         courseId: Number(courseId),
//         dueDate: dueDate,
//         amountDue: feeStructure.totalAmount,
//         amountPaid: 0,
//         paymentMode: "CASH",
//         receiptNo: `RCP${Date.now()}`,
//         paymentStatus: "PENDING",
//         clientAdminId,
//       },
//     });
//     // 🧩 Inside addStudentController, replace allocation section with:
//     if (batchExists.labTimeSlotId) {
//       await tenantPrisma.$transaction(async (tx) => {
//         // 🧠 Step 1: Get the timeslot + its lab + current allocations
//         const labTimeSlot = await tx.labTimeSlot.findUnique({
//           where: { id: batchExists.labTimeSlotId },
//           include: { allocations: true, lab: true },
//         });

//         if (!labTimeSlot) throw new Error("Lab time slot not found");

//         const totalPCs = labTimeSlot.lab.totalPCs; // from the Lab model
//         const usedPCs = labTimeSlot.allocations.length;
//         const freePCs = labTimeSlot.availablePCs; // how many PCs are left unallocated

//         console.log(
//           "💻 Lab PCs — Total:",
//           totalPCs,
//           "Used:",
//           usedPCs,
//           "Free:",
//           freePCs
//         );

//         // 🧩 Safety check
//         if (freePCs <= 0 || usedPCs >= totalPCs) {
//           throw new Error("No free PCs available in this lab time slot");
//         }

//         // 💻 Step 2: Allocate one PC
//         await tx.labAllocation.create({
//           data: {
//             labTimeSlotId: labTimeSlot.id,
//             studentId: student.id,
//             pcNumber: usedPCs + 1, // next available PC number
//             clientAdminId,
//           },
//         });

//         // 🔁 Step 3: Update availablePCs count (decrement by 1)
//         await tx.labTimeSlot.update({
//           where: { id: labTimeSlot.id },
//           data: {
//             availablePCs: { decrement: 1 },
//           },
//         });
//       });
//     }

//     // 🔄 Update enquiry (if exists)
//     if (id) {
//       await tenantPrisma.enquiry.update({
//         where: { id: id },
//         data: {
//           studentId: student.id,
//           isConverted: true,
//         },
//       });
//     }

//     // ✅ Log the creation
//     await logActivity({
//       clientAdminId,
//       entity: "Student",
//       entityId: student.id.toString(),
//       action: "CREATE",
//       message: `New student admitted: ${student.fullName}`,
//       dbUrl: user.dbUrl,
//     });

//     const getAllStudent = await tenantPrisma.student.findMany();

//     return res.status(201).json({
//       message: "Student admission created successfully",
//       student,
//       studentCourse,
//       studentFee,
//       getAllStudent,
//     });
//   } catch (err) {
//     console.error("❌ Error creating student:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

// export async function addStudentControllerNew(req: Request, res: Response) {
//   const {
//     id, // enquiry id
//     name,
//     contact,
//     email,
//     residentialAddress,
//     permenantAddress,
//     idProofType,
//     idProofNumber,
//     admissionDate,
//     religion,
//     fatherName,
//     motherName,
//     dob,
//     gender,
//     parentsContact,
//     courseData, // ⬅⬅ NOW ARRAY (for single or multi)
//   } = req.body;

//   console.log("Student data:", req.body);

//   if (
//     !name ||
//     !contact ||
//     !email ||
//     !idProofType ||
//     !idProofNumber ||
//     !id ||
//     !residentialAddress ||
//     !permenantAddress ||
//     !religion ||
//     !fatherName ||
//     !motherName ||
//     !parentsContact ||
//     !admissionDate ||
//     !dob ||
//     !gender
//   ) {
//     return res.status(400).json({ error: "Missing required student info" });
//   }

//   let courseDataParsed: any[] = [];

//   if (req.body.courseData) {
//     try {
//       courseDataParsed = JSON.parse(req.body.courseData);
//     } catch (err) {
//       return res.status(400).json({ error: "Invalid courseData format" });
//     }
//   }

//   if (!Array.isArray(courseDataParsed) || courseDataParsed.length === 0) {
//     return res.status(400).json({ error: "Missing course data" });
//   }

//   console.log("GET COURSE PARSED DATA:", courseDataParsed);

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

//     // 📸 Photo upload
//     let photoUrl: string | null = null;
//     if (req.file) {
//       photoUrl = `/uploads/students/${req.file.filename}`;
//     }

//     // 🎓 Generate student code + serial number
//     const lastStudent = await tenantPrisma.student.findFirst({
//       orderBy: { id: "desc" },
//       select: { studentCode: true, serialNumber: true },
//     });

//     let studentCode = "SD001";
//     let serialNumber = 1;

//     if (lastStudent?.studentCode) {
//       const next = parseInt(lastStudent.studentCode.slice(2)) + 1;
//       studentCode = `SD${String(next).padStart(3, "0")}`;
//     }

//     if (lastStudent?.serialNumber) {
//       serialNumber = lastStudent.serialNumber + 1;
//     }

//     const parsedDOB = new Date(dob.split("/").reverse().join("-"));

//     // 👤 Create student ONCE
//     const student = await tenantPrisma.student.create({
//       data: {
//         serialNumber,
//         studentCode,
//         fullName: name,
//         contact,
//         email,
//         residentialAddress,
//         permenantAddress,
//         idProofType,
//         idProofNumber,
//         admissionDate: new Date(admissionDate),
//         religion,
//         fatherName,
//         motherName,
//         parentsContact,
//         dob,
//         gender,
//         photoUrl,
//         clientAdminId,
//       },
//     });

//     let allStudentCourses: any[] = [];
//     let allFees: any[] = [];

//     // 🔁 LOOP FOR SINGLE OR MULTIPLE COURSES
//     for (const c of courseDataParsed) {
//       const {
//         courseId,
//         batchId,
//         feeAmount,
//         paymentType,
//         installmentTypeId,
//         installments, // optional for INSTALLMENT
//       } = c;

//       // 1️⃣ Validate course + batch
//       const courseExists = await tenantPrisma.course.findUnique({
//         where: { id: Number(courseId) },
//       });
//       if (!courseExists)
//         return res.status(404).json({ error: `Course ${courseId} not found` });

//       const batchExists = await tenantPrisma.batch.findUnique({
//         where: { id: Number(batchId) },
//       });
//       if (!batchExists)
//         return res.status(404).json({ error: `Batch ${batchId} not found` });

//       // 2️⃣ Ensure BatchCourse relation
//       let batchCourse = await tenantPrisma.batchCourse.findFirst({
//         where: { batchId: Number(batchId), courseId: Number(courseId) },
//       });

//       if (!batchCourse) {
//         batchCourse = await tenantPrisma.batchCourse.create({
//           data: {
//             batchId: Number(batchId),
//             courseId: Number(courseId),
//           },
//         });
//       }

//       // 3️⃣ Calculate Course End Date
//       const startDate = new Date(admissionDate);
//       let endDate = new Date(startDate);

//       if (courseExists.durationWeeks) {
//         endDate.setDate(startDate.getDate() + courseExists.durationWeeks * 7);
//       }

//       // 4️⃣ Create StudentCourse
//       const studentCourse = await tenantPrisma.studentCourse.create({
//         data: {
//           studentId: student.id,
//           courseId: Number(courseId),
//           batchId: Number(batchId),
//           studentCode,
//           startDate,
//           endDate,
//           status: "ACTIVE",
//           clientAdminId,
//         },
//       });

//       allStudentCourses.push(studentCourse);

//       // 5️⃣ Fee Structure
//       const feeStructure = await tenantPrisma.feeStructure.create({
//         data: {
//           studentId: student.id,
//           courseId: Number(courseId),
//           totalAmount: parseFloat(feeAmount),
//           paymentType,
//           installmentTypeId:
//             paymentType === "INSTALLMENT" ? Number(installmentTypeId) : null,
//           clientAdminId,
//         },
//       });

//       let studentFeeRecords: any[] = [];

//       // 6️⃣ Handle Installments / One-time
//       if (paymentType === "INSTALLMENT" && installments?.length) {
//         for (const inst of installments) {
//           const instRec = await tenantPrisma.studentFee.create({
//             data: {
//               studentId: student.id,
//               courseId: Number(courseId),
//               dueDate: new Date(inst.dueDate),
//               amountDue: inst.amount,
//               amountPaid: 0,
//               paymentMode: "CASH",
//               receiptNo: `RCP${Date.now()}`,
//               paymentStatus: "PENDING",
//               clientAdminId,
//             },
//           });
//           studentFeeRecords.push(instRec);
//         }
//       } else {
//         // ONE-TIME
//         const dueDate = new Date(admissionDate);
//         dueDate.setDate(dueDate.getDate() + 21);

//         const instRec = await tenantPrisma.studentFee.create({
//           data: {
//             studentId: student.id,
//             courseId: Number(courseId),
//             dueDate,
//             amountDue: parseFloat(feeAmount),
//             amountPaid: 0,
//             paymentMode: "CASH",
//             receiptNo: `RCP${Date.now()}`,
//             paymentStatus: "PENDING",
//             clientAdminId,
//           },
//         });
//         studentFeeRecords.push(instRec);
//       }

//       allFees.push(studentFeeRecords);

//       // 7️⃣ Allocate PC → only for the batch’s lab slot
//       // if (batchExists.labTimeSlotId) {
//       //   await tenantPrisma.$transaction(async (tx) => {
//       //     const labTimeSlot = await tx.labTimeSlot.findUnique({
//       //       where: { id: batchExists.labTimeSlotId },
//       //       include: { allocations: true, lab: true },
//       //     });

//       //     if (!labTimeSlot) throw new Error("Lab timeslot not found");

//       //     const used = labTimeSlot.allocations.length;
//       //     const total = labTimeSlot.lab.totalPCs;

//       //     if (used >= total) {
//       //       throw new Error("No free PCs in the lab time slot");
//       //     }

//       //     await tx.labAllocation.create({
//       //       data: {
//       //         labTimeSlotId: labTimeSlot.id,
//       //         studentId: student.id,
//       //         pcNumber: used + 1,
//       //         clientAdminId,
//       //       },
//       //     });

//       //     await tx.labTimeSlot.update({
//       //       where: { id: labTimeSlot.id },
//       //       data: { availablePCs: { decrement: 1 } },
//       //     });
//       //   });
//       // }

//       // 7️⃣ Allocate PC → SAFE VERSION
//       if (batchExists.labTimeSlotId) {
//         await tenantPrisma.$transaction(async (tx) => {
//           const labTimeSlot = await tx.labTimeSlot.findUnique({
//             where: { id: batchExists.labTimeSlotId },
//             include: {
//               allocations: {
//                 select: { pcNumber: true },
//               },
//               lab: {
//                 select: { totalPCs: true },
//               },
//             },
//           });

//           if (!labTimeSlot) {
//             throw new Error("Lab timeslot not found");
//           }

//           const totalPCs = labTimeSlot.lab.totalPCs;
//           const usedPCs = new Set(
//             labTimeSlot.allocations.map(a => a.pcNumber)
//           );

//           // 🔍 Find first free PC
//           let freePC: number | null = null;
//           for (let i = 1; i <= totalPCs; i++) {
//             if (!usedPCs.has(i)) {
//               freePC = i;
//               break;
//             }
//           }

//           if (!freePC) {
//             throw new Error("No free PCs in the lab time slot");
//           }

//           await tx.labAllocation.create({
//             data: {
//               labTimeSlotId: labTimeSlot.id,
//               studentId: student.id,
//               pcNumber: freePC,
//               clientAdminId,
//             },
//           });

//           await tx.labTimeSlot.update({
//             where: { id: labTimeSlot.id },
//             data: {
//               availablePCs: { decrement: 1 },
//             },
//           });
//         });
//       }
//     }

//     // 8️⃣ Update Enquiry
//     if (id) {
//       await tenantPrisma.enquiry.update({
//         where: { id },
//         data: { studentId: student.id, isConverted: true },
//       });
//     }

//     // 9️⃣ Log activity
//     await logActivity({
//       clientAdminId,
//       entity: "Student",
//       entityId: student.id.toString(),
//       action: "CREATE",
//       message: `New student admitted: ${student.fullName}`,
//       dbUrl: user.dbUrl,
//     });

//     return res.status(201).json({
//       message: "Student admitted successfully",
//       student,
//       studentCourses: allStudentCourses,
//       fees: allFees,
//     });
//   } catch (err) {
//     console.error("❌ Admission Error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function addStudentControllerNew(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string")
      return res.status(401).json({ error: "Unauthorized request" });


    console.log("STUDENTADMISSION:", req.body);
    console.log("STUDENTADMISSION FILE:", req.file);
      // ✅ Validate input
      const data = studentCreateSchema.parse({
      ...req.body,

       idCard: req.body.idCard === "true",
       bag: req.body.bag === "true",

      photoUrl: req.file ? `/uploads/students/${req.file.filename}` : null,
      courseData: (typeof req.body.courseData === "string" 
        ? JSON.parse(req.body.courseData) 
        : req.body.courseData
      ).map((c: any) => ({
        ...c,
        courseId: Number(c.courseId),
        batchId: Number(c.batchId),
        feeAmount: Number(c.feeAmount),
        installmentTypeId: c.installmentTypeId ? Number(c.installmentTypeId) : undefined,
      })),
      advancePayments: req.body.advancePayments ? 
        (typeof req.body.advancePayments === "string" 
          ? JSON.parse(req.body.advancePayments) 
          : req.body.advancePayments
        ).map((p: any) => ({
          ...p,
          courseId: Number(p.courseId),
          advanceAmount: Number(p.advanceAmount),
        })) : undefined,
    });

    // ✅ Call Service Layer
    const result = await createStudentService({
      prisma,
      clientAdminId: user.clientAdminId,
      data,
    });

    // ✅ Update enquiry if student is converted
    if (data.id) {
      await prisma.enquiry.update({
        where: { id: data.id },
        data: { studentId: result.student.id, isConverted: true },
      });
    }

    // ✅ Log Activity
    await logActivity({
      clientAdminId: user.clientAdminId,
      entity: "Student",
      entityId: result.student.id.toString(),
      action: "CREATE",
      message: `New student admitted: ${result.student.fullName}`,
      dbUrl: user.dbUrl,
    });

    return res.status(201).json({
      message: "Student admitted successfully",
      ...result,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    console.error("❌ Admission Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createstudentOpeningBalanceController(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string")
      return res.status(401).json({ error: "Unauthorized request" });


    console.log("STUDENTADMISSION:", req.body);
      // ✅ Validate input
      const data = studentOpeningBalanceSchema.parse({ ...req.body });

      console.log("SUCCESSSSSSSS")

    // ✅ Call Service Layer
    const result = await createStudentOpeningBalanceService({
      prisma,
      clientAdminId: user.clientAdminId,
      data,
    });

    console.log("RESULT FOR OPENING BALANCE:", result);

    // ✅ Log Activity
    await logActivity({
      clientAdminId: user.clientAdminId,  
      entity: "Student Opening Balance",
      entityId: result.id.toString(),
      action: "CREATE",
      message: `New student create with Opening Balance: ${result.fullName}`,
      dbUrl: user.dbUrl,
    });

    return res.status(201).json({
      message: "Student Opening Balance Successfully Created",
      ...result,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    console.error("❌ Admission Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function upsertAdmissionConfig(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    const { prefix, suffix, separator, numberLength } = req.body;

    const config = await prisma.admissionNumberConfig.upsert({
      where: { clientAdminId: user.clientAdminId },

      update: {
        prefix,
        suffix,
        separator,
        numberLength: Number(numberLength),
      },

      create: {
        clientAdminId: user.clientAdminId,
        prefix,
        suffix,
        separator,
        numberLength: Number(numberLength),
        currentNumber: 1,
      },
    });

    return res.json({
      message: "Admission config saved",
      config,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save config" });
  }
}

export async function getAdmissionConfig(req: any, res: any) {
  try {
    console.log("USER:", req.user);
    console.log("PRISMA:", !!req.tenantPrisma);

    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const config = await prisma.admissionNumberConfig.findUnique({
      where: { clientAdminId: user.clientAdminId },
    });

    return res.json(config);
  } catch (err) {
    console.error("GET CONFIG ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function editStudentController(req: any, res: any) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string")
      return res.status(401).json({ error: "Unauthorized request" });


    console.log("editStudentController editStudentController editStudentController editStudentController:", req.body, req.params);
      // ✅ Validate input
      const data = studentEditSchema.parse({
        id: Number(req.params.id),
      ...req.body
    });

    // ✅ Call Service Layer
    const result = await editStudentService({
      prisma,
      clientAdminId: user.clientAdminId,
      data,
    });

    // ✅ Log Activity with changeReason
    await logActivity({
      clientAdminId: user.clientAdminId,
      entity: "Student",
      entityId: result.student.id.toString(),
      action: "UPDATE",
      message: `Student updated: ${data.changeReason || "No reason provided"}`,
      dbUrl: user.dbUrl,
    });

    return res.status(200).json({
      message: "Student Updated successfully",
      ...result,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }
    console.error("❌ Admission Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// export async function addStudentController(req: Request, res: Response) {
//   const { id, name, contact, course, email } = req.body;

//   if (!id || !name || !contact || !course || !email) {
//     return res.status(400).json({ error: 'Missing tenant id or student details' });
//   }

//   console.log("Student data", id, name, contact, course, email);

//   console.log("Student data in addAdmission Controller", req.body);

//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     console.log("Get tenant user from middlerware", user);

//     if (!tenantPrisma || !user || typeof user === 'string') {
//       return res.status(401).json({ error: 'Unauthorized request' });
//     }

//     // For Role Base Validation
//     // if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
//     //   return res.status(403).json({ error: 'Forbidden: insufficient role' });
//     // }

//     const email = user.email;

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
//     if (!clientAdmin) {
//       return res.status(404).json({ error: 'Client admin not found' });
//     }

//     // 3. Create student under that admin

//     console.log("Student Created Successfully");

//     return res.status(201).json({ message: 'Student created successfully' });
//   } catch (err) {
//     console.error('Error creating student:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

// export async function getStudentController(req: Request, res: Response) {
//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;
//     const tenant = req.tenantInfo;

//     console.log("Get tenant user in getEnquiryController", user);

//     console.log("Get tenant Info in getEnquiryController", tenant);

//     if (!tenantPrisma || !user || typeof user === "string") {
//       return res.status(401).json({ error: "Unauthorized request" });
//     }

//     const email = user.email;

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const clientAdmin = await tenantPrisma.clientAdmin.findUnique({
//       where: { email: email },
//     });
//     if (!clientAdmin) {
//       return res.status(404).json({ error: "Client admin not found" });
//     }

//     console.log("🙂🙂🙂🙂🙂🙂🙂🙂🙂🙂🙂get ClientAdmin in getEnquiryController:", clientAdmin);

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
//     if (!allClientAdmin) {
//       return res.status(404).json({ error: "Client admin not found" });
//     }

//     const clientAdminId = user.clientAdminId;

//     console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

//     // 2.1 ✅ Extract query params
//     const {
//       page,
//       limit,
//       search,
//       sortField, // default sort by created date
//       sortOrder, // default descending
//       courseId,
//       admissionDate
//     } = req.query;

//     console.log("get ALl Params in get student:", page, limit,
//       search,
//       sortField, // default sort by created date
//       sortOrder, 
//       courseId);

//     const pageNum = parseInt(page as string, 10);
//     const limitNum = parseInt(limit as string, 10);
//     const skip = (pageNum - 1) * limitNum;

//      // ✅ Build search filter
//     const where = {
//       clientAdminId,
//       ...(search
//         ? {
//             OR: [
//               { fullName: { contains: search as string } },
//               { email: { contains: search as string } },
//               { studentCode: { contains: search as string } },
//               { contact: { contains: search as string } },
//             ],
//           }
//         : {}),
//         // ✅ Apply optional filters
//         // ...(courseId && { courseId: courseId }),
//       ...(courseId
//         ? {
//             studentCourses: {
//               some: {
//                 courseId: Number(courseId),
//               },
//             },
//           }
//         : {}),
//          // ...(createDate && { createdAt: { gte: new Date(createDate as string) } }),
//         ...(admissionDate && (() => {
//           const start = new Date(admissionDate as string);
//           start.setHours(0, 0, 0, 0);

//           const end = new Date(admissionDate as string);
//           end.setHours(23, 59, 59, 999);

//           return {
//             admissionDate: {
//               gte: start,
//               lte: end,
//             },
//           };
//         })()),
//     };

//     // ✅ Fetch paginated, sorted, and filtered enquiries
//     const student = await tenantPrisma.student.findMany({
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
//         labAllocations: true,
//         studentCourses: true,
//       },
//     });

//     // ✅ Total count (for frontend pagination)
//     //const totalPages = await tenantPrisma.student.count({ where });

//     const totalCount = await tenantPrisma.student.count({ where });
//     const totalPages = Math.ceil(totalCount / limitNum);

//     console.log(
//       "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 Students Fetched Successfully",
//       student,
//       totalCount,
//       totalPages,
//       pageNum,
//       limitNum
//     );

//     return res.status(200).json({
//       message: "Students fetched successfully",
//       student,
//       totalPages,
//       totalCount,
//       page: pageNum,
//       limit: limitNum,
//     });

//     //return res.status(201).json({ message: 'Enquiry Fetched successfully', enquiry });
//   } catch (err) {
//     console.error("Error Fetched Enquiry:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function getStudentController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = studentQuerySchema.parse(req.query);

    console.log("STUDENT QUERY IN GET STUDETM CONTROLLER:", query);

    const result = await getStudents({
      prisma,
      clientAdminId: user.clientAdminId,
      query,
    });

    console.log("STUDENT DATA IN GET STUDETM CONTROLLER:", result);

    return res.status(200).json({
      message: "Students fetched successfully",
      ...result,
      page: query.page,
      limit: query.limit,
    });

  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: err.errors });
    }

    console.error(err);
    console.error("FULL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

// export async function getStudentController(req: Request, res: Response) {

//   try {
//     // 1. Use values injected by middleware
//     const tenantPrisma = req.tenantPrisma;
//     const user = req.user;

//     console.log("Get tenant user from middlerware", user);

//     if (!tenantPrisma || !user || typeof user === 'string') {
//       return res.status(401).json({ error: 'Unauthorized request' });
//     }

//     const email = user.email;

//     // 2. Get client admin (we assume there's only one per tenant for now)
//     const clientAdmin = await tenantPrisma.clientAdmin.findUnique({ where: { email: email } });
//     if (!clientAdmin) {
//       return res.status(404).json({ error: 'Client admin not found' });
//     }

//     // 3. Create student under that admin
//     const student = await tenantPrisma.student.findMany({
//     });

//     console.log("Student Fetched Successfully", student);

//     return res.status(201).json({ message: 'Student Fetched successfully', student });
//   } catch (err) {
//     console.error('Error Fetched student:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

// Student data in addAdmission Controller {
//   name: 'demo',
//   email: 'demo@gmail.com',
//   contact: '+919898989898',
//   course: 'Java',
//   idProofType: 'aadhar card',
//   idProofNumber: '9876543210',
//   admissionDate: '2025-10-07T14:14',
//   feeAmount: '10000',
//   paymentType: 'INSTALLMENT',
//   gender: 'Female',
//   residentialAddress: 'ggegtrthbrhbygnjhygfynjmnkhgtfrdesfghbyn',
//   permenantAddress: 'thumnmyumjhyumyujmyumyuyhttgfdrsfgrthynjmhgtf',
//   parentsContact: '9898989898',
//   fatherName: 'demo',
//   motherName: 'demo',
//   dob: '00-00-0000',
//   religion: 'Hindu',
//   profilePicture: {
//     path: './tanjiro-kamado-3840x2160-22691.jpg',
//     relativePath: './tanjiro-kamado-3840x2160-22691.jpg'
//   }
// }

export async function getStudentCourseController(req: Request, res: Response) {
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
    const allClientAdmin = await tenantPrisma.clientAdmin.findMany();
    if (!allClientAdmin) {
      return res.status(404).json({ error: "Client admin not found" });
    }

    console.log("get allClientAdmin in getEnquiryController:", allClientAdmin);

    const studentCourses = await tenantPrisma.studentCourse.findMany({
      where: { studentId: parseInt(id) },
      include: {
        course: true,
      },
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

export async function createAdmissionNumberConfigController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { prefix, suffix, numberLength } = req.body;

    // Check if config already exists
    const existingConfig = await prisma.admissionNumberConfig.findUnique({
      where: { clientAdminId: user.clientAdminId },
    });

    if (existingConfig) {
      return res.status(400).json({
        error: "Admission number configuration already exists",
      });
    }

    // const config = await prisma.admissionNumberConfig.create({
    //   data: {
    //     prefix: prefix || null,
    //     suffix: suffix || null,
        
    //     numberLength: numberLength ? Number(numberLength) : 4,
    //     clientAdminId: user.clientAdminId,
    //   },
    // });

    return res.status(201).json({
      message: "Admission number configuration created successfully",
    
    });

  } catch (err) {
    console.error("❌ Create Admission Config Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateAdmissionNumberConfigController(req: Request, res: Response) {
  try {
    const prisma = req.tenantPrisma;
    const user = req.user;

    if (!prisma || !user || typeof user === "string") {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const { prefix, suffix, numberLength, currentNumber } = req.body;

    const existingConfig = await prisma.admissionNumberConfig.findUnique({
      where: { clientAdminId: user.clientAdminId },
    });

    if (!existingConfig) {
      return res.status(404).json({
        error: "Admission number configuration not found",
      });
    }

    const updatedConfig = await prisma.admissionNumberConfig.update({
      where: { clientAdminId: user.clientAdminId },
      data: {
        prefix: prefix ?? existingConfig.prefix,
        suffix: suffix ?? existingConfig.suffix,
        numberLength: numberLength
          ? Number(numberLength)
          : existingConfig.numberLength,
        currentNumber: currentNumber
          ? Number(currentNumber)
          : existingConfig.currentNumber,
      },
    });

    return res.status(200).json({
      message: "Admission number configuration updated successfully",
      config: updatedConfig,
    });

  } catch (err) {
    console.error("❌ Update Admission Config Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}