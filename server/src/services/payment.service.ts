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

  // 1. Fetch the core paginated records
  const [payments, total] = await prisma.$transaction([
    prisma.studentFee.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: {
        student: true,
        course: true,
        feeLogs: true,
      },
    }),
    prisma.studentFee.count({ where }),
  ]);

  // 2. Map and structurally merge side-queries directly into each object
  const unifiedPayments = await Promise.all(
    payments.map(async (paymentItem) => {
      // Default structural fallbacks if there's no course context
      if (!paymentItem.courseId) {
        return {
          ...paymentItem, // Spreads id, amountDue, amountPaid, student, course, feeLogs, etc.
          feeStructure: null,
          feeRecords: [],
        };
      }

      // Fetch accompanying relational information concurrently for this record
      const [feeStructure, feeRecords] = await Promise.all([
        prisma.feeStructure.findUnique({
          where: {
            studentId_courseId: {
              studentId: paymentItem.studentId,
              courseId: paymentItem.courseId,
            },
          },
        }),
        prisma.studentFee.findMany({
          where: {
            studentId: paymentItem.studentId,
            courseId: paymentItem.courseId,
          },
        }),
      ]);

      // Return one single enriched object
      return {
        ...paymentItem, 
        feeStructure,
        feeRecords,
      };
    })
  );

  // 3. Return the unified array directly to the 'data' key
  return {
    data: unifiedPayments, 
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}