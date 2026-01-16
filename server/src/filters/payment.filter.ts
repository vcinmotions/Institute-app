import { $Enums, PrismaClient } from "../../prisma-client/generated/tenant";

type PaymentWhere = NonNullable<
  Parameters<PrismaClient["studentFee"]["findMany"]>[0]
>["where"];

export function buildPaymentWhere({
  clientAdminId,
  search,
  paymentStatus,
  paymentMode,
  fromDate,
  toDate,
}: {
  clientAdminId: string;
  search?: string;
  paymentStatus?: $Enums.PaymentStatus;
  paymentMode?: $Enums.PaymentMode;
  fromDate?: string;
  toDate?: string;
}): PaymentWhere {
  const where: PaymentWhere = { clientAdminId };

  if (search) {
    where.OR = [
      {
        student: {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } },
            { studentCode: { contains: search } },
            { contact: { contains: search } },
          ],
        },
      },
      {
        course: {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        },
      },
    ];
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (paymentMode) {
    where.paymentMode = paymentMode;
  }

  if (fromDate && toDate) {
    where.paymentDate = {
      gte: new Date(fromDate),
      lte: new Date(toDate),
    };
  } else if (fromDate) {
    where.paymentDate = { gte: new Date(fromDate) };
  } else if (toDate) {
    where.paymentDate = { lte: new Date(toDate) };
  }

  return where;
}
