import { PrismaClient } from '@prisma/client';

export class AdvancePaymentService {
  constructor(private prisma: PrismaClient) {}

  async updateAdvancePaymentsWithStudentId(
    clientAdminId: string,
    courseId: string,
    studentId: string
  ) {
    try {
      // Update all advance payment records for this course and client
      const updatedRecords = await this.prisma.studentFee.updateMany({
        where: {
          clientAdminId,
          courseId: Number(courseId),
          studentId: null, // Only update records where studentId is null
          sourceType: "ADVANCE_PAYMENT",
        },
        data: {
          studentId,
        },
      });

      // Also update financial records
      await this.prisma.financialRecord.updateMany({
        where: {
          clientAdminId,
          courseId: Number(courseId),
          studentId: null,
          recordType: "INCOME",
        },
        data: {
          studentId,
        },
      });

      return updatedRecords;
    } catch (error) {
      console.error("Error updating advance payments with student ID:", error);
      throw error;
    }
  }

  async getAdvancePaymentsByCourseAndClient(
    clientAdminId: string,
    courseId: string
  ) {
    try {
      return await this.prisma.studentFee.findMany({
        where: {
          clientAdminId,
          courseId: Number(courseId),
          sourceType: "ADVANCE_PAYMENT",
        },
        include: {
          course: true,
        },
      });
    } catch (error) {
      console.error("Error fetching advance payments:", error);
      throw error;
    }
  }
}
