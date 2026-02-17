// filters/enquiry.filter.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";
import { titleCase } from "../utils/Normalize";

type TaskWhere = NonNullable<
  Parameters<PrismaClient["task"]["findMany"]>[0]
>["where"];

export function buildSTaskWhere({
  clientAdminId,
  search,
  createdAt,
}: {
  clientAdminId: string; // ✅ matches schema
  search?: string;
  createdAt?: string;
}): TaskWhere {

  const where: TaskWhere = {
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
