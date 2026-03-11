// services/enquiry.service.ts
import { buildTestWhere } from "../filters/test.filter";

export async function getTests({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildTestWhere({
    clientAdminId,
    search: query.search,
  });


  const [data, total] = await prisma.$transaction([
    prisma.test.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        batch: true,
        course: true,
      }
    }),
    prisma.test.count({ where }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
