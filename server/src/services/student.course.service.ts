// services/enquiry.service.ts

import { PrismaClient } from "../../prisma-client/generated/tenant";
import { z } from "zod";
import { buildStudentCourseWhere } from "../filters/student.course.filter";
import { buildStudentCoursesOrderBy } from "../filters/student.course.sort";
import { studentCourseQuerySchema } from "../validators/student.course.query";

type StudentCourseQuery = z.infer<typeof studentCourseQuerySchema>;

export async function getStudentsCourses({
  prisma,
  clientAdminId,
  query,
}: {
  prisma: PrismaClient;
  clientAdminId: string;
  query: StudentCourseQuery;
}) {
  const skip = (query.page - 1) * query.limit;

  const where = buildStudentCourseWhere({
    clientAdminId,
    search: query.search,
    courseId: query.courseId,
    batchId: query.batchId,
    facultyId: query.facultyId,
  });

  const orderBy = buildStudentCoursesOrderBy(
    query.sortField,
    query.sortOrder
  );

  const [studentCourses, total] = await prisma.$transaction([
    prisma.studentCourse.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: {
        student: {
          include: {
            attendance: {
              include: {
                course: true,
                markedBy: true,
              },
            },
          },
        },
        course: true,
        certificate: true,
        completions: true,
        batch: {
          include: {
            faculty: true,
            labTimeSlot: true,
          },
        },
      },
    }),
    prisma.studentCourse.count({ where }),
  ]);

  // ✅ Fee enrichment
  const detailedCourses = await Promise.all(
    studentCourses.map(async (sc) => {
      const feeStructure = await prisma.feeStructure.findUnique({
        where: {
          studentId_courseId: {
            studentId: sc.studentId,
            courseId: sc.courseId,
          },
        },
      });

      const feeRecords = await prisma.studentFee.findMany({
        where: {
          studentId: sc.studentId,
          courseId: sc.courseId,
        },
      });

      return {
        studentCourse: sc,
        feeStructure,
        feeRecords,
      };
    })
  );

  return {
    data: studentCourses,
    detailedCourses,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}