// services/enquiry.service.ts
import { includes } from "zod";
import { buildSTaskWhere } from "../filters/task.filter";

export async function getTasks({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildSTaskWhere({
    clientAdminId,
    search: query.search,
  });


  const [data, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        batch: true,
        course: true,
      }
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
