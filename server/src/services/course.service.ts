// services/enquiry.service.ts

import { buildBatchWhere } from "../filters/batch.filter";
import { buildCourseWhere } from "../filters/course.filter";

export async function getCourses({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildCourseWhere({
    clientAdminId,
    search: query.search,
  });


  const [data, total] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        courseFeeStructure: {
          include: {
            installments: true, // 👈 return ALL installment details
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
