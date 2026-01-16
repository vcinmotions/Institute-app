// filters/enquiry.filter.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";

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