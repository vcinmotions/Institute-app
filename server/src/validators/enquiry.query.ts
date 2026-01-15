import { z } from "zod";

export const enquiryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sortField: z.enum(["createdAt", "srNo", "leadStatus"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  leadStatus: z.enum(["HOT", "WARM", "COLD", "WON", "LOST", "HOLD"]).optional(),
  courseId: z.coerce.number().optional(),
  createdDate: z.string().optional(),
});