// filters/enquiry.filter.ts
import { PrismaClient, $Enums } from "../../prisma-client/generated/tenant";
import { normalizeEmail, normalizePhone, normalizeToUppercase, titleCase } from "../utils/Normalize";

type StudentWhere = NonNullable<
  Parameters<PrismaClient["student"]["findMany"]>[0]
>["where"];

export function buildStudentWhere({
  clientAdminId,
  search,
  courseId,
  admissionDate,
}: {
  clientAdminId: string; // ✅ matches schema
  search?: string;
  courseId?: number;
  admissionDate?: string;
}): StudentWhere {

  const where: StudentWhere = {
    clientAdminId,
  };



  if (search) {
    const normalizedNameSearch = titleCase(search);
    const normalizedEmailSearch = normalizeEmail(search);
    const normalizedPhoneSearch = normalizePhone(search);
    const normalizeStudentCode = normalizeToUppercase(search);
    
    const numeric = Number(search);
    where.OR = [
      { fullName: { contains: normalizedNameSearch } },
      // { email: { startsWith: normalizedEmailSearch } },
      { studentCode: { startsWith: normalizeStudentCode } },
      { contact: { contains: search } },
    //   ...(isNaN(numeric) ? [] : [{ srNo: numeric }]),
    ];
  }

  if (courseId) {
    where.studentCourses = {
      some: {
        courseId: Number(courseId),
      },
    };
  }

  if (admissionDate) {
    const start = new Date(admissionDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(admissionDate);
    end.setHours(23, 59, 59, 999);

    where.admissionDate = { gte: start, lte: end };
  }

  return where;
}
