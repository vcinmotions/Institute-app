// services/enquiry.service.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";
import { z } from "zod";
import { buildStudentWhere } from "../filters/student.filter";
import { buildStudentOrderBy } from "../filters/student.sort";
import { studentQuerySchema } from "../validators/student.query";
import { Student } from "../domain/student/student";

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

  const [data, total] = await prisma.$transaction([
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
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function createStudentService({
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
    admissionDate,
    religion,
    fatherName,
    motherName,
    dob,
    gender,
    parentsContact,
    courseData,
    photoUrl,
  } = data;

  // 1️⃣ Get last student for code/serial
  const lastStudent = await prisma.student.findFirst({
    orderBy: { id: "desc" },
    select: { studentCode: true, serialNumber: true },
  });

  const studentCode = Student.generateStudentCode(lastStudent?.studentCode);
  const serialNumber = Student.nextSerialNumber(lastStudent?.serialNumber);

  // 2️⃣ Create student
  const student = await prisma.student.create({
    data: {
      serialNumber,
      studentCode,
      fullName: name,
      contact,
      email,
      residentialAddress,
      permenantAddress,
      idProofType,
      idProofNumber,
      admissionDate: new Date(admissionDate), // ✅ full ISO
      religion,
      fatherName,
      motherName,
      parentsContact,
      dob: dob, // ✅ full ISO
      gender,
      photoUrl: photoUrl || null,
      clientAdminId,
    },
  });

  const allStudentCourses: any[] = [];
  const allFees: any[] = [];

  // 3️⃣ Handle courseData
  for (const c of courseData) {
    const {
      courseId,
      batchId,
      feeAmount,
      paymentType,
      installmentTypeId,
      installments,
    } = c;

    // Validate course and batch
    const courseExists = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });
    if (!courseExists) throw new Error(`Course ${courseId} not found`);

    const batchExists = await prisma.batch.findUnique({
      where: { id: Number(batchId) },
    });
    if (!batchExists) throw new Error(`Batch ${batchId} not found`);

    // Ensure BatchCourse relation
    let batchCourse = await prisma.batchCourse.findFirst({
      where: { batchId: Number(batchId), courseId: Number(courseId) },
    });

    if (!batchCourse) {
      batchCourse = await prisma.batchCourse.create({
        data: {
          batchId: Number(batchId),
          courseId: Number(courseId),
        },
      });
    }

    // Create StudentCourse
    const startDate = new Date(admissionDate);
    const endDate = new Date(startDate);
    if (courseExists.durationWeeks) {
      endDate.setDate(startDate.getDate() + courseExists.durationWeeks * 7);
    }

    const studentCourse = await prisma.studentCourse.create({
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

    // Handle Fees
    const feeStructure = await prisma.feeStructure.create({
      data: {
        studentId: student.id,
        courseId: Number(courseId),
        totalAmount: parseFloat(feeAmount),
        paymentType,
        installmentTypeId:
          paymentType === "INSTALLMENT" ? Number(installmentTypeId) : null,
        clientAdminId,
      },
    });

    let studentFeeRecords: any[] = [];

    if (paymentType === "INSTALLMENT" && installments?.length) {
      for (const inst of installments) {
        const instRec = await prisma.studentFee.create({
          data: {
            studentId: student.id,
            courseId: Number(courseId),
            dueDate: new Date(inst.dueDate),
            amountDue: inst.amount,
            amountPaid: 0,
            paymentMode: "CASH",
            receiptNo: `RCP${Date.now()}`,
            paymentStatus: "PENDING",
            clientAdminId,
          },
        });
        studentFeeRecords.push(instRec);
      }
    } else {
      const dueDate = new Date(admissionDate);
      dueDate.setDate(dueDate.getDate() + 21);
      const instRec = await prisma.studentFee.create({
        data: {
          studentId: student.id,
          courseId: Number(courseId),
          dueDate,
          amountDue: parseFloat(feeAmount),
          amountPaid: 0,
          paymentMode: "CASH",
          receiptNo: `RCP${Date.now()}`,
          paymentStatus: "PENDING",
          clientAdminId,
        },
      });
      studentFeeRecords.push(instRec);
    }

    allFees.push(studentFeeRecords);

    //Allocate PC → SAFE VERSION
      if (batchExists.labTimeSlotId) {
        await prisma.$transaction(async (tx: any) => {
          const labTimeSlot = await tx.labTimeSlot.findUnique({
            where: { id: batchExists.labTimeSlotId },
            include: {
              allocations: {
                select: { pcNumber: true },
              },
              lab: {
                select: { totalPCs: true },
              },
            },
          });

          if (!labTimeSlot) {
            throw new Error("Lab timeslot not found");
          }

          const totalPCs = labTimeSlot.lab.totalPCs;
          const usedPCs = new Set(
            labTimeSlot.allocations.map((a: { pcNumber: any; }) => a.pcNumber)
          );

          // 🔍 Find first free PC
          let freePC: number | null = null;
          for (let i = 1; i <= totalPCs; i++) {
            if (!usedPCs.has(i)) {
              freePC = i;
              break;
            }
          }

          if (!freePC) {
            throw new Error("No free PCs in the lab time slot");
          }

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
            data: {
              availablePCs: { decrement: 1 },
            },
          });
        });
      }
    }

  return { student, allStudentCourses, allFees };
}
