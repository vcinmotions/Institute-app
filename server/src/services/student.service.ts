// services/enquiry.service.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";
import { z } from "zod";
import { buildStudentWhere } from "../filters/student.filter";
import { buildStudentOrderBy } from "../filters/student.sort";
import { studentQuerySchema } from "../validators/student.query";
import { Student } from "../domain/student/student";
import { parseDate, parseDateISO } from "../helpers/date";
import { ensureUniqueEnquiry, ensureUniqueStudent } from "../domain/enquiry/enquiryRules";
import { generateAdmissionNumber } from "../utils/admissionFormConfig";
import { generatePaymentReceiptNumber } from "../utils/paymentReceiptConfig";

type StudentQuery = z.infer<typeof studentQuerySchema>;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const toISODateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toISOString(); // returns full ISO-8601 string
};


export async function getStudents({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildStudentWhere({
    clientAdminId,
    search: query.search,
    courseId: query.courseId,
    admissionDate: query.admissionDate,
    
  });

  const orderBy = buildStudentOrderBy(
    query.sortField,
    query.sortOrder
  );

  const today = new Date();
  const todayMonth = today.getMonth(); // 0-based
  const todayDate = today.getDate();

  const [data, total, allStudentsForBirthday] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: {
        labAllocations: true,
        studentCourses: true,
      },
    }),
    prisma.student.count({ where }),

    prisma.student.findMany({
        where: {
          clientAdminId,
          dob: { not: null },
        },
        select: {
          id: true,
          fullName: true,
          dob: true,
        },
      }),
  ]);

  // 🎂 Filter birthdays in JS (works in all DBs)
  const birthday = allStudentsForBirthday.filter((student: { dob: string | number | Date; }) => {
    const dob = new Date(student.dob);
    return (
      dob.getMonth() === todayMonth &&
      dob.getDate() === todayDate
    );
  });

  return {
    data,
    total,
    birthday,
    totalPages: Math.ceil(total / query.limit),
  };
}

// export async function createStudentService({
//   prisma,
//   clientAdminId,
//   data,
// }: {
//   prisma: any;
//   clientAdminId: string;
//   data: any;
// }) {
//   return await prisma.$transaction(async (tx: any) => {

//     const {
//       name,
//       contact,
//       email,
//       residentialAddress,
//       permenantAddress,
//       idProofType,
//       idProofNumber,
//       localAddressProofType,
//       localAddressProofNumber,
//       referedBy,
//       idCard,
//       bag,
//       admissionDate,
//       religion,
//       fatherName,
//       qualification,
//       dob,
//       gender,
//       parentsContact,
//       courseData,
//       photoUrl,
//       advancePayments,
//     } = data;

//     console.log("STUDENT DATA:", data);

//     // 🔥 STEP 0: MAP ADVANCE PAYMENTS
//     const advanceMap = new Map<number, number>();

//     if (Array.isArray(advancePayments)) {
//       for (const ap of advancePayments) {
//         advanceMap.set(
//           Number(ap.courseId),
//           parseFloat(ap.advanceAmount || 0)
//         );
//       }
//     }

//     // 1️⃣ Get last student
//     const lastStudent = await tx.student.findFirst({
//       orderBy: { serialNumber: "desc" },
//       select: { studentCode: true, serialNumber: true },
//     });

//     const studentCode = Student.generateStudentCode(lastStudent?.studentCode);
//     const serialNumber = Student.nextSerialNumber(lastStudent?.serialNumber);

//     const parsedDOB = parseDateISO(dob);

//     // 2️⃣ Admission Number
//     const admissionNumber = await generateAdmissionNumber(tx, clientAdminId);

//     // 3️⃣ Create Student
//     const student = await tx.student.create({
//       data: {
//         serialNumber,
//         admissionNumber,
//         studentCode,
//         fullName: name,
//         contact,
//         email,
//         residentialAddress,
//         permenantAddress,
//         idProofType,
//         idProofNumber,
//         localAddressProofType,
//         localAddressProofNumber,
//         referedBy,
//         idCard,
//         bag,
//         admissionDate: new Date(admissionDate),
//         religion,
//         fatherName,
//         qualification,
//         parentsContact,
//         dob: parsedDOB ? new Date(parsedDOB) : null,
//         gender,
//         photoUrl: photoUrl || null,
//         clientAdminId,
//       },
//     });

//     const allStudentCourses: any[] = [];
//     const allFees: any[] = [];

//     // 4️⃣ LOOP COURSES
//     for (const c of courseData) {
//       const {
//         courseId,
//         batchId,
//         feeAmount,
//         paymentType,
//         installmentTypeId,
//         installments,

//         // 👇 Extract new parameter entries
//         paymentMode,  
//         transactionNo,
//         bankName,
//       } = c;

//       const totalFee = parseFloat(feeAmount);
//       let remainingAdvance = advanceMap.get(Number(courseId)) || 0;

//       const activeMode = paymentMode || "CASH";
//       const activeTxNo = activeMode !== "CASH" ? transactionNo : null;
//       const activeBank = activeMode !== "CASH" ? bankName : null;

//       // Validate
//       const courseExists = await tx.course.findUnique({
//         where: { id: Number(courseId) },
//       });
//       if (!courseExists) throw new Error(`Course ${courseId} not found`);

//       const batchExists = await tx.batch.findUnique({
//         where: { id: Number(batchId) },
//       });
//       if (!batchExists) throw new Error(`Batch ${batchId} not found`);

//       // Ensure BatchCourse
//       let batchCourse = await tx.batchCourse.findFirst({
//         where: { batchId: Number(batchId), courseId: Number(courseId) },
//       });

//       if (!batchCourse) {
//         batchCourse = await tx.batchCourse.create({
//           data: {
//             batchId: Number(batchId),
//             courseId: Number(courseId),
//           },
//         });
//       }

//       // Dates
//       const startDate = new Date(admissionDate);
//       const endDate = new Date(startDate);

//       if (courseExists.durationMonths) {
//         endDate.setMonth(startDate.getMonth() + courseExists.durationMonths);
//         if (endDate.getDate() !== startDate.getDate()) {
//           endDate.setDate(0);
//         }
//       }

//       // StudentCourse
//       const studentCourse = await tx.studentCourse.create({
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

//       // FeeStructure
//       await tx.feeStructure.create({
//         data: {
//           studentId: student.id,
//           courseId: Number(courseId),
//           totalAmount: totalFee,
//           paymentType,
//           installmentTypeId:
//             paymentType === "INSTALLMENT"
//               ? Number(installmentTypeId)
//               : null,
//           clientAdminId,
//         },
//       });

//       let studentFeeRecords: any[] = [];

//       // ============================
//       // 💥 INSTALLMENT FLOW
//       // ============================
//       if (paymentType === "INSTALLMENT" && installments?.length) {
//         for (const inst of installments) {
//           const instAmount = parseFloat(inst.amount);

//           const paid = Math.min(instAmount, remainingAdvance);
//           const remaining = instAmount - paid;
//           remainingAdvance -= paid;

//           const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);

//           const instRec = await tx.studentFee.create({
//             data: {
//               studentId: student.id,
//               courseId: Number(courseId),
//               dueDate: new Date(inst.dueDate),
//               amountDue: remaining,
//               amountPaid: paid,
//               paymentMode: paid > 0 ? "CASH" : null,
//               receiptNo,
//               paymentStatus: remaining <= 0 ? "SUCCESS" : "PENDING",
//               clientAdminId,

//               // 👇 Save parameters onto structural parent record
//               transactionNo: paid > 0 ? activeTxNo : null,
//               bankName: paid > 0 ? activeBank : null,
//             },
//           });

//           studentFeeRecords.push(instRec);

//           if (paid > 0) {
//             await tx.studentFeeLog.create({
//               data: {
//                 studentFeeId: instRec.id,
//                 amountPaid: paid,
//                 paymentDate: new Date(),
//                 paymentMode: "CASH",
//                 receiptNo,

//                 // 👇 Save parameters into history line log item
//                 transactionNo: activeTxNo,
//                 bankName: activeBank,
//               },
//             });

//             await tx.financialRecord.create({
//               data: {
//                 clientAdminId,
//                 recordType: "INCOME",
//                 amount: paid,
//                 paymentMode: activeMode,
//                 date: new Date(),
//                 description: `Advance installment collection via ${activeMode}. Ref: ${activeTxNo || 'N/A'}`,
//                 courseId: Number(courseId),
//               },
//             });
//           }
//         }
//       }

//       // ============================
//       // 💥 ONE TIME FLOW
//       // ============================
//       else {
//         const dueDate = new Date(admissionDate);
//         dueDate.setDate(dueDate.getDate() + 21);

//         const paid = Math.min(totalFee, remainingAdvance);
//         const remaining = totalFee - paid;

//         const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);

//         const instRec = await tx.studentFee.create({
//           data: {
//             studentId: student.id,
//             courseId: Number(courseId),
//             dueDate,
//             amountDue: remaining,
//             amountPaid: paid,
//             paymentMode: paid > 0 ? "CASH" : null,
//             receiptNo,
//             paymentStatus: remaining <= 0 ? "SUCCESS" : "PENDING",
//             clientAdminId,

//             // 👇 Save parameters onto structural parent record
//             transactionNo: paid > 0 ? activeTxNo : null,
//             bankName: paid > 0 ? activeBank : null,
//           },
//         });

//         studentFeeRecords.push(instRec);

//         if (paid > 0) {
//           await tx.studentFeeLog.create({
//             data: {
//               studentFeeId: instRec.id,
//               amountPaid: paid,
//               paymentDate: new Date(),
//               paymentMode: "CASH",
//               receiptNo,

//               // 👇 Save parameters into history line log item
//               transactionNo: activeTxNo,
//               bankName: activeBank,
//             },
//           });

//           await tx.financialRecord.create({
//             data: {
//               clientAdminId,
//               recordType: "INCOME",
//               amount: paid,
//               paymentMode: activeMode,
//               date: new Date(),
//               description: `One-time upfront payment via ${activeMode}. Ref: ${activeTxNo || 'N/A'}`,
//               studentId: student.id,
//               courseId: Number(courseId),
//             },
//           });
//         }
//       }

//       allFees.push(studentFeeRecords);

//       // ======================================
//       // LAB PC ALLOCATION
//       // ======================================
//       if (batchExists.labTimeSlotId) {

//         const labTimeSlot = await tx.labTimeSlot.findUnique({
//           where: {
//             id: batchExists.labTimeSlotId,
//           },
//           include: {
//             allocations: {
//               select: {
//                 pcNumber: true,
//               },
//             },
//             lab: {
//               select: {
//                 totalPCs: true,
//               },
//             },
//           },
//         });

//         if (!labTimeSlot) {
//           throw new Error("Lab timeslot not found");
//         }

//         if (labTimeSlot.availablePCs <= 0) {
//           throw new Error("No PCs available");
//         }

//         const totalPCs = labTimeSlot.lab.totalPCs;

//         const usedPCs = new Set(
//           labTimeSlot.allocations.map(
//             (a: any) => a.pcNumber
//           )
//         );

//         let freePC: number | null = null;

//         for (let i = 1; i <= totalPCs; i++) {
//           if (!usedPCs.has(i)) {
//             freePC = i;
//             break;
//           }
//         }

//         if (!freePC) {
//           throw new Error(
//             `No free PCs available for batch ${batchId}`
//           );
//         }

//         const existingAllocation =
//           await tx.labAllocation.findFirst({
//             where: {
//               labTimeSlotId: labTimeSlot.id,
//               pcNumber: freePC,
//             },
//           });

//         if (existingAllocation) {
//           throw new Error(
//             "PC already allocated. Please retry."
//           );
//         }

//         await tx.labAllocation.create({
//           data: {
//             labTimeSlotId: labTimeSlot.id,
//             studentId: student.id,
//             pcNumber: freePC,
//             clientAdminId,
//           },
//         });

//         await tx.labTimeSlot.update({
//           where: {
//             id: labTimeSlot.id,
//           },
//           data: {
//             availablePCs: {
//               decrement: 1,
//             },
//           },
//         });
//       }

//     }

//     return {
//       student,
//       allStudentCourses,
//       allFees,
//     };
//   });
// }

export async function createStudentService({
  prisma,
  clientAdminId,
  data,
}: {
  prisma: any;
  clientAdminId: string;
  data: any;
}) {
  return await prisma.$transaction(async (tx: any) => {
    const {
      name,
      contact,
      email,
      residentialAddress,
      permenantAddress,
      idProofType,
      idProofNumber,
      localAddressProofType,
      localAddressProofNumber,
      referedBy,
      idCard,
      bag,
      admissionDate,
      religion,
      fatherName,
      qualification,
      dob,
      gender,
      parentsContact,
      courseData,
      photoUrl,
      advancePayments,
    } = data;

    console.log("STUDENT DATA RECEIVED IN SERVICE:", data);

    // 1️⃣ STEP 0: MAP ADVANCE PAYMENTS (Extract metadata completely)
    const advanceMap = new Map<number, { 
      amount: number; 
      paymentMode: string; 
      transactionNo: string | null; 
      bankName: string | null; 
    }>();

    if (Array.isArray(advancePayments)) {
      for (const ap of advancePayments) {
        advanceMap.set(Number(ap.courseId), {
          amount: parseFloat(ap.advanceAmount || 0),
          paymentMode: ap.paymentMode || "CASH",
          transactionNo: ap.transactionNo || null,
          bankName: ap.bankName || null
        });
      }
    }

    // 2️⃣ Generate Student Meta Records
    const lastStudent = await tx.student.findFirst({
      orderBy: { serialNumber: "desc" },
      select: { studentCode: true, serialNumber: true },
    });

    const studentCode = Student.generateStudentCode(lastStudent?.studentCode);
    const serialNumber = Student.nextSerialNumber(lastStudent?.serialNumber);
    const parsedDOB = parseDateISO(dob);

    const admissionNumber = await generateAdmissionNumber(tx, clientAdminId);

    // 3️⃣ Create Base Student
    const student = await tx.student.create({
      data: {
        serialNumber,
        admissionNumber,
        studentCode,
        fullName: name,
        contact,
        email,
        residentialAddress,
        permenantAddress,
        idProofType,
        idProofNumber,
        localAddressProofType,
        localAddressProofNumber,
        referedBy,
        idCard,
        bag,
        admissionDate: new Date(admissionDate),
        religion,
        fatherName,
        qualification,
        parentsContact,
        dob: parsedDOB ? new Date(parsedDOB) : null,
        gender,
        photoUrl: photoUrl || null,
        clientAdminId,
      },
    });

    const allStudentCourses: any[] = [];
    const allFees: any[] = [];

    // 4️⃣ LOOP COURSES
    for (const c of courseData) {
      const {
        courseId,
        batchId,
        feeAmount,
        paymentType,
        installmentTypeId,
        installments,
        paymentMode: courseMode,  
        transactionNo: courseTxNo,
        bankName: courseBank,
      } = c;

      const totalFee = parseFloat(feeAmount);
      
      // Look up transaction parameters inside step-0 structural map
      const advInfo = advanceMap.get(Number(courseId));
      let remainingAdvance = advInfo ? advInfo.amount : 0;

      // Cascade Resolution Order: Advance Log Metadata -> Course Row Data fallback -> CASH
      const activeMode = advInfo?.paymentMode || courseMode || "CASH";
      const activeTxNo = activeMode !== "CASH" ? (advInfo?.transactionNo || courseTxNo || null) : null;
      const activeBank = activeMode !== "CASH" ? (advInfo?.bankName || courseBank || null) : null;

      // Core Validations
      const courseExists = await tx.course.findUnique({ where: { id: Number(courseId) } });
      if (!courseExists) throw new Error(`Course ${courseId} not found`);

      const batchExists = await tx.batch.findUnique({ where: { id: Number(batchId) } });
      if (!batchExists) throw new Error(`Batch ${batchId} not found`);

      let batchCourse = await tx.batchCourse.findFirst({
        where: { batchId: Number(batchId), courseId: Number(courseId) },
      });

      if (!batchCourse) {
        batchCourse = await tx.batchCourse.create({
          data: { batchId: Number(batchId), courseId: Number(courseId) },
        });
      }

      const startDate = new Date(admissionDate);
      const endDate = new Date(startDate);
      if (courseExists.durationMonths) {
        endDate.setMonth(startDate.getMonth() + courseExists.durationMonths);
        if (endDate.getDate() !== startDate.getDate()) endDate.setDate(0);
      }

      const studentCourse = await tx.studentCourse.create({
        data: {
          studentId: student.id,
          courseId: Number(courseId),
          batchId: Number(batchId),
          studentCode,
          startDate,
          endDate,
          status: "ACTIVE",
          clientAdminId,
        },
      });
      allStudentCourses.push(studentCourse);

      await tx.feeStructure.create({
        data: {
          studentId: student.id,
          courseId: Number(courseId),
          totalAmount: totalFee,
          paymentType,
          installmentTypeId: paymentType === "INSTALLMENT" ? Number(installmentTypeId) : null,
          clientAdminId,
        },
      });

      let studentFeeRecords: any[] = [];

      // ==========================================
      // 💥 FLOW A: INSTALLMENT PROCESSOR
      // ==========================================
      if (paymentType === "INSTALLMENT" && installments?.length) {
        for (const inst of installments) {
          const instAmount = parseFloat(inst.amount);
          const paid = Math.min(instAmount, remainingAdvance);
          const remaining = instAmount - paid;
          remainingAdvance -= paid;

          const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);

          const instRec = await tx.studentFee.create({
            data: {
              studentId: student.id,
              courseId: Number(courseId),
              dueDate: new Date(inst.dueDate),
              amountDue: remaining,
              amountPaid: paid,
              paymentMode: paid > 0 ? activeMode : null, // ✅ FIXED (Was hardcoded string "CASH")
              receiptNo,
              paymentStatus: remaining <= 0 ? "SUCCESS" : "PENDING",
              clientAdminId,
              transactionNo: paid > 0 ? activeTxNo : null, // ✅ FIXED
              bankName: paid > 0 ? activeBank : null,       // ✅ FIXED
            },
          });
          studentFeeRecords.push(instRec);

          if (paid > 0) {
            await tx.studentFeeLog.create({
              data: {
                studentFeeId: instRec.id,
                amountPaid: paid,
                paymentDate: new Date(),
                paymentMode: activeMode, // ✅ FIXED (Was hardcoded string "CASH")
                receiptNo,
                transactionNo: activeTxNo, // ✅ FIXED
                bankName: activeBank,       // ✅ FIXED
              },
            });

            await tx.financialRecord.create({
              data: {
                clientAdminId,
                recordType: "INCOME",
                amount: paid,
                paymentMode: activeMode, // ✅ FIXED
                date: new Date(),
                description: `Advance installment collection via ${activeMode}. Ref: ${activeTxNo || 'N/A'}`,
                courseId: Number(courseId),
                studentId: student.id,
              },
            });
          }
        }
      }
      // ==========================================
      // 💥 FLOW B: ONE TIME PROCESSOR
      // ==========================================
      else {
        const dueDate = new Date(admissionDate);
        dueDate.setDate(dueDate.getDate() + 21);

        const paid = Math.min(totalFee, remainingAdvance);
        const remaining = totalFee - paid;

        const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);

        const instRec = await tx.studentFee.create({
          data: {
            studentId: student.id,
            courseId: Number(courseId),
            dueDate,
            amountDue: remaining,
            amountPaid: paid,
            paymentMode: paid > 0 ? activeMode : null, // ✅ FIXED (Was hardcoded string "CASH")
            receiptNo,
            paymentStatus: remaining <= 0 ? "SUCCESS" : "PENDING",
            clientAdminId,
            transactionNo: paid > 0 ? activeTxNo : null, // ✅ FIXED
            bankName: paid > 0 ? activeBank : null,       // ✅ FIXED
          },
        });
        studentFeeRecords.push(instRec); // ✅ The clean fix

        if (paid > 0) {
          await tx.studentFeeLog.create({
            data: {
              studentFeeId: instRec.id,
              amountPaid: paid,
              paymentDate: new Date(),
              paymentMode: activeMode, // ✅ FIXED (Was hardcoded string "CASH")
              receiptNo,
              transactionNo: activeTxNo, // ✅ FIXED
              bankName: activeBank,       // ✅ FIXED
            },
          });

          await tx.financialRecord.create({
            data: {
              clientAdminId,
              recordType: "INCOME",
              amount: paid,
              paymentMode: activeMode, // ✅ FIXED
              date: new Date(),
              description: `One-time upfront payment via ${activeMode}. Ref: ${activeTxNo || 'N/A'}`,
              studentId: student.id,
              courseId: Number(courseId),
            },
          });
        }
      }

      allFees.push(studentFeeRecords);

      // ======================================
      // LAB TIME SLOT PC ALLOCATOR 
      // ======================================
      if (batchExists.labTimeSlotId) {
        const labTimeSlot = await tx.labTimeSlot.findUnique({
          where: { id: batchExists.labTimeSlotId },
          include: {
            allocations: { select: { pcNumber: true } },
            lab: { select: { totalPCs: true } },
          },
        });

        if (!labTimeSlot) throw new Error("Lab timeslot not found");
        if (labTimeSlot.availablePCs <= 0) throw new Error("No PCs available");

        const totalPCs = labTimeSlot.lab.totalPCs;
        const usedPCs = new Set(labTimeSlot.allocations.map((a: any) => a.pcNumber));
        let freePC: number | null = null;

        for (let i = 1; i <= totalPCs; i++) {
          if (!usedPCs.has(i)) {
            freePC = i;
            break;
          }
        }

        if (!freePC) throw new Error(`No free PCs available for batch ${batchId}`);

        const existingAllocation = await tx.labAllocation.findFirst({
          where: { labTimeSlotId: labTimeSlot.id, pcNumber: freePC },
        });
        if (existingAllocation) throw new Error("PC already allocated. Please retry.");

        await tx.labAllocation.create({
          data: {
            labTimeSlotId: labTimeSlot.id,
            studentId: student.id,
            pcNumber: freePC,
            clientAdminId,
          },
        });

        await tx.labTimeSlot.update({
          where: { id: labTimeSlot.id },
          data: { availablePCs: { decrement: 1 } },
        });
      }
    }

    return {
      student,
      allStudentCourses,
      allFees,
    };
  });
}

export async function createStudentOpeningBalanceService({
  prisma,
  clientAdminId,
  data,
}: {
  prisma: any;
  clientAdminId: string;
  data: any;
}) {
  const { name, contact, dueAmount, admissionDate } = data;

    if (name) {
      const existingEmail = await prisma.student.findFirst({
        where: { fullName: name, clientAdminId },
      });
      ensureUniqueStudent(!!existingEmail, false);
    } 
  
    if (contact) {
      const existingContact = await prisma.student.findFirst({
        where: { contact, clientAdminId },
      });
      ensureUniqueStudent(false, !!existingContact);
    }

  return await prisma.$transaction(async (tx: any) => {

    const lastStudent = await tx.student.findFirst({
      orderBy: { id: "desc" },
      select: { studentCode: true, serialNumber: true },
    });

    const studentCode =
      Student.generateStudentCode(lastStudent?.studentCode);
    const serialNumber =
      Student.nextSerialNumber(lastStudent?.serialNumber);
    const admissionNumber = 
      await generateAdmissionNumber(tx, clientAdminId);

    const parsedAdmissionDate = parseDate(admissionDate);

    const student = await tx.student.create({
      data: {
        serialNumber,
        studentCode,
        admissionNumber,
        admissionDate: parsedAdmissionDate ? new Date(parsedAdmissionDate) : null,
        fullName: name,
        contact,
        clientAdminId,
      },
    });

    if (dueAmount && dueAmount > 0) {
      const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);
      await tx.studentFee.create({
        data: {
          studentId: student.id,
          courseId: null,
          dueDate: new Date(),
          amountDue: dueAmount,
          amountPaid: 0,
          receiptNo,
          paymentStatus: "PENDING",
          isOpeningBalance: true,
          sourceType: "DIRECT_CREATION",
          clientAdminId,
        },
      });
    }

    return student;
  });
}

export async function editStudentService({
  prisma,
  clientAdminId,
  data,
}: {
  prisma: any;
  clientAdminId: string;
  data: any;
}) {
  const {
    id, // enquiryId
    name,
    contact,
    email,
    residentialAddress,
    permenantAddress,
    idProofType,
    idProofNumber,
    religion,
    fatherName,
    qualification,
    dob,
    gender,
    parentsContact,
  } = data;

  const parsedDOB = parseDateISO(dob);

  console.log("FIND THE STUDENT EDIT DATA IN SERVICE:", data);
  // 2️⃣ Create student
  const student = await prisma.student.update({
    where: {
      id
    },
    data: {
      fullName: name,
      contact,
      email,
      residentialAddress,
      permenantAddress,
      idProofType,
      idProofNumber,
      religion,
      fatherName,
      qualification,
      parentsContact,
      dob: parsedDOB ? new Date(parsedDOB) : null, // ✅ full ISO
      gender,
    },
  });

  

  const getAllStudent = await prisma.student.findMany()

  return { student, getAllStudent };
}
