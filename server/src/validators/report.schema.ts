import { z } from "zod";

export const reportQuerySchema = z.object({
  reportType: z.enum(["ENQUIRIES", "FINANCE", "STUDENTS"]),
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
    
  // Deep Filters
  sourceId: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  courseId: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  batchId: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  financeStatus: z.enum(["ALL", "PAID", "OUTSTANDING"]).optional(),
});