// services/enquiry.service.ts

import { buildEnquiryWhere } from "../filters/enquiry.filter";
import { buildEnquiryOrderBy } from "../filters/enquiry.sort";

export async function getWonEnquiries({
  prisma,
  clientAdminId,
  query,
}: any) {
  const skip = (query.page - 1) * query.limit;

  const where = buildEnquiryWhere({
    clientAdminId,
    search: query.search,
    courseId: query.courseId,
    createdDate: query.createdDate,
  });

  const orderBy = buildEnquiryOrderBy(
    query.sortField,
    query.sortOrder
  );

  const [data, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      where: {
        ...where,
        isConverted: true,
        studentId: null,
      },
      orderBy,
      skip,
      take: query.limit,
      include: {
        enquiryCourse: { include: { course: true } },
      },
    }),
    prisma.enquiry.count({ where: {
        ...where,
        isConverted: true,
        studentId: null,
      }, }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
