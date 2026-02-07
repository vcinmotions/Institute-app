import { $Enums, PrismaClient } from "../../prisma-client/generated/tenant";
import { normalizeEmail, normalizeToUppercase, titleCase } from "../utils/Normalize";

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
    const normalizeStudent = titleCase(search);
    const normalizeStudentCourse = titleCase(search);
    const normalizeStudentCode = normalizeToUppercase(search);
    const normalizeStudentEmail = normalizeEmail(search);

    where.OR = [
      {
        student: {
          OR: [
            { fullName: { contains: normalizeStudent } },
            { email: { contains: normalizeStudentEmail } },
            { studentCode: { contains: normalizeStudentCode } },
            { contact: { contains: search } },
          ],
        },
      },
      {
        course: {
          OR: [
            { name: { contains: normalizeStudentCourse } },
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
