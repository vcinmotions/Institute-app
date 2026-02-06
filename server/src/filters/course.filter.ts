// filters/enquiry.filter.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";
import { titleCase } from "../utils/Normalize";

type CourseWhere = NonNullable<
  Parameters<PrismaClient["course"]["findMany"]>[0]
>["where"];

export function buildCourseWhere({
  clientAdminId,
  search,
  createdAt,
}: {
  clientAdminId: string; // ✅ matches schema
  search?: string;
  createdAt?: string;
}): CourseWhere {

  const where: CourseWhere = {
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
