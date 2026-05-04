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
//   const {
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
//     courseData,
//     photoUrl,
//   } = data;

//   // 1️⃣ Get last student for code/serial
//   const lastStudent = await prisma.student.findFirst({
//     orderBy: { id: "desc" },
//     select: { studentCode: true, serialNumber: true },
//   });

//   const studentCode = Student.generateStudentCode(lastStudent?.studentCode);
//   const serialNumber = Student.nextSerialNumber(lastStudent?.serialNumber);

//   const parsedDOB = parseDateISO(dob);

//   const admissionNumber = await generateAdmissionNumber(prisma, clientAdminId);

//   // 2️⃣ Create student
//   const student = await prisma.student.create({
//     data: {
//       serialNumber: admissionNumber,
//       studentCode,
//       fullName: name,
//       contact,
//       email,
//       residentialAddress,
//       permenantAddress,
//       idProofType,
//       idProofNumber,
//       admissionDate: new Date(admissionDate), // ✅ full ISO
//       religion,
//       fatherName,
//       motherName,
//       parentsContact,
//       dob: parsedDOB ? new Date(parsedDOB) : null, // ✅ full ISO
//       gender,
//       photoUrl: photoUrl || null,
//       clientAdminId,
//     },
//   });

//   const allStudentCourses: any[] = [];
//   const allFees: any[] = [];

//   // 3️⃣ Handle courseData
//   for (const c of courseData) {
//     const {
//       courseId,
//       batchId,
//       feeAmount,
//       paymentType,
//       installmentTypeId,
//       installments,
//     } = c;

//     // Validate course and batch
//     const courseExists = await prisma.course.findUnique({
//       where: { id: Number(courseId) },
//     });
//     if (!courseExists) throw new Error(`Course ${courseId} not found`);

//     const batchExists = await prisma.batch.findUnique({
//       where: { id: Number(batchId) },
//     });
//     if (!batchExists) throw new Error(`Batch ${batchId} not found`);

//     // Ensure BatchCourse relation
//     let batchCourse = await prisma.batchCourse.findFirst({
//       where: { batchId: Number(batchId), courseId: Number(courseId) },
//     });

//     if (!batchCourse) {
//       batchCourse = await prisma.batchCourse.create({
//         data: {
//           batchId: Number(batchId),
//           courseId: Number(courseId),
//         },
//       });
//     }

//     // Create StudentCourse
//     const startDate = new Date(admissionDate);
//     const endDate = new Date(startDate);
//     if (courseExists.durationWeeks) {
//       endDate.setDate(startDate.getDate() + courseExists.durationWeeks * 7);
//     }

//     const studentCourse = await prisma.studentCourse.create({
//       data: {
//         studentId: student.id,
//         courseId: Number(courseId),
//         batchId: Number(batchId),
//         studentCode,
//         startDate,
//         endDate,
//         status: "ACTIVE",
//         clientAdminId,
//       },
//     });

//     allStudentCourses.push(studentCourse);

//     // Handle Fees
//     const feeStructure = await prisma.feeStructure.create({
//       data: {
//         studentId: student.id,
//         courseId: Number(courseId),
//         totalAmount: parseFloat(feeAmount),
//         paymentType,
//         installmentTypeId:
//           paymentType === "INSTALLMENT" ? Number(installmentTypeId) : null,
//         clientAdminId,
//       },
//     });

//     let studentFeeRecords: any[] = [];

//     if (paymentType === "INSTALLMENT" && installments?.length) {
//       for (const inst of installments) {
//         const instRec = await prisma.studentFee.create({
//           data: {
//             studentId: student.id,
//             courseId: Number(courseId),
//             dueDate: new Date(inst.dueDate),
//             amountDue: inst.amount,
//             amountPaid: 0,
//             paymentMode: "CASH",
//             // receiptNo: `RCP${Date.now()}`,
//             paymentStatus: "PENDING",
//             clientAdminId,
//           },
//         });
//         studentFeeRecords.push(instRec);
//       }
//     } else {
//       const dueDate = new Date(admissionDate);
//       dueDate.setDate(dueDate.getDate() + 21);
//       const instRec = await prisma.studentFee.create({
//         data: {
//           studentId: student.id,
//           courseId: Number(courseId),
//           dueDate,
//           amountDue: parseFloat(feeAmount),
//           amountPaid: 0,
//           paymentMode: "CASH",
//           // receiptNo: `RCP${Date.now()}`,
//           paymentStatus: "PENDING",
//           clientAdminId,
//         },
//       });
//       studentFeeRecords.push(instRec);
//     }

//     allFees.push(studentFeeRecords);

//     //Allocate PC → SAFE VERSION
//       if (batchExists.labTimeSlotId) {
//         await prisma.$transaction(async (tx: any) => {
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
//             labTimeSlot.allocations.map((a: { pcNumber: any; }) => a.pcNumber)
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

//   return { student, allStudentCourses, allFees };
// }


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

//     console.log("STUDEMT ADMISSION DATA IN STUDENT SERVICE:", data);

//     // 1️⃣ Get last student
//     const lastStudent = await tx.student.findFirst({
//       orderBy: { serialNumber: "desc" },
//       select: { studentCode: true, serialNumber: true },
//     });

//     const studentCode = Student.generateStudentCode(lastStudent?.studentCode);
//     const serialNumber = Student.nextSerialNumber(lastStudent?.serialNumber);

//     const parsedDOB = parseDateISO(dob);

//     // 2️⃣ Generate Admission Number
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

//     // 4️⃣ Handle courseData
//     for (const c of courseData) {

//       const {
//         courseId,
//         batchId,
//         feeAmount,
//         paymentType,
//         installmentTypeId,
//         installments,
//       } = c;

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
//         where: {
//           batchId: Number(batchId),
//           courseId: Number(courseId),
//         },
//       });

//       if (!batchCourse) {
//         batchCourse = await tx.batchCourse.create({
//           data: {
//             batchId: Number(batchId),
//             courseId: Number(courseId),
//           },
//         });
//       }

//     // StudentCourse
//     const startDate = new Date(admissionDate);
//     const endDate = new Date(startDate);

//     if (courseExists.durationMonths) {
//       const targetMonth = startDate.getMonth() + courseExists.durationMonths;
//       endDate.setMonth(targetMonth);

//       // Fix overflow (e.g., Feb issue)
//       if (endDate.getDate() !== startDate.getDate()) {
//         endDate.setDate(0); // last day of previous month
//       }
//     }

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
//           totalAmount: parseFloat(feeAmount),
//           paymentType,
//           installmentTypeId:
//             paymentType === "INSTALLMENT"
//               ? Number(installmentTypeId)
//               : null,
//           clientAdminId,
//         },
//       });

//       let studentFeeRecords: any[] = [];

//       if (paymentType === "INSTALLMENT" && installments?.length) {

//         for (const inst of installments) {

//           const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);
//           const instRec = await tx.studentFee.create({
//             data: {
//               studentId: student.id,
//               courseId: Number(courseId),
//               dueDate: new Date(inst.dueDate),
//               amountDue: inst.amount,
//               amountPaid: 0,
//               paymentMode: "CASH",
//               receiptNo,
//               paymentStatus: "PENDING",
//               clientAdminId,
//             },
//           });

//           studentFeeRecords.push(instRec);
//         }

//       } else {

//         const dueDate = new Date(admissionDate);
//         dueDate.setDate(dueDate.getDate() + 21);

//         const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);
//         const instRec = await tx.studentFee.create({
//           data: {
//             studentId: student.id,
//             courseId: Number(courseId),
//             dueDate,
//             amountDue: parseFloat(feeAmount),
//             amountPaid: 0,
//             paymentMode: "CASH",
//             receiptNo,
//             paymentStatus: "PENDING",
//             clientAdminId,
//           },
//         });

//         studentFeeRecords.push(instRec);
//       }

//       allFees.push(studentFeeRecords);

//       // 5️⃣ Allocate Lab PC
//       if (batchExists.labTimeSlotId) {

//         const labTimeSlot = await tx.labTimeSlot.findUnique({
//           where: { id: batchExists.labTimeSlotId },
//           include: {
//             allocations: {
//               select: { pcNumber: true },
//             },
//             lab: {
//               select: { totalPCs: true },
//             },
//           },
//         });

//         if (!labTimeSlot) throw new Error("Lab timeslot not found");

//         const totalPCs = labTimeSlot.lab.totalPCs;

//         const usedPCs = new Set(
//           labTimeSlot.allocations.map((a: any) => a.pcNumber)
//         );

//         let freePC: number | null = null;

//         for (let i = 1; i <= totalPCs; i++) {
//           if (!usedPCs.has(i)) {
//             freePC = i;
//             break;
//           }
//         }

//         if (!freePC) {
//           throw new Error("No free PCs in the lab time slot");
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
//           where: { id: labTimeSlot.id },
//           data: {
//             availablePCs: { decrement: 1 },
//           },
//         });
//       }
//     }

//     // 7️⃣ Process advance payments after student creation
//     // if (advancePayments && Array.isArray(advancePayments) && advancePayments.length > 0) {
//     //   console.log("Processing advance payments for student:", student.id);
      
//     //   for (const payment of advancePayments) {
//     //     const { courseId, courseName, advanceAmount, paymentMode, paymentDate } = payment;

//     //     if (!courseId || !advanceAmount || parseFloat(advanceAmount) <= 0) {
//     //       continue; // Skip invalid payments
//     //     }

//     //     // Get the course fee structure to determine total course fee
//     //     const feeStructure = await tx.feeStructure.findUnique({
//     //       where: {
//     //         studentId_courseId: {
//     //           studentId: student.id,
//     //           courseId: Number(courseId),
//     //         },
//     //       },
//     //     });

//     //     if (!feeStructure) {
//     //       console.log(`No fee structure found for course ${courseId}, skipping advance payment`);
//     //       continue;
//     //     }

//     //     const totalCourseFee = feeStructure.totalAmount;
//     //     const advancePaymentAmount = parseFloat(advanceAmount);

//     //     // Determine payment status based on advance amount vs course fee
//     //     let paymentStatus = "PENDING";
//     //     let amountDue = 0;
//     //     let amountPaid = advancePaymentAmount;

//     //     if (advancePaymentAmount >= totalCourseFee) {
//     //       // Full payment - mark as success
//     //       paymentStatus = "SUCCESS";
//     //       amountDue = 0;
//     //       amountPaid = totalCourseFee; // Don't overpay, cap at course fee
//     //     } else {
//     //       // Partial payment - mark as pending, remaining due is course fee - advance
//     //       paymentStatus = "PENDING";
//     //       amountDue = totalCourseFee - advancePaymentAmount;
//     //       amountPaid = advancePaymentAmount;
//     //     }

//     //     // Generate receipt number
//     //     const receiptNo = await generatePaymentReceiptNumber(tx, clientAdminId);

//     //     // Create student fee record for advance payment
//     //     const studentFee = await tx.studentFee.create({
//     //       data: {
//     //         studentId: student.id, // Use actual student ID now
//     //         courseId: Number(courseId),
//     //         dueDate: new Date(paymentDate || Date.now()),
//     //         amountDue: amountDue,
//     //         amountPaid: amountPaid,
//     //         paymentMode: paymentMode || "CASH",
//     //         receiptNo,
//     //         paymentStatus: paymentStatus,
//     //         clientAdminId,
//     //         sourceType: "ADVANCE_PAYMENT",
//     //       },
//     //     });

//     //     // Create student fee log for advance payment
//     //     await tx.studentFeeLog.create({
//     //       data: {
//     //         studentFeeId: studentFee.id,
//     //         amountPaid: amountPaid,
//     //         paymentDate: new Date(paymentDate || Date.now()),
//     //         paymentMode: paymentMode || "CASH",
//     //         receiptNo,
//     //       },
//     //     });

//     //     // Create financial record
//     //     await tx.financialRecord.create({
//     //       data: {
//     //         clientAdminId,
//     //         recordType: "INCOME",
//     //         amount: amountPaid,
//     //         paymentMode: paymentMode || "CASH",
//     //         date: new Date(paymentDate || Date.now()),
//     //         description: `Advance payment of ₹${amountPaid} for ${courseName} (${paymentStatus === "SUCCESS" ? "Full payment" : "Partial payment"})`,
//     //         studentId: student.id,
//     //         courseId: Number(courseId),
//     //       },
//     //     });

//     //     console.log(`Created advance payment record: ${receiptNo} for amount ₹${amountPaid} (Status: ${paymentStatus})`);
//     //   }
//     // }

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

    console.log("STUDENT DATA:", data);

    // 🔥 STEP 0: MAP ADVANCE PAYMENTS
    const advanceMap = new Map<number, number>();

    if (Array.isArray(advancePayments)) {
      for (const ap of advancePayments) {
        advanceMap.set(
          Number(ap.courseId),
          parseFloat(ap.advanceAmount || 0)
        );
      }
    }

    // 1️⃣ Get last student
    const lastStudent = await tx.student.findFirst({
      orderBy: { serialNumber: "desc" },
      select: { studentCode: true, serialNumber: true },
    });

    const studentCode = Student.generateStudentCode(lastStudent?.studentCode);
    const serialNumber = Student.nextSerialNumber(lastStudent?.serialNumber);

    const parsedDOB = parseDateISO(dob);

    // 2️⃣ Admission Number
    const admissionNumber = await generateAdmissionNumber(tx, clientAdminId);

    // 3️⃣ Create Student
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
      } = c;

      const totalFee = parseFloat(feeAmount);
      let remainingAdvance = advanceMap.get(Number(courseId)) || 0;

      // Validate
      const courseExists = await tx.course.findUnique({
        where: { id: Number(courseId) },
      });
      if (!courseExists) throw new Error(`Course ${courseId} not found`);

      const batchExists = await tx.batch.findUnique({
        where: { id: Number(batchId) },
      });
      if (!batchExists) throw new Error(`Batch ${batchId} not found`);

      // Ensure BatchCourse
      let batchCourse = await tx.batchCourse.findFirst({
        where: { batchId: Number(batchId), courseId: Number(courseId) },
      });

      if (!batchCourse) {
        batchCourse = await tx.batchCourse.create({
          data: {
            batchId: Number(batchId),
            courseId: Number(courseId),
          },
        });
      }

      // Dates
      const startDate = new Date(admissionDate);
      const endDate = new Date(startDate);

      if (courseExists.durationMonths) {
        endDate.setMonth(startDate.getMonth() + courseExists.durationMonths);
        if (endDate.getDate() !== startDate.getDate()) {
          endDate.setDate(0);
        }
      }

      // StudentCourse
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

      // FeeStructure
      await tx.feeStructure.create({
        data: {
          studentId: student.id,
          courseId: Number(courseId),
          totalAmount: totalFee,
          paymentType,
          installmentTypeId:
            paymentType === "INSTALLMENT"
              ? Number(installmentTypeId)
              : null,
          clientAdminId,
        },
      });

      let studentFeeRecords: any[] = [];

      // ============================
      // 💥 INSTALLMENT FLOW
      // ============================
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
              paymentMode: paid > 0 ? "CASH" : null,
              receiptNo,
              paymentStatus: remaining <= 0 ? "SUCCESS" : "PENDING",
              clientAdminId,
            },
          });

          studentFeeRecords.push(instRec);

          if (paid > 0) {
            await tx.studentFeeLog.create({
              data: {
                studentFeeId: instRec.id,
                amountPaid: paid,
                paymentDate: new Date(),
                paymentMode: "CASH",
                receiptNo,
              },
            });

            await tx.financialRecord.create({
              data: {
                clientAdminId,
                recordType: "INCOME",
                amount: paid,
                paymentMode: "CASH",
                date: new Date(),
                description: `Advance installment payment`,
                studentId: student.id,
                courseId: Number(courseId),
              },
            });
          }
        }
      }

      // ============================
      // 💥 ONE TIME FLOW
      // ============================
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
            paymentMode: paid > 0 ? "CASH" : null,
            receiptNo,
            paymentStatus: remaining <= 0 ? "SUCCESS" : "PENDING",
            clientAdminId,
          },
        });

        studentFeeRecords.push(instRec);

        if (paid > 0) {
          await tx.studentFeeLog.create({
            data: {
              studentFeeId: instRec.id,
              amountPaid: paid,
              paymentDate: new Date(),
              paymentMode: "CASH",
              receiptNo,
            },
          });

          await tx.financialRecord.create({
            data: {
              clientAdminId,
              recordType: "INCOME",
              amount: paid,
              paymentMode: "CASH",
              date: new Date(),
              description: `Advance payment`,
              studentId: student.id,
              courseId: Number(courseId),
            },
          });
        }
      }

      allFees.push(studentFeeRecords);
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
