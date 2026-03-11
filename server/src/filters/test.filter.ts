// filters/enquiry.filter.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";
import { titleCase } from "../utils/Normalize";

type TestWhere = NonNullable<
  Parameters<PrismaClient["test"]["findMany"]>[0]
>["where"];

export function buildTestWhere({
  clientAdminId,
  search,
  createdAt,
}: {
  clientAdminId: string; // ✅ matches schema
  search?: string;
  createdAt?: string;
}): TestWhere {

  const where: TestWhere = {
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
