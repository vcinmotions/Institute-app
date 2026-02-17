// filters/enquiry.filter.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";
import { titleCase } from "../utils/Normalize";

type StationaryWhere = NonNullable<
  Parameters<PrismaClient["stationeryItem"]["findMany"]>[0]
>["where"];

export function buildStationaryWhere({
  clientAdminId,
  search,
  createdAt,
}: {
  clientAdminId: string; // ✅ matches schema
  search?: string;
  createdAt?: string;
}): StationaryWhere {

  const where: StationaryWhere = {
    clientAdminId,
  };

  if (search) {

    const normalizeCourseName = titleCase(search);

    where.OR = [
      { name: { contains: normalizeCourseName } },
    ];
  }

  return where;
}
