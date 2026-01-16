import { z } from "zod";

export const studentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortField: z.enum(["admissionDate"]).default("admissionDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  courseId: z.coerce.number().optional(),
  admissionDate: z.string().optional(),
});