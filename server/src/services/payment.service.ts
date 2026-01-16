import { PrismaClient } from "../../prisma-client/generated/tenant";
import { z } from "zod";
import { paymentQuerySchema } from "../validators/payment.query";
import { buildPaymentWhere } from "../filters/payment.filter";
import { buildPaymentOrderBy } from "../filters/payment.sort";

type PaymentQuery = z.infer<typeof paymentQuerySchema>;

export async function getPayment({
  prisma,
  clientAdminId,
  query,
}: {
  prisma: PrismaClient;
  clientAdminId: string;
  query: PaymentQuery;
}) {
  const skip = (query.page - 1) * query.limit;

  const where = buildPaymentWhere({
    clientAdminId,
    search: query.search,
    paymentStatus: query.paymentStatus,
    paymentMode: query.paymentMode,
    fromDate: query.fromDate,
    toDate: query.toDate,
  });

  const orderBy = buildPaymentOrderBy(query.sortField, query.sortOrder);

  const [payments, total] = await prisma.$transaction([
    prisma.studentFee.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: {
        student: true,
        course: true,
        feeStructure: true,
        feeLogs: true,
      },
    }),
    prisma.studentFee.count({ where }),
  ]);

  // Optional: enrich with detailed fee structure
  const detailedPayments = await Promise.all(
    payments.map(async (p) => {
      const feeStructure = await prisma.feeStructure.findUnique({
        where: {
          studentId_courseId: {
            studentId: p.studentId,
            courseId: p.courseId,
          },
        },
      });

      const feeRecords = await prisma.studentFee.findMany({
        where: { studentId: p.studentId, courseId: p.courseId },
      });

      return {
        studentPayment: p,
        feeStructure,
        feeRecords,
      };
    })
  );

  return {
    data: payments,
    detailedPayments,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
