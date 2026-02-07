// filters/enquiry.filter.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";
import { normalizeEmail, normalizeToUppercase, titleCase } from "../utils/Normalize";

type StudentCourseWhere = NonNullable<
  Parameters<PrismaClient["studentCourse"]["findMany"]>[0]
>["where"];

export function buildStudentCourseWhere({
  clientAdminId,
  search,
  courseId,
  batchId,
  facultyId,
}: {
  clientAdminId: string;
  search?: string;
  courseId?: number;
  batchId?: number;
  facultyId?: number;
}): StudentCourseWhere {
  const where: StudentCourseWhere = {
    clientAdminId,
  };

  if (search) {
    const normalizeStudentCourseName = titleCase(search);
    const normalizeStudentCourse = titleCase(search);
    const normalizeStudentCourseEmail = normalizeEmail(search);
    const normalizeStudentCode = normalizeToUppercase(search);
    where.OR = [
      {
        student: {
          OR: [
            { fullName: { contains: normalizeStudentCourseName } },
            { email: { contains: normalizeStudentCourseEmail } },
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

  if (courseId) {
    where.courseId = courseId;
  }

  if (batchId) {
    where.batchId = batchId;
  }

  if (facultyId) {
    where.batch = {
      facultyId,
    };
  }

  return where;
}