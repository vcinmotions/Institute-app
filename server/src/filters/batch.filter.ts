// filters/enquiry.filter.ts
import { PrismaClient } from "../../prisma-client/generated/tenant";

type BatchWhere = NonNullable<
  Parameters<PrismaClient["batch"]["findMany"]>[0]
>["where"];

export function buildBatchWhere({
  clientAdminId,
  search,
  createdAt,
}: {
  clientAdminId: string; // ✅ matches schema
  search?: string;
  createdAt?: string;
}): BatchWhere {

  const where: BatchWhere = {
    clientAdminId,
  };

  if (search) {
    const numeric = Number(search);
    where.OR = [
      { name: { contains: search } },
    ];
  }

  return where;
}
