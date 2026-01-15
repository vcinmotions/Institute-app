// filters/enquiry.filter.ts
import { PrismaClient, $Enums } from "../../prisma-client/generated/tenant";

type EnquiryWhere = NonNullable<
  Parameters<PrismaClient["enquiry"]["findMany"]>[0]
>["where"];

export function buildEnquiryWhere({
  clientAdminId,
  search,
  leadStatus,
  courseId,
  createdDate,
}: {
  clientAdminId: string; // ✅ matches schema
  search?: string;
  leadStatus?: $Enums.LeadStatus;
  courseId?: number;
  createdDate?: string;
}): EnquiryWhere {

  const where: EnquiryWhere = {
    clientAdminId,
  };

  if (search) {
    const numeric = Number(search);
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { city: { contains: search } },
      { contact: { contains: search } },
      ...(isNaN(numeric) ? [] : [{ srNo: numeric }]),
    ];
  }

  if (leadStatus) {
    where.leadStatus = leadStatus;
  }

  if (courseId) {
    where.enquiryCourse = {
      some: { courseId },
    };
  }

  if (createdDate) {
    const start = new Date(createdDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(createdDate);
    end.setHours(23, 59, 59, 999);

    where.createdAt = { gte: start, lte: end };
  }

  return where;
}
