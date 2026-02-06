// filters/enquiry.filter.ts
import { PrismaClient, $Enums } from "../../prisma-client/generated/tenant";
import { normalizeEmail, normalizePhone, normalizeToLowercase, titleCase } from "../utils/Normalize";

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
     const normalizedNameSearch = titleCase(search);
     const normalizedEmailSearch = normalizeEmail(search);
     const normalizedLocationSearch = normalizeToLowercase(search);

    const numeric = Number(search);
    where.OR = [
      { name: { contains: normalizedNameSearch } },
      { email: { contains: normalizedEmailSearch } },
      { location: { contains: normalizedLocationSearch } },
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
