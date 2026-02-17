// services/enquiry.service.ts
import { buildStationaryWhere } from "../filters/stationary.filter";

export async function getStationaries({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildStationaryWhere({
    clientAdminId,
    search: query.search,
  });


  const [data, total] = await prisma.$transaction([
    prisma.stationeryItem.findMany({
      where,
      skip,
      take: query.limit,
    }),
    prisma.stationeryItem.count({ where }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
