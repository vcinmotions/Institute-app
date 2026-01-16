import { z } from "zod";

export const studentCourseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortField: z.enum(["startDate", "endDate"]).default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  courseId: z.coerce.number().optional(),
  batchId: z.coerce.number().optional(),
  facultyId: z.coerce.number().optional(),
});
