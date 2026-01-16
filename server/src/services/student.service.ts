// services/enquiry.service.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";
import { z } from "zod";
import { buildStudentWhere } from "../filters/student.filter";
import { buildStudentOrderBy } from "../filters/student.sort";
import { studentQuerySchema } from "../validators/student.query";

type StudentQuery = z.infer<typeof studentQuerySchema>;

export async function getStudents({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildStudentWhere({
    clientAdminId,
    search: query.search,
    courseId: query.courseId,
    admissionDate: query.admissionDate,
    
  });

  const orderBy = buildStudentOrderBy(
    query.sortField,
    query.sortOrder
  );

  const [data, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: {
        labAllocations: true,
        studentCourses: true,
      },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
