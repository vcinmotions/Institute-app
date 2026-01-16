// services/enquiry.service.ts

import { buildBatchWhere } from "../filters/batch.filter";

export async function getBatches({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildBatchWhere({
    clientAdminId,
    search: query.search,
  });


  const [data, total] = await prisma.$transaction([
    prisma.batch.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        faculty: true,
        studentCourses: {
          include: {
            student: true,
            course: true,
          },
        },
        batchCourses: {
          include: {
            course: true,
            batch: true,
          },
        },
        labTimeSlot: {
          include: {
            lab: true
          }
        },
      },
    }),
    prisma.batch.count({ where }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
